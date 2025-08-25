import React, { useState, useMemo } from 'react';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import DashboardCard from '../components/DashboardCard';
import type { Attendance, Student, Teacher, GroupClass, Lead, User, Campaign } from '../types';

// Icons
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;

// A. Attendance Report Component
const AttendanceReport: React.FC<{
    attendance: Attendance[];
    students: Student[];
    teachers: Teacher[];
    groupClasses: GroupClass[];
}> = ({ attendance, students, teachers, groupClasses }) => {
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');

    const teacherGroups = useMemo(() => {
        if (!selectedTeacherId) return [];
        return groupClasses.filter(g => g.teacherId === selectedTeacherId);
    }, [selectedTeacherId, groupClasses]);

    const filteredAttendance = useMemo(() => {
        const [year, month] = selectedMonth.split('-');
        
        let result = attendance.filter(a => {
            const [, attMonth, attYear] = a.date.split('/');
            return attYear === year && attMonth === month;
        });

        if (selectedTeacherId) {
            const teacherStudentIds = new Set(students.filter(s => s.teacherId === selectedTeacherId).map(s => s.id));
            result = result.filter(a => teacherStudentIds.has(a.studentId));
        }

        if (selectedGroupId) {
            result = result.filter(a => a.groupId === selectedGroupId);
        }

        return result;
    }, [selectedMonth, selectedTeacherId, selectedGroupId, attendance, students]);
    
    const attendanceRate = useMemo(() => {
        if (filteredAttendance.length === 0) return "0.0%";
        const presentCount = filteredAttendance.filter(a => a.status === 'حاضر').length;
        return `${((presentCount / filteredAttendance.length) * 100).toFixed(1)}%`;
    }, [filteredAttendance]);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-white rounded-xl shadow-md flex items-center gap-4 flex-wrap">
                <h3 className="font-semibold text-gray-700">فلترة التقرير:</h3>
                <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 border rounded-md"/>
                <select value={selectedTeacherId} onChange={e => {setSelectedTeacherId(e.target.value); setSelectedGroupId('');}} className="p-2 border rounded-md">
                    <option value="">كل الأساتذة</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
                <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} disabled={!selectedTeacherId} className="p-2 border rounded-md">
                    <option value="">كل المجموعات</option>
                    {teacherGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
            </div>
            <DashboardCard title="متوسط نسبة الحضور" value={attendanceRate} icon={<ChartBarIcon />} color="green" />
            <DataTable
                title="سجل الحضور المفصل"
                data={filteredAttendance}
                headers={[
                    { key: 'date', label: 'التاريخ' },
                    { key: 'studentName', label: 'اسم الطالب' },
                    { key: 'status', label: 'الحالة' },
                ]}
                searchKeys={['studentName']}
            />
        </div>
    );
};

