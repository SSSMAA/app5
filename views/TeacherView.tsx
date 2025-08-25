import React, { useState, useMemo, useEffect } from 'react';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import DashboardCard from '../components/DashboardCard';
import type { GroupClass, Student, Visitor, Attendance, Report, Role, User } from '../types';

const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
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

const AttendanceGrid: React.FC<{
    groups: GroupClass[];
    students: Student[];
    visitors: Visitor[];
    allAttendance: Attendance[];
    onAttendanceChange: (studentId: string, date: string, status: 'حاضر' | 'غائب') => void;
}> = ({ groups, students, visitors, allAttendance, onAttendanceChange }) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups.length > 0 ? groups[0].id : null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const roster = useMemo(() => {
        if (!selectedGroupId) return [];
        const groupStudents = students.filter(s => s.groupId === selectedGroupId)
            .map(s => ({ id: s.id, name: s.studentName, isTrial: false }));
        
        const trialVisitors = visitors.filter(v => v.groupId === selectedGroupId && (v.trialStatus === 'حضر' || v.trialStatus === 'مجدولة'))
            .map(v => ({ id: v.id, name: v.studentName, isTrial: true }));
        
        const registeredNames = new Set(groupStudents.map(s => s.name));
        const uniqueTrialVisitors = trialVisitors.filter(v => !registeredNames.has(v.name));

        return [...groupStudents, ...uniqueTrialVisitors].sort((a,b) => a.name.localeCompare(b.name));
    }, [selectedGroupId, students, visitors]);

    const dates = useMemo(() => {
        if (!selectedGroupId) return [];
        const selectedGroup = groups.find(g => g.id === selectedGroupId);
        if (!selectedGroup || !selectedGroup.weekdays) return [];

        const weekdayMap: { [key: string]: number } = {
            'الأحد': 0, 'الإثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
        };
        const scheduledDays = selectedGroup.weekdays.split(',').map(day => weekdayMap[day.trim()]).filter(day => day !== undefined);
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const datesInMonth: string[] = [];
        const dateIterator = new Date(year, month, 1);

        while (dateIterator.getMonth() === month) {
            if (scheduledDays.includes(dateIterator.getDay())) {
                const day = String(dateIterator.getDate()).padStart(2, '0');
                const monthStr = String(month + 1).padStart(2, '0');
                datesInMonth.push(`${day}/${monthStr}/${year}`);
            }
            dateIterator.setDate(dateIterator.getDate() + 1);
        }
        return datesInMonth;
    }, [selectedGroupId, groups, currentDate]);

    const handleCheckboxChange = (studentId: string, date: string, isChecked: boolean) => {
        const newStatus = isChecked ? 'حاضر' : 'غائب';
        onAttendanceChange(studentId, date, newStatus);
    };
    
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }

    if (groups.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">ليس لديك أي مجموعات لعرضها. يرجى إضافة مجموعة أولاً.</p>
            </div>
        );
    }

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4">
              <div>
                  <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">اختر مجموعة</label>
                  <select 
                      id="group-select"
                      value={selectedGroupId || ''} 
                      onChange={e => setSelectedGroupId(e.target.value)}
                      className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                      {groups.map(group => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                  </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-100" title="الشهر السابق">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <h4 className="font-semibold text-lg text-gray-700 w-32 text-center">{currentDate.toLocaleString('ar', { month: 'long', year: 'numeric', calendar: 'gregory' })}</h4>
                <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100" title="الشهر التالي">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-center text-gray-600 border-collapse">
                  <thead className="bg-green-600 text-white">
                      <tr>
                          <th className="sticky right-0 bg-green-700 p-4 z-10 text-right min-w-[200px]">اسم الطالب</th>
                          {dates.map(date => (
                              <th key={date} className="p-4 min-w-[100px] whitespace-nowrap">{date}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                      {roster.map((student, index) => {
                           const rowClass = student.isTrial
                              ? 'bg-teal-100 hover:bg-teal-200'
                              : index % 2 === 0 ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-white hover:bg-gray-50';
                          
                          return (
                              <tr key={student.id} className={rowClass}>
                                  <td className="sticky right-0 p-4 font-semibold text-gray-800 text-right whitespace-nowrap z-10" style={{ backgroundColor: 'inherit' }}>
                                      {student.name}
                                  </td>
                                  {dates.map(date => {
                                      const record = allAttendance.find(a => a.studentId === student.id && a.date === date);
                                      const isChecked = record?.status === 'حاضر';
                                      return (
                                          <td key={`${student.id}-${date}`} className="p-4">
                                              <input 
                                                  type="checkbox"
                                                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                  checked={isChecked}
                                                  onChange={e => handleCheckboxChange(student.id, date, e.target.checked)}
                                              />
                                          </td>
                                      );
                                  })}
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
              {roster.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                      لا يوجد طلاب في هذه المجموعة.
                  </div>
              )}
          </div>
      </div>
  );
};


interface TeacherViewProps {
    allGroups: GroupClass[];
    setAllGroups: React.Dispatch<React.SetStateAction<GroupClass[]>>;
    allStudents: Student[];
    setAllStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    visitors: Visitor[];
    attendance: Attendance[];
    setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    loggedInUser: User;
}

const TeacherView: React.FC<TeacherViewProps> = ({ allGroups, setAllGroups, allStudents, setAllStudents, visitors, attendance, setAttendance, reports, setReports, loggedInUser }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; type?: 'addGroup' | 'editGroup' | 'deleteGroup' | 'addStudent' | 'editStudent' | 'deleteStudent'; data?: any }>({ isOpen: false });
    const [formData, setFormData] = useState<any>({});
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; group: GroupClass | null }>({ isOpen: false, group: null });

    const teacherId = loggedInUser.id;

    const myGroups = useMemo(() => allGroups.filter(g => g.teacherId === teacherId), [allGroups, teacherId]);
    const myGroupIds = useMemo(() => new Set(myGroups.map(g => g.id)), [myGroups]);
    const myStudents = useMemo(() => allStudents.filter(s => myGroupIds.has(s.groupId)), [allStudents, myGroupIds]);
    
    const totalStudents = myStudents.length;
    const activeGroups = myGroups.filter(g => g.status === 'نشط').length;
    const averageAttendance = useMemo(() => {
        const myStudentIds = new Set(myStudents.map(s => s.id));
        const relevantAttendance = attendance.filter(a => myStudentIds.has(a.studentId));
        if (relevantAttendance.length === 0) return '0%';
        const presentCount = relevantAttendance.filter(a => a.status === 'حاضر').length;
        const rate = (presentCount / relevantAttendance.length) * 100;
        return `${rate.toFixed(1)}%`;
    }, [myStudents, attendance]);

    const openModal = (type: typeof modal.type, data?: any) => {
        setFormData(data || {});
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => setModal({ isOpen: false });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        switch (modal.type) {
            case 'addGroup':
                setAllGroups(prev => [...prev, { ...formData, id: `G${Date.now()}`, teacherId: teacherId, teacherName: loggedInUser.fullName }]);
                break;
            case 'editGroup':
                setAllGroups(prev => prev.map(g => g.id === modal.data.id ? { ...modal.data, ...formData } : g));
                break;
            case 'addStudent':
                 setAllStudents(prev => [...prev, { ...formData, id: `S${Date.now()}` }]);
                break;
            case 'editStudent':
                setAllStudents(prev => prev.map(s => s.id === modal.data.id ? { ...modal.data, ...formData } : s));
                break;
        }
        closeModal();
    };

    const handleDelete = () => {
        switch (modal.type) {
            case 'deleteGroup':
                setAllGroups(prev => prev.filter(g => g.id !== modal.data.id));
                break;
            case 'deleteStudent':
                 setAllStudents(prev => prev.filter(s => s.id !== modal.data.id));
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

    const handleAttendanceChange = (studentId: string, date: string, status: 'حاضر' | 'غائب') => {
        setAttendance(prevAttendance => {
            const student = allStudents.find(s => s.id === studentId);
            const visitor = visitors.find(v => v.id === studentId);
            const groupId = student?.groupId || visitor?.groupId;
            const studentName = student?.studentName || visitor?.studentName;

            if (!groupId || !studentName) return prevAttendance;
            
            const updatedAttendance = [...prevAttendance];
            const existingIndex = updatedAttendance.findIndex(a => a.studentId === studentId && a.date === date);

            if (existingIndex !== -1) {
                updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], status };
            } else {
                const newRecord: Attendance = {
                    id: `A-${studentId}-${date}-${Math.random()}`,
                    date,
                    studentId,
                    studentName,
                    groupId,
                    status,
                    attendanceRate: 0,
                };
                updatedAttendance.push(newRecord);
            }
            return updatedAttendance;
        });
    };

    const groupHeaders: { key: keyof GroupClass; label: string }[] = [ { key: 'name', label: 'اسم المجموعة' }, { key: 'level', label: 'المستوى' }, { key: 'studentsCount', label: 'عدد الطلاب' }, { key: 'weekdays', label: 'الأيام' }, { key: 'startTime', label: 'وقت البدء' }];
    const studentHeaders: { key: keyof Student; label: string }[] = [ { key: 'studentName', label: 'اسم الطالب' }, { key: 'age', label: 'العمر' }, { key: 'level', label: 'المستوى' }, { key: 'status', label: 'الحالة' }, { key: 'groupId', label: 'المجموعة' }];

    const groupCustomActions = [
        { icon: <ClipboardListIcon />, onClick: (item: GroupClass) => setAttendanceModal({ isOpen: true, group: item }), title: 'تسجيل الحضور' }
    ];

    const tabs = [
        { label: 'مجموعاتي', content: <DataTable<GroupClass> 
            title="المجموعات الخاصة بي" data={myGroups} headers={groupHeaders}
            searchKeys={['name']}
            filters={[{key: 'level', label: 'المستوى'}, {key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addGroup')} onEdit={(item) => openModal('editGroup', item)} onDelete={(item) => openModal('deleteGroup', item)}
            customActions={groupCustomActions}
        /> },
        { label: 'طلابي', content: <DataTable<Student> 
            title="الطلاب في مجموعاتي" data={myStudents} headers={studentHeaders}
            searchKeys={['studentName']}
            filters={[{key: 'level', label: 'المستوى'}, {key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addStudent')} onEdit={(item) => openModal('editStudent', item)} onDelete={(item) => openModal('deleteStudent', item)}
        /> },
        { label: 'الحضور', content: <AttendanceGrid 
            groups={myGroups} 
            students={myStudents} 
            visitors={visitors} 
            allAttendance={attendance} 
            onAttendanceChange={handleAttendanceChange} 
        /> }
    ];

    const getModalTitle = () => {
        switch (modal.type) {
            case 'addGroup': return 'إضافة مجموعة جديدة';
            case 'editGroup': return 'تعديل بيانات المجموعة';
            case 'deleteGroup': return 'حذف المجموعة';
            case 'addStudent': return 'إضافة طالب جديد';
            case 'editStudent': return 'تعديل بيانات الطالب';
            case 'deleteStudent': return 'حذف الطالب';
            default: return '';
        }
    };

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
                {(modal.type === 'addGroup' || modal.type === 'editGroup') && <>
                    <div><label>اسم المجموعة</label><input name="name" value={formData.name || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label>المستوى</label><select name="level" value={formData.level || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="مبتدئ">مبتدئ</option><option value="متوسط">متوسط</option><option value="متقدم">متقدم</option></select></div>
                    <div><label>الأيام</label><input name="weekdays" value={formData.weekdays || ''} placeholder="الإثنين,الأربعاء" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label>وقت البدء</label><input name="startTime" value={formData.startTime || ''} placeholder="17:00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                </>}
                {(modal.type === 'addStudent' || modal.type === 'editStudent') && <>
                    <div><label>اسم الطالب</label><input name="studentName" value={formData.studentName || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label>المجموعة</label><select name="groupId" value={formData.groupId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required><option value="">اختر</option>{myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                    <div><label>العمر</label><input type="number" name="age" value={formData.age || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label>المستوى</label><select name="level" value={formData.level || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="مبتدئ">مبتدئ</option><option value="متوسط">متوسط</option><option value="متقدم">متقدم</option></select></div>
                </>}
                <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">حفظ</button>
                </div>
            </form>
        );
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">لوحة تحكم الأستاذ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="إجمالي الطلاب" value={totalStudents} icon={<UsersIcon />} color="purple" />
                <DashboardCard title="المجموعات النشطة" value={activeGroups} icon={<LayersIcon />} color="blue" />
                <DashboardCard title="متوسط الحضور" value={averageAttendance} icon={<CheckSquareIcon />} color="green" />
            </div>
            <TabbedView tabs={tabs} />
            <Modal isOpen={modal.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
            <AttendanceModal
                isOpen={attendanceModal.isOpen}
                onClose={() => setAttendanceModal({ isOpen: false, group: null })}
                group={attendanceModal.group}
                students={allStudents}
                visitors={visitors}
                attendance={attendance}
                onSave={handleSaveAttendance}
            />
            <ReportUploader role="TEACHER" roleName="الأستاذ" reports={reports} setReports={setReports} />
        </div>
    );
};

export default TeacherView;
