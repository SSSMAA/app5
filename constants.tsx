import React from 'react';
import type { Role, User } from './types';

const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const DirectorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>;
const MarketerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>;
const HeadTrainerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>;
const AgentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><circle cx="12" cy="10" r="2"></circle><line x1="8" y1="2" x2="8" y2="4"></line><line x1="16" y1="2" x2="16" y2="4"></line></svg>;
const TeacherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const AIIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit"><path d="M12 5a3 3 0 1 0-5.993.142"/><path d="M18 13a4 4 0 0 0-7.473 1.23"/><path d="M11.53 18A4 4 0 0 0 18 13"/><path d="M12 5a3 3 0 1 1 5.993.142"/><path d="M4.007 13A4 4 0 0 0 11.47 14.23"/><path d="M12.47 18A4 4 0 0 0 6 13"/><path d="M12 21a8 8 0 0 0 8-8h-2a6 6 0 0 1-6 6v2z"/><path d="M12 21a8 8 0 0 1-8-8h2a6 6 0 0 0 6 6v2z"/><path d="M12 13h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/><path d="M12 5V2"/><path d="m4.929 4.929-.828.828"/><path d="m19.071 4.929.828.828"/><path d="M2 13H0"/><path d="M24 13h-2"/></svg>;

export const ROLES: { id: Role; name: string; arabicName: string; icon: React.ReactNode }[] = [
  { id: 'ADMIN', name: 'Admin', arabicName: 'المدير العام', icon: <AdminIcon /> },
  { id: 'DIRECTOR', name: 'Director', arabicName: 'المدير التنفيذي', icon: <DirectorIcon /> },
  { id: 'MARKETER', name: 'Marketer', arabicName: 'مسؤول التسويق', icon: <MarketerIcon /> },
  { id: 'HEAD_TRAINER', name: 'Head Trainer', arabicName: 'مسؤول التدريب', icon: <HeadTrainerIcon /> },
  { id: 'AGENT', name: 'Agent', arabicName: 'وكيل خدمة العملاء', icon: <AgentIcon /> },
  { id: 'TEACHER', name: 'Teacher', arabicName: 'الأستاذ', icon: <TeacherIcon /> },
  { id: 'REPORTS', name: 'Reports', arabicName: 'التقارير المتقدمة', icon: <ReportsIcon /> },
  { id: 'AI_INSIGHTS', name: 'AI Insights', arabicName: 'الذكاء الاصطناعي', icon: <AIIcon /> },
  { id: 'SETTINGS', name: 'Settings', arabicName: 'الإعدادات', icon: <SettingsIcon /> },
];

export const PRIVILEGES = {
    AGENT: [
        { id: 'agent:manage_visitors', label: 'إدارة الزوار' },
        { id: 'agent:manage_students', label: 'إدارة الطلاب' },
        { id: 'agent:manage_payments', label: 'إدارة المدفوعات' },
    ],
    TEACHER: [
        { id: 'teacher:manage_groups', label: 'إدارة المجموعات' },
        { id: 'teacher:manage_attendance', label: 'تسجيل الحضور' },
    ],
    HEAD_TRAINER: [
        { id: 'head_trainer:manage_teachers', label: 'إدارة الأساتذة' },
        { id: 'head_trainer:view_all_groups', label: 'عرض كل المجموعات' },
        { id: 'head_trainer:manage_curriculum', label: 'إدارة المناهج' },
    ],
    MARKETER: [
        { id: 'marketer:manage_leads', label: 'إدارة العملاء المحتملين' },
        { id: 'marketer:manage_campaigns', label: 'إدارة الحملات الإعلانية' },
        { id: 'marketer:view_reports', label: 'عرض التقارير' },
    ],
    DIRECTOR: [
        { id: 'director:view_dashboard', label: 'عرض لوحة التحكم الرئيسية' },
        { id: 'director:manage_hr', label: 'إدارة الموارد البشرية' },
        { id: 'director:manage_finances', label: 'إدارة الشؤون المالية' },
        { id: 'director:manage_inventory', label: 'إدارة المخزون' },
    ],
    ADMIN: [
        { id: 'admin:view_all_data', label: 'عرض جميع البيانات' },
        { id: 'admin:manage_finances', label: 'إدارة الشؤون المالية الكاملة' },
        { id: 'admin:manage_users', label: 'إدارة المستخدمين' },
    ],
};

const ALL_VIEWS: Role[] = ['ADMIN', 'DIRECTOR', 'MARKETER', 'HEAD_TRAINER', 'AGENT', 'TEACHER', 'REPORTS', 'AI_INSIGHTS', 'SETTINGS'];

export const MENU_PERMISSIONS: Record<User['role'], Role[]> = {
    ADMIN: ALL_VIEWS,
    MARKETER: ALL_VIEWS, // As requested, Marketer sees everything like Admin
    DIRECTOR: ALL_VIEWS.filter(role => role !== 'ADMIN'),
    HEAD_TRAINER: ALL_VIEWS.filter(role => role !== 'MARKETER'),
    AGENT: ['AGENT', 'REPORTS', 'AI_INSIGHTS'], // Sensible default
    TEACHER: ['TEACHER', 'REPORTS'], // Sensible default
};