// B. Teacher Performance Report
const TeacherPerformanceReport: React.FC<{
    teachers: Teacher[];
    students: Student[];
    groupClasses: GroupClass[];
    attendance: Attendance[];
}> = ({ teachers, students, groupClasses, attendance }) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    
    const teacherData = useMemo(() => {
        if (!selectedTeacherId) return null;
        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (!teacher) return null;

        const teacherStudents = students.filter(s => s.teacherId === selectedTeacherId);
        const teacherStudentIds = new Set(teacherStudents.map(s => s.id));
        const teacherGroups = groupClasses.filter(g => g.teacherId === selectedTeacherId);
        
        const teacherAttendance = attendance.filter(a => teacherStudentIds.has(a.studentId));
        const presentCount = teacherAttendance.filter(a => a.status === 'حاضر').length;
        const attendanceRate = teacherAttendance.length > 0 ? `${((presentCount / teacherAttendance.length) * 100).toFixed(1)}%` : "N/A";

        return {
            teacher,
            studentCount: teacherStudents.length,
            groupCount: teacherGroups.length,
            attendanceRate,
            groups: teacherGroups,
            notes: teacher.performanceNotes || [],
        };
    }, [selectedTeacherId, teachers, students, groupClasses, attendance]);

    return (
         <div className="space-y-6">
            <div className="p-4 bg-white rounded-xl shadow-md flex items-center gap-4">
                <label className="font-semibold text-gray-700">اختر أستاذًا لعرض تقريره:</label>
                <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)} className="p-2 border rounded-md flex-grow">
                    <option value="">-- اختر --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
            </div>
            {teacherData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard title="عدد الطلاب" value={teacherData.studentCount} icon={<UsersIcon />} color="blue" />
                        <DashboardCard title="عدد المجموعات" value={teacherData.groupCount} icon={<LayersIcon />} color="purple" />
                        <DashboardCard title="متوسط حضور طلابه" value={teacherData.attendanceRate} icon={<CheckSquareIcon />} color="green" />
                    </div>
                    <DataTable title="المجموعات المسندة" data={teacherData.groups} headers={[{key: 'name', label: 'اسم المجموعة'}, {key: 'level', label: 'المستوى'}, {key: 'studentsCount', label: 'عدد الطلاب'}]} />
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">ملاحظات الأداء</h3>
                        {teacherData.notes.length > 0 ? (
                            <ul className="space-y-2 list-disc list-inside">
                                {teacherData.notes.map(note => <li key={note.id}><strong>{note.date}:</strong> {note.note}</li>)}
                            </ul>
                        ) : <p>لا توجد ملاحظات أداء مسجلة.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

// C. Leads Report
const LeadsReport: React.FC<{
    leads: Lead[];
    campaigns: Campaign[];
    users: User[];
}> = ({ leads, campaigns, users }) => {

    const agents = useMemo(() => users.filter(u => u.role === 'AGENT'), [users]);
    
    const performanceBySource = useMemo(() => {
        const sources: Array<'Facebook' | 'Google' | 'Instagram' | 'WhatsApp'> = ['Facebook', 'Google', 'Instagram', 'WhatsApp'];
        return sources.map(source => {
            const sourceLeads = leads.filter(l => l.source === source);
            const total = sourceLeads.length;
            const converted = sourceLeads.filter(l => l.status === 'تم التحويل').length;
            const rate = total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : '0%';
            return { id: source, source, total, converted, rate };
        });
    }, [leads]);
    
    const performanceByCampaign = useMemo(() => {
        return campaigns.map(campaign => {
            const campaignLeads = leads.filter(l => l.campaignId === campaign.id);
            const total = campaignLeads.length;
            const converted = campaignLeads.filter(l => l.status === 'تم التحويل').length;
            const rate = total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : '0%';
            return { id: campaign.id, name: campaign.name, total, converted, rate };
        });
    }, [leads, campaigns]);

    const performanceByAgent = useMemo(() => {
        return agents.map(agent => {
            const agentLeads = leads.filter(l => l.assignedAgentId === agent.id);
            const total = agentLeads.length;
            const converted = agentLeads.filter(l => l.status === 'تم التحويل').length;
            const rate = total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : '0%';
            return { id: agent.id, name: agent.fullName, total, converted, rate };
        });
    }, [leads, agents]);

    const tabs = [
        { label: 'حسب المصدر', content: <DataTable data={performanceBySource} headers={[{key: 'source', label: 'المصدر'}, {key: 'total', label: 'إجمالي العملاء'}, {key: 'converted', label: 'التحويلات'}, {key: 'rate', label: 'نسبة التحويل'}]} title="أداء حسب المصدر"/> },
        { label: 'حسب الحملة الإعلانية', content: <DataTable data={performanceByCampaign} headers={[{key: 'name', label: 'الحملة'}, {key: 'total', label: 'إجمالي العملاء'}, {key: 'converted', label: 'التحويلات'}, {key: 'rate', label: 'نسبة التحويل'}]} title="أداء حسب الحملة"/> },
        { label: 'حسب الوكيل', content: <DataTable data={performanceByAgent} headers={[{key: 'name', label: 'الوكيل'}, {key: 'total', label: 'إجمالي العملاء'}, {key: 'converted', label: 'التحويلات'}, {key: 'rate', label: 'نسبة التحويل'}]} title="أداء حسب الوكيل"/> },
    ];
    return <TabbedView tabs={tabs} />;
};


// Main View Component
interface ReportsViewProps {
    attendance: Attendance[];
    students: Student[];
    teachers: Teacher[];
    groupClasses: GroupClass[];
    leads: Lead[];
    users: User[];
    campaigns: Campaign[];
}

const ReportsView: React.FC<ReportsViewProps> = (props) => {
    const { attendance, students, teachers, groupClasses, leads, users, campaigns } = props;
    
    const tabs = [
        { label: 'تقرير الحضور الشهري', content: <AttendanceReport attendance={attendance} students={students} teachers={teachers} groupClasses={groupClasses} /> },
        { label: 'تقرير أداء الأساتذة', content: <TeacherPerformanceReport teachers={teachers} students={students} groupClasses={groupClasses} attendance={attendance} /> },
        { label: 'تقرير العملاء المحتملين', content: <LeadsReport leads={leads} campaigns={campaigns} users={users} /> },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">التقارير المتقدمة</h2>
            <TabbedView tabs={tabs} />
        </div>
    );
};

export default ReportsView;
