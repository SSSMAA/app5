import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Role, Lead, Visitor, Student, Payment, Attendance, Teacher, GroupClass, Expense, Campaign, Report, InventoryItem, Applicant, User, Notification } from './types';
// Keeping mock data for other parts of the UI that might still use it temporarily
import { mockLeads, mockVisitors, mockStudents, mockPayments, mockAttendance, mockTeachers, mockGroupClasses, mockExpenses, mockCampaigns, mockReports, mockInventory, mockApplicants } from './data/mockData';
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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // We no longer need the mock 'users' state.

  // This hook handles user authentication state
  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setLoggedInUser(null);
        } else if (profile) {
          setLoggedInUser(profile as User);
          setActiveView(profile.role);
        }
      } else {
        setLoggedInUser(null);
        setActiveView(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // The frontend notification logic has been removed.
  // This is now handled by the 'generate-notifications' Edge Function on the backend,
  // and notifications will be fetched from the database in a real implementation.

  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    if (!password) return false;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert("اسم المستخدم أو كلمة المرور غير صحيحة."); // Provide user-friendly error
      return false;
    }
    // onAuthStateChange will handle setting the user state
    return true;
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    // onAuthStateChange will handle setting the user state to null
  };

  const renderView = () => {
    if (!activeView || !loggedInUser) return null;

    switch (activeView) {
      case 'ADMIN':
        return <AdminView payments={payments} setPayments={setPayments} expenses={expenses} setExpenses={setExpenses} teachers={teachers} setTeachers={setTeachers} students={students} campaigns={campaigns} reports={reports} />;
      case 'DIRECTOR':
        return <DirectorView teachers={teachers} setTeachers={setTeachers} groupClasses={groupClasses} setGroupClasses={setGroupClasses} payments={payments} setPayments={setPayments} expenses={expenses} setExpenses={setExpenses} inventory={inventory} setInventory={setInventory} applicants={applicants} setApplicants={setApplicants} reports={reports} setReports={setReports} campaigns={campaigns} />;
      case 'MARKETER':
        // Assuming 'users' prop is for a dropdown, we can fetch them if needed or pass an empty array
        return <MarketerView leads={leads} setLeads={setLeads} expenses={expenses} campaigns={campaigns} setCampaigns={setCampaigns} reports={reports} setReports={setReports} users={[]} />;
      case 'HEAD_TRAINER':
        return <HeadTrainerView teachers={teachers} setTeachers={setTeachers} groupClasses={groupClasses} setGroupClasses={setGroupClasses} students={students} visitors={visitors} attendance={attendance} setAttendance={setAttendance} reports={reports} setReports={setReports} />;
      case 'AGENT':
        return <AgentView visitors={visitors} setVisitors={setVisitors} students={students} setStudents={setStudents} attendance={attendance} setAttendance={setAttendance} payments={payments} setPayments={setPayments} teachers={teachers} groupClasses={groupClasses} reports={reports} setReports={setReports} users={[]} loggedInUser={loggedInUser} />;
      case 'TEACHER':
        return <TeacherView allGroups={groupClasses} setAllGroups={setGroupClasses} allStudents={students} setAllStudents={setStudents} visitors={visitors} attendance={attendance} setAttendance={setAttendance} reports={reports} setReports={setReports} loggedInUser={loggedInUser} />;
      case 'REPORTS':
        return <ReportsView attendance={attendance} students={students} teachers={teachers} groupClasses={groupClasses} leads={leads} users={[]} campaigns={campaigns} />;
      case 'AI_INSIGHTS':
        return <AIView students={students} payments={payments} attendance={attendance} leads={leads} expenses={expenses} campaigns={campaigns} />;
      case 'SETTINGS':
        // The SettingsView might need to be adapted to fetch and update users from the 'profiles' table
        return <SettingsView users={[]} setUsers={() => {}} />;
      default:
        return <div className="text-center p-8">دور غير معروف. يرجى تسجيل الخروج والمحاولة مرة أخرى.</div>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">جاري التحميل...</div>;
  }

  if (!loggedInUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={loggedInUser} activeView={activeView!} setActiveView={setActiveView} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={loggedInUser} activeView={activeView!} notifications={notifications} setNotifications={setNotifications} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;