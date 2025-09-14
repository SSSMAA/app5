import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Define interfaces for the data we'll be working with.
// In a larger project, these might be shared types.
interface Student {
  id: string;
  student_name: string;
  payment_status: 'مدفوع' | 'متأخر' | 'معلق';
  last_payment_date: string; // ISO format string (YYYY-MM-DD)
  subscription_type: 'شهري' | 'ربعي' | 'نصف سنوي';
  status: 'نشط' | 'معلق' | 'منقطع';
}

interface GroupClass {
  id: string;
  name: string;
  students_count: number;
  max_capacity: number;
}

interface NotificationToInsert {
  message: string;
  type: 'payment' | 'capacity' | 'payment_due';
  date: string; // ISO format string
}

console.log('Generate Notifications function starting...');

serve(async (req) => {
  try {
    // Create a Supabase client using the environment variables.
    // These need to be set in the Supabase project settings.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const newNotifications: NotificationToInsert[] = [];
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // --- 1. Late Payment Notifications ---
    const { data: lateStudents, error: lateStudentsError } = await supabase
      .from('students')
      .select('student_name, payment_status')
      .eq('payment_status', 'متأخر');

    if (lateStudentsError) throw new Error(`Error fetching late students: ${lateStudentsError.message}`);

    for (const student of lateStudents as Pick<Student, 'student_name'>[]) {
      const message = `تذكير: دفعة الطالب ${student.student_name} متأخرة.`;
      newNotifications.push({ message, type: 'payment', date: now.toISOString() });
    }

    // --- 2. Upcoming Payment Due Notifications ---
    const { data: activeStudents, error: activeStudentsError } = await supabase
      .from('students')
      .select('student_name, last_payment_date, subscription_type')
      .eq('status', 'نشط')
      .neq('payment_status', 'متأخر');

    if (activeStudentsError) throw new Error(`Error fetching active students: ${activeStudentsError.message}`);

    for (const student of activeStudents as Pick<Student, 'student_name' | 'last_payment_date' | 'subscription_type'>[]) {
      if (student.last_payment_date) {
        const lastPayment = new Date(student.last_payment_date);
        const nextDueDate = new Date(lastPayment);

        switch (student.subscription_type) {
          case 'شهري': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
          case 'ربعي': nextDueDate.setMonth(nextDueDate.getMonth() + 3); break;
          case 'نصف سنوي': nextDueDate.setMonth(nextDueDate.getMonth() + 6); break;
        }

        if (nextDueDate > now && nextDueDate <= oneWeekFromNow) {
          const dueDateString = `${nextDueDate.getDate().toString().padStart(2, '0')}/${(nextDueDate.getMonth() + 1).toString().padStart(2, '0')}/${nextDueDate.getFullYear()}`;
          const message = `تنبيه: دفعة الطالب ${student.student_name} مستحقة قريباً بتاريخ ${dueDateString}.`;
          newNotifications.push({ message, type: 'payment_due', date: now.toISOString() });
        }
      }
    }

    // --- 3. Group Capacity Notifications ---
    const { data: groupClasses, error: groupClassesError } = await supabase
      .from('group_classes')
      .select('name, students_count, max_capacity');

    if (groupClassesError) throw new Error(`Error fetching group classes: ${groupClassesError.message}`);

    for (const group of groupClasses as GroupClass[]) {
      if (group.max_capacity > 0) {
        const capacityRatio = group.students_count / group.max_capacity;
        if (capacityRatio >= 1) {
          const message = `تنبيه: اكتملت الطاقة الاستيعابية لمجموعة ${group.name}.`;
          newNotifications.push({ message, type: 'capacity', date: now.toISOString() });
        } else if (capacityRatio >= 0.8) {
          const message = `تنبيه: اقتربت مجموعة ${group.name} من طاقتها الاستيعابية (${group.students_count}/${group.max_capacity}).`;
          newNotifications.push({ message, type: 'capacity', date: now.toISOString() });
        }
      }
    }

    // --- Filter out duplicates before inserting ---
    if (newNotifications.length > 0) {
      const { data: existingNotifications, error: existingErr } = await supabase
        .from('notifications')
        .select('message')
        .eq('read', false);

      if (existingErr) throw new Error(`Error fetching existing notifications: ${existingErr.message}`);

      const existingMessages = new Set(existingNotifications.map(n => n.message));

      const notificationsToInsert = newNotifications.filter(n => {
        // For capacity warnings, check if a similar warning already exists, ignoring the count in parentheses.
        if (n.type === 'capacity' && n.message.includes('اقتربت')) {
          const baseMessage = n.message.substring(0, n.message.indexOf('(')).trim();
          for(const existing of existingMessages) {
            if (existing.startsWith(baseMessage)) return false;
          }
          return true;
        }
        // For other notifications, check for an exact match.
        return !existingMessages.has(n.message);
      });

      if (notificationsToInsert.length > 0) {
        console.log(`Inserting ${notificationsToInsert.length} new notifications.`);
        const { error: insertError } = await supabase.from('notifications').insert(notificationsToInsert);
        if (insertError) throw new Error(`Error inserting notifications: ${insertError.message}`);
      } else {
        console.log('No new unique notifications to insert.');
      }
    } else {
      console.log('No potential notifications generated.');
    }

    return new Response(
      JSON.stringify({ message: 'Notification check completed successfully.' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
