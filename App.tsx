import React, { useState, useEffect } from 'react';
import { Role, Lead, Visitor, Student, Payment, Attendance, Teacher, GroupClass, Expense, Campaign, Report, InventoryItem, Applicant, User, Notification } from './types';
import { ROLES } from './constants';
import { mockLeads, mockVisitors, mockStudents, mockPayments, mockAttendance, mockTeachers, mockGroupClasses, mockExpenses, mockCampaigns, mockReports, mockInventory, mockApplicants, mockUsers } from './data/mockData';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminView from './views/AdminView';
import DirectorView from './views/DirectorView';
import MarketerView from './views/MarketerView';
import HeadTrainerView from './views/HeadTrainerView';
import AgentView from './views/AgentView';
import TeacherView from './views/TeacherView';
import SettingsView from './views/SettingsView';
import ReportsView from './views/ReportsView';
import AIView from './views/AIView';
import LoginView from './views/LoginView';

const App: React.FC = () => {
  const { user: loggedInUser, loading, signIn, signOut } = useAuth();
  const [activeView, setActiveView] = useState<Role | null>(null);

  // Centralized state for all application data
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>(mockGroupClasses);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Effect to set the initial view when a user logs in
  useEffect(() => {
    if (loggedInUser) {
      setActiveView(loggedInUser.role);
    } else {
      setActiveView(null);
    }
  }, [loggedInUser]);


  // Effect to generate notifications
  useEffect(() => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Late payment notifications
    students.forEach(student => {
        if (student.paymentStatus === 'متأخر') {
            const message = `تذكير: دفعة الطالب ${student.studentName} متأخرة.`;
            // Add notification only if a similar unread one doesn't exist
            if (!notifications.some(n => n.message === message && !n.read)) {
                newNotifications.push({
                    id: `payment-${student.id}-${new Date().getTime()}`,
                    message,
                    type: 'payment',
                    date: new Date().toISOString(),
                    read: false,
                });
            }
        }
        
        // 2. Proactive payment due notifications
        if (student.lastPaymentDate && student.status === 'نشط' && student.paymentStatus !== 'متأخر') {
            const [day, month, year] = student.lastPaymentDate.split('/').map(Number);
            const lastPayment = new Date(year, month - 1, day);
            let nextDueDate = new Date(lastPayment);

            switch (student.subscriptionType) {
                case 'شهري': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
                case 'ربعي': nextDueDate.setMonth(nextDueDate.getMonth() + 3); break;
                case 'نصف سنوي': nextDueDate.setMonth(nextDueDate.getMonth() + 6); break;
            }

            if (nextDueDate > now && nextDueDate <= oneWeekFromNow) {
                 const dueDateString = `${nextDueDate.getDate().toString().padStart(2,'0')}/${(nextDueDate.getMonth() + 1).toString().padStart(2,'0')}/${nextDueDate.getFullYear()}`;
                 const message = `تنبيه: دفعة الطالب ${student.studentName} مستحقة قريباً بتاريخ ${dueDateString}.`;
                 if (!notifications.some(n => n.message === message && !n.read)) {
                    newNotifications.push({
                        id: `payment-due-${student.id}-${dueDateString}`,
                        message,
                        type: 'payment_due',
                        date: new Date().toISOString(),
                        read: false,
                    });
                }
            }
        }
    });

    // 3. Group capacity notifications
    groupClasses.forEach(group => {
        if (group.maxCapacity > 0) {
            const capacityRatio = group.studentsCount / group.maxCapacity;
            if (capacityRatio >= 1) {
                const message = `تنبيه: اكتملت الطاقة الاستيعابية لمجموعة ${group.name}.`;
                 if (!notifications.some(n => n.message === message && !n.read)) {
                    newNotifications.push({
                        id: `capacity-full-${group.id}-${new Date().getTime()}`,
                        message,
                        type: 'capacity',
                        date: new Date().toISOString(),
                        read: false,
                    });
                }
            } else if (capacityRatio >= 0.8) {
                const message = `تنبيه: اقتربت مجموعة ${group.name} من طاقتها الاستيعابية (${group.studentsCount}/${group.maxCapacity}).`;
                if (!notifications.some(n => n.message.startsWith(`تنبيه: اقتربت مجموعة ${group.name}`) && !n.read)) {
                     newNotifications.push({
                        id: `capacity-warning-${group.id}-${new Date().getTime()}`,
                        message,
                        type: 'capacity',
                        date: new Date().toISOString(),
                        read: false,
                    });
                }
            }
        }
    });

    if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, groupClasses]);

  const handleLogin = async (username: string, password?: string): Promise<boolean> => {
    return await signIn(username, password);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const renderView = () => {
    if (!activeView) return null;

    switch (activeView) {
      case 'ADMIN':
        return <AdminView 
                  payments={payments} setPayments={setPayments}
                  expenses={expenses} setExpenses={setExpenses}
                  teachers={teachers} setTeachers={setTeachers}
                  students={students}
                  campaigns={campaigns}
                  reports={reports}
               />;
      case 'DIRECTOR':
        return <DirectorView
                  teachers={teachers} setTeachers={setTeachers}
                  groupClasses={groupClasses} setGroupClasses={setGroupClasses}
                  payments={payments} setPayments={setPayments}
                  expenses={expenses} setExpenses={setExpenses}
                  inventory={inventory} setInventory={setInventory}
                  applicants={applicants} setApplicants={setApplicants}
                  reports={reports} setReports={setReports}
                  campaigns={campaigns}
               />;
      case 'MARKETER':
        return <MarketerView 
                  leads={leads} setLeads={setLeads} 
                  expenses={expenses} 
                  campaigns={campaigns} setCampaigns={setCampaigns} 
                  reports={reports} setReports={setReports}
                  users={users}
                />;
      case 'HEAD_TRAINER':
        return <HeadTrainerView 
                  teachers={teachers} setTeachers={setTeachers}
                  groupClasses={groupClasses} setGroupClasses={setGroupClasses}
                  students={students}
                  visitors={visitors}
                  attendance={attendance}
                  setAttendance={setAttendance}
                  reports={reports} setReports={setReports}
               />;
      case 'AGENT':
        return <AgentView 
                  visitors={visitors} setVisitors={setVisitors}
                  students={students} setStudents={setStudents}
                  attendance={attendance} setAttendance={setAttendance}
                  payments={payments} setPayments={setPayments}
                  teachers={teachers}
                  groupClasses={groupClasses}
                  reports={reports} setReports={setReports}
                  users={users}
                  loggedInUser={loggedInUser!}
               />;
      case 'TEACHER':
        return <TeacherView 
                  allGroups={groupClasses} setAllGroups={setGroupClasses}
                  allStudents={students} setAllStudents={setStudents}
                  visitors={visitors}
                  attendance={attendance}
                  setAttendance={setAttendance}
                  reports={reports} setReports={setReports}
                  loggedInUser={loggedInUser!}
               />;
      case 'REPORTS':
        return <ReportsView
                  attendance={attendance}
                  students={students}
                  teachers={teachers}
                  groupClasses={groupClasses}
                  leads={leads}
                  users={users}
                  campaigns={campaigns}
              />;
      case 'AI_INSIGHTS':
        return <AIView
                  students={students}
                  payments={payments}
                  attendance={attendance}
                  leads={leads}
                  expenses={expenses}
                  campaigns={campaigns}
               />;
      case 'SETTINGS':
        return <SettingsView users={users} setUsers={setUsers} />;
      default:
        return <div className="text-center p-8">دور غير معروف. يرجى تسجيل الخروج والمحاولة مرة أخرى.</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={loggedInUser} 
        activeView={activeView!} 
        setActiveView={setActiveView} 
        onLogout={handleLogout} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={loggedInUser}
            activeView={activeView!}
            notifications={notifications}
            setNotifications={setNotifications}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;