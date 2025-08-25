import React, { useState, useEffect, useMemo } from 'react';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Kanban from '../components/Kanban';
import DashboardCard from '../components/DashboardCard';
import type { Visitor, Student, Attendance, Payment, VisitorPipelineStatus, Teacher, GroupClass, Report, Role, User } from '../types';

interface AgentViewProps {
    visitors: Visitor[];
    setVisitors: React.Dispatch<React.SetStateAction<Visitor[]>>;
    students: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    attendance: Attendance[];
    setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    teachers: Teacher[];
    groupClasses: GroupClass[];
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    users: User[];
    loggedInUser: User;
}

const KANBAN_COLUMNS: { id: VisitorPipelineStatus; title: string }[] = [
    { id: 'جديد', title: 'جديد' },
    { id: 'تم التواصل', title: 'تم التواصل' },
    { id: 'حصة مجدولة', title: 'حصة تجريبية مجدولة' },
    { id: 'متابعة', title: 'متابعة بعد الحصة' },
    { id: 'مسجل', title: 'تم التسجيل' },
    { id: 'ملغي', title: 'ملغي' },
];

const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="M19 16.5v6"/><path d="M22 19.5h-6"/></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7V21"/><path d="m6 13 6-6 6 6"/><path d="M19 3H5"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;

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

const Receipt: React.FC<{ payment: Payment, onClose: () => void }> = ({ payment, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #receipt-to-print, #receipt-to-print * { visibility: visible; }
                    #receipt-to-print { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>
            <div id="receipt-to-print" className="p-6 bg-white text-gray-800 font-sans">
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-indigo-600">iSchoolGo</h1>
                        <p className="text-sm">Reçu de paiment</p>
                    </div>
                    <div className="text-right">
                        <p><strong>N° de reçu :</strong> {payment.id}</p>
                        <p><strong>Date de paiment :</strong> {payment.paymentDate}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p><strong>Nom Complete :</strong> {payment.studentName}</p>
                    <p><strong>Cours :</strong> {payment.courseName}</p>
                </div>
                <table className="w-full mt-6 text-sm text-right">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">Description</th>
                            <th className="p-2">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border-b">Frais monsuel</td>
                            <td className="p-2 border-b">{payment.monthlyFee.toFixed(2)} DH</td>
                        </tr>
                        <tr>
                            <td className="p-2 border-b">Remise</td>
                            <td className="p-2 border-b">-{payment.discount.toFixed(2)} DH</td>
                        </tr>
                        <tr className="font-bold">
                            <td className="p-2">Total a payé</td>
                            <td className="p-2">{payment.amount.toFixed(2)} DH</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-12 text-center">
                    <p className="text-xs text-gray-500">Centre iSchoolGo De Programmation Et Robotique Pour Enfants</p>
                </div>
            </div>
             <div className="mt-6 flex justify-end gap-4 no-print">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إغلاق</button>
                <button onClick={handlePrint} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">طباعة</button>
            </div>
        </div>
    );
};

