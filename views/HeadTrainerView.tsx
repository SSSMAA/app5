import React, { useState, useMemo, useEffect } from 'react';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import DashboardCard from '../components/DashboardCard';
import Modal from '../components/Modal';
import type { Teacher, GroupClass, Student, Visitor, Attendance, Report, Role } from '../types';

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;

// Helper to format YYYY-MM-DD to DD/MM/YYYY
const fromInputDate = (dateStr: string): string => {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const ReportUploader: React.FC<{
    role: Role;
    roleName: string;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
}> = ({ role, roleName, reports, setReports }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ title: string; description: string; file?: File | null }>({ title: '', description: '', file: null });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      alert('يرجى إدخال عنوان ورفع ملف.');
      return;
    }

    const newReport: Report = {
      id: `R${Date.now()}`,
      title: formData.title,
      description: formData.description,
      fileName: formData.file.name,
      uploadDate: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'), // DD/MM/YYYY
      uploadedBy: role,
      uploadedByName: roleName,
    };

    setReports(prev => [...prev, newReport]);
    setIsModalOpen(false);
    setFormData({ title: '', description: '', file: null });
  };
  
  const roleReports = reports.filter(r => r.uploadedBy === role);

  return (
    <div className="bg-white rounded-xl shadow-md mt-8">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-bold text-gray-800">تقارير المدير العام</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7V21"/><path d="m6 13 6-6 6 6"/><path d="M19 3H5"/></svg>
          <span>رفع تقرير جديد</span>
        </button>
      </div>
      <div className="p-6">
        {roleReports.length > 0 ? (
          <ul className="space-y-3">
            {roleReports.slice(-3).reverse().map(report => ( 
              <li key={report.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-700">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.fileName} - {report.uploadDate}</p>
                </div>
                <span className="text-sm font-medium text-green-700">تم الرفع</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">لم يتم رفع أي تقارير من هذا القسم بعد.</p>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="رفع تقرير جديد للمدير العام">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">عنوان التقرير</label>
            <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">وصف موجز</label>
            <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">اختر ملف</label>
            <input type="file" name="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">رفع التقرير</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: GroupClass | null;
    students: Student[];
    visitors: Visitor[];
    attendance: Attendance[];
    onSave: (records: Partial<Attendance>[]) => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, group, students, visitors, attendance, onSave }) => {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [sessionNotes, setSessionNotes] = useState('');
    const [studentStatuses, setStudentStatuses] = useState<Map<string, 'حاضر' | 'غائب'>>(new Map());

    const roster = useMemo(() => {
        if (!group) return [];
        const registered = students.filter(s => s.groupId === group.id).map(s => ({ id: s.id, name: s.studentName, isTrial: false }));
        const trial = visitors
            .filter(v => v.groupId === group.id && (v.trialStatus === 'مجدولة' || v.trialStatus === 'حضر'))
            .map(v => ({ id: v.id, name: v.studentName, isTrial: true }));
        
        const registeredIds = new Set(registered.map(r => r.name));
        const uniqueTrials = trial.filter(t => !registeredIds.has(t.name));

        return [...registered, ...uniqueTrials];
    }, [group, students, visitors]);

    useEffect(() => {
        if (isOpen && group) {
            const formattedDate = fromInputDate(attendanceDate);
            const newStatuses = new Map<string, 'حاضر' | 'غائب'>();
            let notes = '';

            roster.forEach(person => {
                const attendanceRecord = attendance.find(a => a.date === formattedDate && a.studentId === person.id);
                if (attendanceRecord) {
                    newStatuses.set(person.id, attendanceRecord.status);
                    if (attendanceRecord.notes) {
                        notes = attendanceRecord.notes;
                    }
                } else {
                    newStatuses.set(person.id, 'غائب'); // Default to absent
                }
            });

            setStudentStatuses(newStatuses);
            setSessionNotes(notes);
        }
    }, [attendanceDate, roster, attendance, isOpen, group]);

    const handleStatusChange = (studentId: string, status: 'حاضر' | 'غائب') => {
        setStudentStatuses(prev => new Map(prev).set(studentId, status));
    };
    
    const handleMarkAllPresent = () => {
        const newStatuses = new Map<string, 'حاضر' | 'غائب'>();
        roster.forEach(person => {
            newStatuses.set(person.id, 'حاضر');
        });
        setStudentStatuses(newStatuses);
    };

    const handleSave = () => {
        if (!group) return;
        const records: Partial<Attendance>[] = roster.map(person => ({
            date: fromInputDate(attendanceDate),
            studentId: person.id,
            studentName: person.name,
            groupId: group.id,
            status: studentStatuses.get(person.id) || 'غائب',
            notes: sessionNotes,
        }));
        onSave(records);
    };

    if (!isOpen || !group) return null;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تسجيل حضور مجموعة: ${group.name}`}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="attendance-date" className="block text-sm font-medium text-gray-700">تاريخ الحصة</label>
                        <input type="date" id="attendance-date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="session-notes" className="block text-sm font-medium text-gray-700">ملاحظات الحصة</label>
                         <textarea id="session-notes" value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="أضف ملاحظات عن هذه الحصة..."></textarea>
                    </div>
                </div>

                <div className="flex justify-start">
                    <button onClick={handleMarkAllPresent} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition">
                       تحديد الكل كـ "حاضر"
                    </button>
                </div>

                <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-3">
                    {roster.map(person => {
                        const status = studentStatuses.get(person.id);
                        const isPresent = status === 'حاضر';
                        const isAbsent = status === 'غائب';
                        const cardClasses = person.isTrial 
                            ? 'bg-teal-50 border-teal-200' 
                            : 'bg-white border-gray-200';

                        return (
                             <div key={person.id} className={`p-3 border rounded-lg shadow-sm flex items-center justify-between ${cardClasses}`}>
                                <div>
                                    <p className="font-semibold text-gray-800">{person.name}</p>
                                    {person.isTrial && <span className="text-xs font-bold text-teal-700 uppercase">حصة تجريبية</span>}
                                </div>
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleStatusChange(person.id, 'حاضر')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${isPresent ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                     >
                                        حاضر
                                     </button>
                                     <button 
                                        onClick={() => handleStatusChange(person.id, 'غائب')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${isAbsent ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        غائب
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t mt-2">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">إلغاء</button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">حفظ الحضور</button>
                </div>
            </div>
        </Modal>
    );
};


interface HeadTrainerViewProps {
    teachers: Teacher[];
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    groupClasses: GroupClass[];
    setGroupClasses: React.Dispatch<React.SetStateAction<GroupClass[]>>;
    students: Student[];
    visitors: Visitor[];
    attendance: Attendance[];
    setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
}

type DisplayStudent = Student & { teacherName: string };

const HeadTrainerView: React.FC<HeadTrainerViewProps> = ({ teachers, setTeachers, groupClasses, setGroupClasses, students, visitors, attendance, setAttendance, reports, setReports }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; type?: 'addTeacher' | 'editTeacher' | 'deleteTeacher' | 'addGroup' | 'editGroup' | 'deleteGroup'; data?: any }>({ isOpen: false });
    const [formData, setFormData] = useState<any>({});
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; group: GroupClass | null }>({ isOpen: false, group: null });
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    
    const openModal = (type: typeof modal.type, data?: any) => {
        setFormData(data || {});
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => setModal({ isOpen: false });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['experienceYears', 'salary', 'overallRating', 'studentsCount', 'maxCapacity'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        switch (modal.type) {
            case 'addTeacher':
                setTeachers(prev => [...prev, { ...formData, id: `T${Date.now()}` }]);
                break;
            case 'editTeacher':
                setTeachers(prev => prev.map(t => t.id === modal.data.id ? { ...modal.data, ...formData } : t));
                break;
            case 'addGroup':
            case 'editGroup':
                 const teacher = teachers.find(t => t.id === formData.teacherId);
                 const groupData = { ...formData, teacherName: teacher ? teacher.fullName : 'غير محدد' };
                 if (modal.type === 'addGroup') {
                    setGroupClasses(prev => [...prev, { ...groupData, id: `G${Date.now()}` }]);
                 } else {
                    setGroupClasses(prev => prev.map(g => g.id === modal.data.id ? { ...modal.data, ...groupData } : g));
                 }
                break;
        }
        closeModal();
    };

    const handleDelete = () => {
        switch (modal.type) {
            case 'deleteTeacher':
                setTeachers(prev => prev.filter(t => t.id !== modal.data.id));
                break;
            case 'deleteGroup':
                 setGroupClasses(prev => prev.filter(g => g.id !== modal.data.id));
                break;
        }
        closeModal();
    };
    
    const handleSaveAttendance = (newRecords: Partial<Attendance>[]) => {
        setAttendance(prev => {
            const updatedAttendance = [...prev];
            newRecords.forEach(newRecord => {
                const existingIndex = updatedAttendance.findIndex(
                    a => a.date === newRecord.date && a.studentId === newRecord.studentId
                );
                if (existingIndex > -1) {
                    updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], ...newRecord } as Attendance;
                } else {
                    updatedAttendance.push({ ...newRecord, id: `A${Date.now()}${Math.random()}` } as Attendance);
                }
            });
            return updatedAttendance;
        });
        setAttendanceModal({ isOpen: false, group: null });
    };

    const totalTeachers = useMemo(() => teachers.length, [teachers]);
    const activeTeachers = useMemo(() => teachers.filter(t => t.status === 'نشط').length, [teachers]);
    const totalGroups = useMemo(() => groupClasses.length, [groupClasses]);
    const totalStudents = useMemo(() => students.length, [students]);
    const totalVisitors = useMemo(() => visitors.length, [visitors]);
    const averageAttendance = useMemo(() => {
        if (attendance.length === 0) return '0%';
        const totalPresent = attendance.filter(a => a.status === 'حاضر').length;
        return `${((totalPresent / attendance.length) * 100).toFixed(1)}%`;
    }, [attendance]);

    const displayStudentsWithTeacher = useMemo((): DisplayStudent[] => students.map(s => {
        const teacher = teachers.find(t => t.id === s.teacherId);
        return {
            ...s,
            teacherName: teacher ? teacher.fullName : 'غير محدد',
        };
    }), [students, teachers]);
    
    const filteredStudents = useMemo(() => {
        if (!selectedTeacherId) return displayStudentsWithTeacher;
        return displayStudentsWithTeacher.filter(s => s.teacherId === selectedTeacherId);
    }, [displayStudentsWithTeacher, selectedTeacherId]);

    const studentHeaders: { key: keyof DisplayStudent; label: string }[] = [
        { key: 'studentName', label: 'اسم الطالب' },
        { key: 'teacherName', label: 'الأستاذ' },
        { key: 'level', label: 'المستوى' },
        { key: 'status', label: 'الحالة' },
    ];
    
    const teacherHeaders: { key: keyof Teacher; label: string }[] = [
        { key: 'fullName', label: 'الاسم الكامل' }, { key: 'specialization', label: 'التخصص' }, { key: 'experienceYears', label: 'سنوات الخبرة' }, { key: 'status', label: 'الحالة' }, { key: 'overallRating', label: 'التقييم' }
    ];

    const groupHeaders: { key: keyof GroupClass; label: string }[] = [
        { key: 'name', label: 'اسم المجموعة' }, { key: 'level', label: 'المستوى' }, { key: 'teacherName', label: 'اسم الأستاذ' }, { key: 'studentsCount', label: 'عدد الطلاب' }, { key: 'status', label: 'الحالة' }
    ];

    const groupCustomActions = [
        { icon: <ClipboardListIcon />, onClick: (item: GroupClass) => setAttendanceModal({ isOpen: true, group: item }), title: 'تسجيل الحضور' }
    ];

    const tabs = [
        { label: 'إدارة الأساتذة', content: <DataTable<Teacher> 
            title="قائمة الأساتذة" data={teachers} headers={teacherHeaders}
            searchKeys={['fullName']}
            filters={[{key: 'specialization', label: 'التخصص'}, {key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addTeacher')} onEdit={(item) => openModal('editTeacher', item)} onDelete={(item) => openModal('deleteTeacher', item)}
        /> },
        { label: 'المجموعات والفصول', content: <DataTable<GroupClass> 
            title="قائمة المجموعات" data={groupClasses} headers={groupHeaders}
            searchKeys={['name', 'teacherName']}
            filters={[{key: 'level', label: 'المستوى'}, {key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addGroup')} onEdit={(item) => openModal('editGroup', item)} onDelete={(item) => openModal('deleteGroup', item)}
            customActions={groupCustomActions}
        /> },
        { 
            label: 'الطلاب', 
            content: (
                 <div>
                    <div className="p-4 bg-white rounded-t-xl border-b flex items-center gap-4">
                        <label htmlFor="teacher-filter-ht" className="font-semibold text-gray-700">فلترة حسب الأستاذ:</label>
                        <select 
                            id="teacher-filter-ht"
                            value={selectedTeacherId} 
                            onChange={e => setSelectedTeacherId(e.target.value)}
                            className="w-full md:w-auto pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">كل الأساتذة</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                        </select>
                    </div>
                    <DataTable<DisplayStudent>
                        title="قائمة جميع الطلاب"
                        data={filteredStudents}
                        headers={studentHeaders}
                        searchKeys={['studentName', 'teacherName']}
                        filters={[{key: 'status', label: 'الحالة'}]}
                    />
                </div>
            )
        },
        { label: 'المناهج والمحتوى', content: <div className="text-center p-8 bg-gray-50 rounded-lg"><p>سيتم عرض تفاصيل المناهج هنا.</p></div> },
        { label: 'تقارير التدريب', content: <div className="text-center p-8 bg-gray-50 rounded-lg"><p>سيتم عرض تقارير التدريب المفصلة هنا.</p></div> }
    ];

    const renderModalContent = () => {
        if (modal.type?.includes('delete')) {
            return (
                <div>
                    <p>هل أنت متأكد أنك تريد حذف هذا العنصر؟</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">تأكيد الحذف</button>
                    </div>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                { (modal.type === 'addTeacher' || modal.type === 'editTeacher') && <>
                    <div><label>الاسم الكامل</label><input name="fullName" value={formData.fullName || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label>التخصص</label><select name="specialization" value={formData.specialization || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="لغة عربية">لغة عربية</option><option value="رياضيات">رياضيات</option><option value="فيزياء">فيزياء</option><option value="كيمياء">كيمياء</option></select></div>
                    <div><label>سنوات الخبرة</label><input type="number" name="experienceYears" value={formData.experienceYears || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label>الراتب</label><input type="number" name="salary" value={formData.salary || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label>التقييم (1-5)</label><input type="number" name="overallRating" min="1" max="5" value={formData.overallRating || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label>الحالة</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="نشط">نشط</option><option value="معلق">معلق</option><option value="مفصول">مفصول</option></select></div>
                </>}
                 { (modal.type === 'addGroup' || modal.type === 'editGroup') && <>
                    <div><label>اسم المجموعة</label><input name="name" value={formData.name || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label>المستوى</label><select name="level" value={formData.level || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="مبتدئ">مبتدئ</option><option value="متوسط">متوسط</option><option value="متقدم">متقدم</option></select></div>
                    <div><label>الأستاذ</label>
                        <select name="teacherId" value={formData.teacherId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                            <option value="">اختر أستاذًا</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                        </select>
                    </div>
                    <div><label>الطاقة القصوى</label><input type="number" name="maxCapacity" value={formData.maxCapacity || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label>الحالة</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="نشط">نشط</option><option value="معلق">معلق</option><option value="منتهي">منتهي</option></select></div>
                </>}
                <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">حفظ</button>
                </div>
            </form>
        );
    };

    const getModalTitle = () => {
         switch (modal.type) {
            case 'addTeacher': return 'إضافة أستاذ جديد';
            case 'editTeacher': return 'تعديل بيانات الأستاذ';
            case 'deleteTeacher': return 'حذف الأستاذ';
            case 'addGroup': return 'إضافة مجموعة جديدة';
            case 'editGroup': return 'تعديل بيانات المجموعة';
            case 'deleteGroup': return 'حذف المجموعة';
            default: return '';
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">لوحة تحكم مسؤول التدريب والتعليم</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="إجمالي الأساتذة" value={totalTeachers} icon={<UsersIcon />} color="indigo" />
                <DashboardCard title="الأساتذة النشطون" value={activeTeachers} icon={<UsersIcon />} color="green" />
                <DashboardCard title="إجمالي المجموعات" value={totalGroups} icon={<UsersIcon />} color="blue" />
                <DashboardCard title="إجمالي الطلاب" value={totalStudents} icon={<UsersIcon />} color="purple" />
                <DashboardCard title="عدد الزوار" value={totalVisitors} icon={<UsersIcon />} color="yellow" />
                <DashboardCard title="متوسط الحضور" value={averageAttendance} icon={<CheckSquareIcon />} color="red" />
            </div>
            <TabbedView tabs={tabs} />
            <Modal isOpen={modal.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
            <AttendanceModal 
                isOpen={attendanceModal.isOpen}
                onClose={() => setAttendanceModal({ isOpen: false, group: null })}
                group={attendanceModal.group}
                students={students}
                visitors={visitors}
                attendance={attendance}
                onSave={handleSaveAttendance}
            />
            <ReportUploader role="HEAD_TRAINER" roleName="مسؤول التدريب" reports={reports} setReports={setReports} />
        </div>
    );
};

export default HeadTrainerView;