// Date formatting utilities
const toInputDate = (dateStr?: string): string => { // DD/MM/YYYY -> YYYY-MM-DD
  if (!dateStr || !dateStr.includes('/')) return dateStr || '';
  const [day, month, year] = dateStr.split('/');
  if (day && month && year && year.length === 4) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

const fromInputDate = (dateStr?: string): string => { // YYYY-MM-DD -> DD/MM/YYYY
  if (!dateStr || !dateStr.includes('-')) return dateStr || '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
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


const AgentView: React.FC<AgentViewProps> = ({ visitors, setVisitors, students, setStudents, attendance, setAttendance, payments, setPayments, teachers, groupClasses, reports, setReports, users, loggedInUser }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; type?: string; data?: any }>({ isOpen: false });
    const [formData, setFormData] = useState<any>({});
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; group: GroupClass | null }>({ isOpen: false, group: null });
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    
    // State for payment filtering
    const [paymentMonth, setPaymentMonth] = useState(''); // YYYY-MM
    const [displayedPayments, setDisplayedPayments] = useState<Payment[]>([]);
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

    // State for student filtering
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    const agents = useMemo(() => users.filter(u => u.role === 'AGENT'), [users]);
    
    // Filter visitors for the logged-in agent
    const myVisitors = useMemo(() => {
        if (loggedInUser.role === 'ADMIN') return visitors;
        return visitors.filter(v => v.assignedAgentId === loggedInUser.id);
    }, [visitors, loggedInUser]);

    const totalVisitors = myVisitors.length;
    const totalStudents = students.length; // Agent might need to see all students for context
    const averageAttendance = useMemo(() => {
        if (attendance.length === 0) return '0%';
        const totalPresent = attendance.filter(a => a.status === 'حاضر').length;
        return `${((totalPresent / attendance.length) * 100).toFixed(1)}%`;
    }, [attendance]);

    useEffect(() => {
        if (modal.type === 'addVisitor' || modal.type === 'editVisitor') {
            const { trialDate, teacherId } = formData;
            if (trialDate && teacherId) {
                const dateObj = new Date(trialDate);
                const dayOfWeek = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });

                const teacherClassesOnDay = groupClasses.filter(gc => 
                    gc.teacherId === teacherId && gc.weekdays.includes(dayOfWeek)
                );
                
                const busySlots = teacherClassesOnDay.flatMap(gc => {
                    const start = parseInt(gc.startTime.split(':')[0], 10);
                    const end = parseInt(gc.endTime.split(':')[0], 10);
                    const slots = [];
                    for(let i = start; i < end; i++){
                        slots.push(`${String(i).padStart(2, '0')}:00`);
                    }
                    return slots;
                });
                
                const allDaySlots = Array.from({length: 10}, (_, i) => `${String(i + 9).padStart(2, '0')}:00`); // 9am to 6pm
                
                const availableSlots = allDaySlots.filter(slot => !busySlots.includes(slot));
                
                setAvailableTimeSlots(availableSlots);

                if (formData.trialTime && !availableSlots.includes(formData.trialTime)) {
                  setFormData(prev => ({...prev, trialTime: ''}));
                }

            } else {
                setAvailableTimeSlots([]);
            }
        }
    }, [formData.trialDate, formData.teacherId, modal.type, groupClasses]);


    const openModal = (type: string, data?: any) => {
        let formDataToSet = {};

        switch (type) {
            case 'addPayment':
                if (data && data.id) { // This is a student object
                    const student = data;
                    const group = groupClasses.find(g => g.id === student.groupId);
                    formDataToSet = {
                        studentId: student.id,
                        studentName: student.studentName,
                        monthlyFee: student.monthlyFee,
                        courseName: group ? group.name : 'N/A',
                        discount: 0,
                        paymentDate: new Date().toISOString().split('T')[0] // today in YYYY-MM-DD
                    };
                }
                break;
            case 'editPayment':
                 formDataToSet = { ...data, paymentDate: toInputDate(data.paymentDate) };
                break;
            case 'editVisitor':
                 formDataToSet = { ...data, trialDate: toInputDate(data.trialDate) };
                break;
            default:
                formDataToSet = data || {};
        }
        
        setFormData(formDataToSet);
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => setModal({ isOpen: false });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                setFormData(prev => ({...prev, [name]: files[0] }));
            }
        } else {
            const isNumeric = ['age', 'monthlyFee', 'discount'].includes(name);
            setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, data } = modal;
        
        let finalFormData = { ...formData };
        if (finalFormData.trialDate) {
             finalFormData.trialDate = fromInputDate(finalFormData.trialDate);
        }
        if (finalFormData.paymentDate) {
             finalFormData.paymentDate = fromInputDate(finalFormData.paymentDate);
        }
        
        switch (type) {
            case 'addVisitor': setVisitors(prev => [...prev, { ...finalFormData, id: `V${Date.now()}`, pipelineStatus: 'جديد', assignedAgentId: loggedInUser.id }]); break;
            case 'editVisitor':
                if (finalFormData.finalDecision === 'سجل') {
                    const visitorData = { ...data, ...finalFormData };
                    const newStudent: Student = {
                        id: `S${Date.now()}`,
                        studentName: visitorData.studentName,
                        parentName: visitorData.parentName,
                        phoneNumber: visitorData.phoneNumber,
                        age: visitorData.age,
                        level: visitorData.desiredLevel,
                        groupId: formData.groupId,
                        teacherId: visitorData.teacherId,
                        registrationDate: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'),
                        subscriptionType: formData.subscriptionType,
                        monthlyFee: formData.monthlyFee,
                        paymentStatus: 'معلق',
                        lastPaymentDate: '',
                        status: 'نشط'
                    };
                    setStudents(prev => [...prev, newStudent]);
                    setVisitors(prev => prev.filter(v => v.id !== data.id));
                } else {
                    setVisitors(prev => prev.map(v => v.id === data.id ? { ...data, ...finalFormData } : v));
                }
                break;
            case 'addStudent': setStudents(prev => [...prev, { ...formData, id: `S${Date.now()}` }]); break;
            case 'editStudent': setStudents(prev => prev.map(s => s.id === data.id ? { ...data, ...formData } : s)); break;
            case 'addAttendance': setAttendance(prev => [...prev, { ...formData, id: `A${Date.now()}` }]); break;
            case 'editAttendance': setAttendance(prev => prev.map(a => a.id === data.id ? { ...data, ...formData } : a)); break;
            case 'addPayment':
            case 'editPayment':
                const amount = (finalFormData.monthlyFee || 0) - (finalFormData.discount || 0);
                const paymentData = { ...finalFormData, amount };
                if (type === 'addPayment') {
                     setPayments(prev => [...prev, { ...paymentData, id: `P${Date.now()}` }]);
                } else {
                     setPayments(prev => prev.map(p => p.id === data.id ? { ...data, ...paymentData } : p));
                }
                break;
            case 'uploadReceipt':
                if (formData.file) {
                    setPayments(prev => prev.map(p => p.id === data.id ? { ...p, receiptFileName: (formData.file as File).name } : p));
                }
                break;
        }
        closeModal();
    };
    
    const handleDelete = () => {
        const { type, data } = modal;
         switch (type) {
            case 'deleteVisitor': setVisitors(prev => prev.filter(v => v.id !== data.id)); break;
            case 'deleteStudent': setStudents(prev => prev.filter(s => s.id !== data.id)); break;
            case 'deleteAttendance': setAttendance(prev => prev.filter(a => a.id !== data.id)); break;
            case 'deletePayment': setPayments(prev => prev.filter(p => p.id !== data.id)); break;
        }
        closeModal();
    };

    const handleKanbanDrop = (itemId: string, newColumnId: string) => {
        setVisitors(prev => prev.map(v => v.id === itemId ? { ...v, pipelineStatus: newColumnId as VisitorPipelineStatus } : v));
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
    
    const kanbanData = myVisitors.map(v => ({
      id: v.id,
      title: v.studentName,
      subtitle: v.phoneNumber,
      pipelineStatus: v.pipelineStatus,
      ...v
    }));

    const trialSessionVisitors = myVisitors
        .filter(v => v.trialDate)
        .map(v => ({
            ...v,
            teacherName: teachers.find(t => t.id === v.teacherId)?.fullName || 'غير محدد'
        }));
    
    const displayStudents = useMemo(() => students.map(s => {
        const group = groupClasses.find(g => g.id === s.groupId);
        const teacher = teachers.find(t => t.id === s.teacherId);
        return {
            ...s,
            groupName: group ? group.name : 'N/A',
            teacherName: teacher ? teacher.fullName : 'غير محدد'
        };
    }), [students, groupClasses, teachers]);

    const filteredStudents = useMemo(() => {
        if (!selectedTeacherId) return displayStudents;
        return displayStudents.filter(s => s.teacherId === selectedTeacherId);
    }, [displayStudents, selectedTeacherId]);

    const filteredPayments = useMemo(() => {
        if (!paymentMonth) return payments;
        const [year, month] = paymentMonth.split('-');
        return payments.filter(p => {
            const [, pMonth, pYear] = p.paymentDate.split('/');
            return pYear === year && pMonth === month;
        });
    }, [payments, paymentMonth]);
    
    const handlePaymentsFiltered = (data: Payment[], term: string) => {
        setDisplayedPayments(data);
        setPaymentSearchTerm(term);
    };

    const paymentSummary = useMemo(() => {
        if (paymentSearchTerm && displayedPayments.length > 0) {
            const total = displayedPayments.reduce((acc, p) => acc + p.amount, 0);
            return <div className="text-lg">إجمالي المدفوعات للطالب المحدد: <span className="text-green-600">{total.toLocaleString()} د.م</span></div>;
        }
        return null;
    }, [displayedPayments, paymentSearchTerm]);

    const trialAttendanceHeaders = [
        { key: 'studentName', label: 'اسم الطالب' },
        { key: 'trialDate', label: 'تاريخ الحصة' },
        { key: 'trialTime', label: 'وقت الحصة' },
        { key: 'teacherName', label: 'الأستاذ' },
        { key: 'trialStatus', label: 'حالة الحصة' },
    ];

    type DisplayStudent = Student & { groupName: string; teacherName: string };
    const studentHeaders: { key: keyof DisplayStudent; label: string }[] = [ { key: 'studentName', label: 'اسم الطالب' }, { key: 'teacherName', label: 'الأستاذ' }, { key: 'groupName', label: 'المجموعة' }, { key: 'subscriptionType', label: 'الاشتراك' }, { key: 'paymentStatus', label: 'حالة الدفع' }, { key: 'status', label: 'الحالة' }];
    const attendanceHeaders: { key: keyof Attendance; label: string }[] = [ { key: 'date', label: 'التاريخ' }, { key: 'studentName', label: 'اسم الطالب' }, { key: 'groupId', label: 'المجموعة' }, { key: 'status', label: 'الحالة' }];
    const paymentHeaders: { key: keyof Payment; label: string }[] = [ { key: 'paymentDate', label: 'تاريخ الدفع' }, { key: 'studentName', label: 'اسم الطالب' }, { key: 'amount', label: 'المبلغ' }, { key: 'method', label: 'الطريقة' }, { key: 'receiptFileName', label: 'الإيصال المرفق' }];
    const groupHeaders: { key: keyof GroupClass; label: string }[] = [ { key: 'name', label: 'اسم المجموعة' }, { key: 'teacherName', label: 'الأستاذ' }, { key: 'level', label: 'المستوى' }, { key: 'studentsCount', label: 'الطلاب' }, { key: 'status', label: 'الحالة' }];


    const paymentCustomActions = [
        { icon: <ReceiptIcon />, onClick: (item: Payment) => openModal('viewReceipt', item), title: 'عرض الإيصال' },
        { icon: <UploadIcon />, onClick: (item: Payment) => openModal('uploadReceipt', item), title: 'رفع إيصال' }
    ];
    
    const studentCustomActions = [
        { icon: <DollarSignIcon />, onClick: (item: Student) => openModal('addPayment', item), title: 'تسجيل دفعة' }
    ];

    const groupCustomActions = [
        { icon: <ClipboardListIcon />, onClick: (item: GroupClass) => setAttendanceModal({ isOpen: true, group: item }), title: 'تسجيل الحضور' }
    ];

    const tabs = [
        { label: 'استقبال العملاء (الزوار)', content: (
            <div className="bg-white p-4 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">مراحل متابعة الزوار</h3>
                    <button 
                        onClick={() => openModal('addVisitor')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                    >
                        <span>إضافة زائر</span>
                    </button>
                </div>
                <Kanban 
                    columns={KANBAN_COLUMNS} 
                    data={kanbanData} 
                    onCardClick={(item) => openModal('editVisitor', visitors.find(v => v.id === item.id))}
                    onDrop={handleKanbanDrop}
                />
            </div>
        ) },
        { label: 'حضور الحصص التجريبية', content: <DataTable<any> 
            title="متابعة حضور الحصص التجريبية" 
            data={trialSessionVisitors} 
            headers={trialAttendanceHeaders} 
            searchKeys={['studentName', 'teacherName']}
            filters={[{key: 'trialStatus', label: 'الحالة'}]}
            onEdit={(item) => openModal('editVisitor', item)} 
            onDelete={(item) => openModal('deleteVisitor', item)} 
        /> },
        { label: 'الطلاب المسجلين', content: (
          <div>
            <div className="p-4 bg-white rounded-t-xl border-b flex items-center gap-4">
                <label htmlFor="teacher-filter" className="font-semibold text-gray-700">فلترة حسب الأستاذ:</label>
                <select 
                    id="teacher-filter"
                    value={selectedTeacherId} 
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full md:w-auto pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">كل الأساتذة</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
            </div>
            <DataTable<DisplayStudent> 
                title="قائمة الطلاب" 
                data={filteredStudents} 
                headers={studentHeaders} 
                searchKeys={['studentName']}
                filters={[
                    {key: 'subscriptionType', label: 'الاشتراك'},
                    {key: 'paymentStatus', label: 'حالة الدفع'},
                    {key: 'status', label: 'الحالة'}
                ]}
                onAdd={() => openModal('addStudent')} 
                onEdit={(item) => openModal('editStudent', students.find(s => s.id === item.id))} 
                onDelete={(item) => openModal('deleteStudent', item)} 
                customActions={studentCustomActions} 
            />
          </div>
        )},
        { label: 'المجموعات', content: <DataTable<GroupClass> 
            title="قائمة المجموعات" 
            data={groupClasses} 
            headers={groupHeaders} 
            searchKeys={['name', 'teacherName']}
            filters={[{key: 'level', label: 'المستوى'}, {key: 'status', label: 'الحالة'}]}
            customActions={groupCustomActions} 
        /> },
        { label: 'حضور الطلاب المسجلين', content: <DataTable<Attendance> 
            title="سجل حضور الطلاب المسجلين" 
            data={attendance} 
            headers={attendanceHeaders} 
            searchKeys={['studentName']}
            filters={[{key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addAttendance')} 
            onEdit={(item) => openModal('editAttendance', item)} 
            onDelete={(item) => openModal('deleteAttendance', item)} 
        /> },
        { label: 'المدفوعات', content: (
            <div>
                <div className="p-4 bg-white rounded-t-xl border-b flex items-center gap-4">
                    <label htmlFor="payment-month" className="font-semibold text-gray-700">عرض مدفوعات شهر:</label>
                    <input 
                        type="month" 
                        id="payment-month"
                        value={paymentMonth} 
                        onChange={e => setPaymentMonth(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {paymentMonth && <button onClick={() => setPaymentMonth('')} className="text-sm text-red-600 hover:underline">مسح الفلتر</button>}
                </div>
                <DataTable<Payment> 
                    title="سجل المدفوعات" 
                    data={filteredPayments} 
                    headers={paymentHeaders} 
                    searchKeys={['studentName']}
                    filters={[{key: 'method', label: 'الطريقة'}]}
                    onEdit={(item) => openModal('editPayment', item)} 
                    onDelete={(item) => openModal('deletePayment', item)} 
                    customActions={paymentCustomActions} 
                    onDataFiltered={handlePaymentsFiltered}
                    summary={paymentSummary}
                /> 
            </div>
        )},
    ];
    
    const getModalTitle = () => {
        switch(modal.type) {
            case 'addVisitor': return 'إضافة زائر جديد';
            case 'editVisitor': return 'تعديل بيانات الزائر';
            case 'deleteVisitor': return 'حذف الزائر';
            case 'addStudent': return 'إضافة طالب جديد';
            case 'editStudent': return 'تعديل بيانات الطالب';
            case 'deleteStudent': return 'حذف الطالب';
            case 'addAttendance': return 'إضافة سجل حضور';
            case 'editAttendance': return 'تعديل سجل الحضور';
            case 'addPayment': return 'إضافة دفعة جديدة';
            case 'editPayment': return 'تعديل الدفعة';
            case 'deletePayment': return 'حذف الدفعة';
            case 'viewReceipt': return 'إيصال الدفع';
            case 'uploadReceipt': return 'رفع إيصال الدفع';
            default: return 'تحرير عنصر';
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
        
        if (modal.type === 'viewReceipt') {
            return <Receipt payment={modal.data} onClose={closeModal} />;
        }

        if (modal.type === 'uploadReceipt') {
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p>رفع إيصال للطالب: <strong>{modal.data?.studentName}</strong></p>
                    <p>بتاريخ: <strong>{modal.data?.paymentDate}</strong></p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اختر ملف الإيصال</label>
                        <input type="file" name="file" onChange={handleFormChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                    </div>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                            رفع وحفظ
                        </button>
                    </div>
                </form>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                 {(modal.type === 'addVisitor' || modal.type === 'editVisitor') && <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">اسم الطالب</label><input name="studentName" value={formData.studentName || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">اسم ولي الأمر</label><input name="parentName" value={formData.parentName || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">رقم الهاتف</label><input name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">العمر</label><input type="number" name="age" value={formData.age || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required /></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Agent المسؤول</label>
                            <select name="assignedAgentId" value={formData.assignedAgentId || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                <option value="">اختر وكيلاً</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.fullName}</option>
                                ))}
                            </select>
                        </div>
                        <fieldset className="md:col-span-2 pt-4 mt-4 border-t border-gray-200">
                          <legend className="text-base font-semibold text-gray-800 px-2 -ml-2">معلومات الحصة التجريبية</legend>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label htmlFor="trialDate" className="block text-sm font-medium text-gray-700">تاريخ الحصة</label>
                                    <input id="trialDate" name="trialDate" value={formData.trialDate || ''} onChange={handleFormChange} type="date" className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" />
                                </div>
                                <div>
                                    <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">الأستاذ</label>
                                    <select id="teacherId" name="teacherId" value={formData.teacherId || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                        <option value="">اختر الأستاذ</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="trialTime" className="block text-sm font-medium text-gray-700">الأوقات المتاحة</label>
                                    <select 
                                        id="trialTime" 
                                        name="trialTime" 
                                        value={formData.trialTime || ''} 
                                        onChange={handleFormChange} 
                                        className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300"
                                        disabled={!formData.trialDate || !formData.teacherId}
                                    >
                                        <option value="">
                                            {(!formData.trialDate || !formData.teacherId) 
                                                ? "اختر التاريخ والأستاذ أولاً" 
                                                : availableTimeSlots.length === 0 
                                                ? "لا توجد أوقات متاحة" 
                                                : "اختر وقتاً"}
                                        </option>
                                        {availableTimeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="trialStatus" className="block text-sm font-medium text-gray-700">حالة الحصة</label>
                                    <select id="trialStatus" name="trialStatus" value={formData.trialStatus || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                        <option value="">اختر الحالة</option>
                                        <option value="مجدولة">مجدولة</option>
                                        <option value="حضر">حضر</option>
                                        <option value="لم يحضر">لم يحضر</option>
                                        <option value="ألغيت">ألغيت</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">المجموعة (اختياري)</label>
                                    <select id="groupId" name="groupId" value={formData.groupId || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                        <option value="">اختر المجموعة</option>
                                        {groupClasses.map(group => (
                                            <option key={group.id} value={group.id}>{group.name} ({group.teacherName})</option>
                                        ))}
                                    </select>
                                </div>
                           </div>
                        </fieldset>

                        <div className="md:col-span-2">
                          <label htmlFor="finalDecision" className="block text-sm font-medium text-gray-700">القرار النهائي</label>
                          <select id="finalDecision" name="finalDecision" value={formData.finalDecision || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                            <option value="">اختر القرار</option>
                            <option value="يفكر">يفكر</option>
                            <option value="سجل">سجل</option>
                            <option value="رفض">رفض</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">الملاحظات (سبب القبول/الرفض)</label>
                            <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleFormChange} rows={3} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" placeholder="أدخل الملاحظات هنا..."></textarea>
                        </div>
                    </div>
                     {formData.finalDecision === 'سجل' && (
                        <div className="p-4 border-t-2 border-indigo-200 mt-4 space-y-4">
                             <h4 className="font-semibold text-indigo-700">معلومات التسجيل الإضافية</h4>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">المجموعة</label>
                                <select name="groupId" value={formData.groupId || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required>
                                    <option value="">اختر المجموعة</option>
                                    {groupClasses.map(group => (
                                        <option key={group.id} value={group.id}>{group.name} ({group.teacherName})</option>
                                    ))}
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">المبلغ الشهري</label>
                                <input type="number" name="monthlyFee" value={formData.monthlyFee || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">نوع الاشتراك</label>
                                <select name="subscriptionType" value={formData.subscriptionType || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required>
                                    <option value="">نوع الاشتراك</option>
                                    <option value="شهري">شهري</option>
                                    <option value="ربعي">ربعي</option>
                                    <option value="نصف سنوي">نصف سنوي</option>
                                </select>
                             </div>
                        </div>
                    )}
                 </>}
                 {(modal.type === 'addStudent' || modal.type === 'editStudent') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">اسم الطالب</label>
                            <input name="studentName" value={formData.studentName || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">المجموعة</label>
                            <select name="groupId" value={formData.groupId || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required>
                                <option value="">اختر المجموعة</option>
                                {groupClasses.map(group => (
                                    <option key={group.id} value={group.id}>{group.name} ({group.teacherName})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">نوع الاشتراك</label>
                            <select name="subscriptionType" value={formData.subscriptionType || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                <option value="">اختر النوع</option>
                                <option value="شهري">شهري</option>
                                <option value="ربعي">ربعي</option>
                                <option value="نصف سنوي">نصف سنوي</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">حالة الدفع</label>
                            <select name="paymentStatus" value={formData.paymentStatus || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                <option value="مدفوع">مدفوع</option>
                                <option value="متأخر">متأخر</option>
                                <option value="معلق">معلق</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">الحالة</label>
                            <select name="status" value={formData.status || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                <option value="نشط">نشط</option>
                                <option value="معلق">معلق</option>
                                <option value="منقطع">منقطع</option>
                            </select>
                        </div>
                    </div>
                 )}
                {(modal.type === 'addAttendance' || modal.type === 'editAttendance') && <>
                    <input name="date" type="date" value={formData.date || ''} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                    <input name="studentName" value={formData.studentName || ''} onChange={handleFormChange} placeholder="اسم الطالب" className="w-full p-2 border rounded" required />
                     <select name="status" value={formData.status || ''} onChange={handleFormChange} className="w-full p-2 border rounded"><option value="حاضر">حاضر</option><option value="غائب">غائب</option></select>
                </>}
                 {(modal.type === 'addPayment' || modal.type === 'editPayment') && (
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <h4 className="font-semibold text-lg text-indigo-800">{formData.studentName}</h4>
                            <p className="text-sm text-gray-600">تسجيل دفعة جديدة للطالب</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">تاريخ الدفع</label>
                                <input type="date" name="paymentDate" value={formData.paymentDate || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">اسم الدورة</label>
                                <input name="courseName" value={formData.courseName || ''} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300 bg-gray-100" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">الرسوم الشهرية (د.م)</label>
                                <input type="number" name="monthlyFee" value={formData.monthlyFee || ''} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300 bg-gray-100" readOnly />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">الخصم (د.م)</label>
                                <input type="number" name="discount" value={formData.discount || 0} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
                                <select name="method" value={formData.method || 'Cash'} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300">
                                    <option value="Cash">Cash</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                        </div>
                         <div className="pt-4 border-t mt-4 text-right">
                            <p className="text-gray-600">
                                المبلغ الإجمالي: <span className="font-bold text-xl text-green-600">
                                    {((formData.monthlyFee || 0) - (formData.discount || 0)).toLocaleString()} د.م
                                </span>
                            </p>
                        </div>
                    </div>
                 )}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                        {modal.type === 'editVisitor' && formData.finalDecision === 'سجل' ? 'تحويل إلى طالب' : 'حفظ'}
                    </button>
                </div>
            </form>
        );
    }
    
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">لوحة تحكم وكيل خدمة العملاء</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="عدد الزوار" value={totalVisitors} icon={<UsersIcon />} color="blue" />
                <DashboardCard title="إجمالي الطلاب" value={totalStudents} icon={<UsersIcon />} color="purple" />
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
                students={students}
                visitors={visitors}
                attendance={attendance}
                onSave={handleSaveAttendance}
            />
            <ReportUploader role="AGENT" roleName="وكيل خدمة العملاء" reports={reports} setReports={setReports} />
        </div>
    );
};

export default AgentView;
