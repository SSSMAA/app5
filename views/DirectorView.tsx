import React, { useState, useMemo } from 'react';
import DashboardCard from '../components/DashboardCard';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Teacher, GroupClass, Payment, Expense, InventoryItem, Applicant, Report, Role, PerformanceNote, Campaign, Student } from '../types';

// Icons
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const AwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7V21"/><path d="m6 13 6-6 6 6"/><path d="M19 3H5"/></svg>;

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
  
  return (
    <div className="bg-white rounded-xl shadow-md mt-8">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-bold text-gray-800">إعداد تقرير أسبوعي للإدارة العامة</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7V21"/><path d="m6 13 6-6 6 6"/><path d="M19 3H5"/></svg>
          <span>رفع تقرير جديد</span>
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="رفع تقرير جديد للمدير العام">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="عنوان التقرير" className="w-full p-2 border rounded-md" required />
          <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="وصف موجز" rows={3} className="w-full p-2 border rounded-md"></textarea>
          <input type="file" name="file" onChange={handleFileChange} className="w-full" required />
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">رفع التقرير</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

interface DirectorViewProps {
    teachers: Teacher[];
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    groupClasses: GroupClass[];
    setGroupClasses: React.Dispatch<React.SetStateAction<GroupClass[]>>;
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    applicants: Applicant[];
    setApplicants: React.Dispatch<React.SetStateAction<Applicant[]>>;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    campaigns: Campaign[];
}

const DirectorView: React.FC<DirectorViewProps> = (props) => {
    const { 
        teachers, setTeachers, groupClasses, setGroupClasses, payments, setPayments, 
        expenses, setExpenses, inventory, setInventory, applicants, setApplicants, 
        reports, setReports, campaigns 
    } = props;

    const [modal, setModal] = useState<{ isOpen: boolean; type?: string; data?: any }>({ isOpen: false });
    const [formData, setFormData] = useState<any>({});
    const [performanceNote, setPerformanceNote] = useState('');
    const [viewMode, setViewMode] = useState<'allTime' | 'monthly'>('allTime');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [displayedPayments, setDisplayedPayments] = useState<any[]>([]);
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

    const openModal = (type: string, data?: any) => {
        let formDataToSet = data || {};
        if (data) {
             if ((type === 'editInventory' || type === 'addInventory') && data.purchaseDate) {
                 formDataToSet = { ...data, purchaseDate: toInputDate(data.purchaseDate) };
             }
             if ((type === 'editApplicant' || type === 'addApplicant') && data.applicationDate) {
                 formDataToSet = { ...data, applicationDate: toInputDate(data.applicationDate) };
             }
             if ((type === 'editPayment' || type === 'addPayment') && data.paymentDate) {
                 formDataToSet = { ...data, paymentDate: toInputDate(data.paymentDate) };
             }
             if ((type === 'editExpense' || type === 'addExpense') && data.date) {
                 formDataToSet = { ...data, date: toInputDate(data.date) };
             }
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
                 setFormData(prev => ({ ...prev, [name]: files[0] }));
            }
        } else {
            const isNumeric = ['quantity', 'unitPrice', 'amount', 'salary', 'studentsCount', 'maxCapacity'].includes(name);
            setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, data } = modal;

        let finalFormData = { ...formData };
        if (finalFormData.purchaseDate) finalFormData.purchaseDate = fromInputDate(finalFormData.purchaseDate);
        if (finalFormData.applicationDate) finalFormData.applicationDate = fromInputDate(finalFormData.applicationDate);
        if (finalFormData.paymentDate) finalFormData.paymentDate = fromInputDate(finalFormData.paymentDate);
        if (finalFormData.date) finalFormData.date = fromInputDate(finalFormData.date);
        
        switch(type) {
            case 'addInventory': setInventory(prev => [...prev, { ...finalFormData, id: `INV${Date.now()}` }]); break;
            case 'editInventory': setInventory(prev => prev.map(i => i.id === data.id ? { ...data, ...finalFormData } : i)); break;
            case 'addApplicant': setApplicants(prev => [...prev, { ...finalFormData, id: `APP${Date.now()}` }]); break;
            case 'editApplicant': setApplicants(prev => prev.map(a => a.id === data.id ? { ...data, ...finalFormData } : a)); break;
            case 'addPayment': setPayments(prev => [...prev, { ...finalFormData, id: `P${Date.now()}` }]); break;
            case 'editPayment': setPayments(prev => prev.map(p => p.id === data.id ? { ...data, ...finalFormData } : p)); break;
            case 'addExpense': setExpenses(prev => [...prev, { ...finalFormData, id: `E${Date.now()}` }]); break;
            case 'editExpense': setExpenses(prev => prev.map(e => e.id === data.id ? { ...data, ...finalFormData } : e)); break;
            case 'editSalary': setTeachers(prev => prev.map(t => t.id === data.id ? { ...t, salary: finalFormData.salary, contractType: finalFormData.contractType, status: finalFormData.status } : t)); break;
            case 'addGroup':
            case 'editGroup':
                const teacher = teachers.find(t => t.id === finalFormData.teacherId);
                const groupData = { ...finalFormData, teacherName: teacher ? teacher.fullName : 'غير محدد' };
                if (type === 'addGroup') {
                    setGroupClasses(prev => [...prev, { ...groupData, id: `G${Date.now()}` }]);
                } else {
                    setGroupClasses(prev => prev.map(g => g.id === data.id ? { ...data, ...groupData } : g));
                }
                break;
            case 'addPerformanceNote':
                if (!performanceNote.trim()) return;
                const newNote: PerformanceNote = {
                    id: `PN${Date.now()}`,
                    date: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'),
                    note: performanceNote,
                };
                setTeachers(prev => prev.map(t => t.id === data.id ? { ...t, performanceNotes: [...(t.performanceNotes || []), newNote] } : t));
                setPerformanceNote('');
                break;
            case 'uploadReceipt':
                if(formData.file) {
                    setPayments(prev => prev.map(p => p.id === data.id ? { ...p, receiptFileName: (formData.file as File).name } : p));
                }
                break;
        }
        if (type !== 'addPerformanceNote') closeModal();
    };
    
    const handleDelete = () => {
        const { type, data } = modal;
        switch(type) {
            case 'deleteInventory': setInventory(prev => prev.filter(i => i.id !== data.id)); break;
            case 'deleteApplicant': setApplicants(prev => prev.filter(a => a.id !== data.id)); break;
            case 'deletePayment': setPayments(prev => prev.filter(p => p.id !== data.id)); break;
            case 'deleteExpense': setExpenses(prev => prev.filter(e => e.id !== data.id)); break;
            case 'deleteSalary': setTeachers(prev => prev.filter(t => t.id !== data.id)); break;
            case 'deleteGroup': setGroupClasses(prev => prev.filter(g => g.id !== data.id)); break;
        }
        closeModal();
    };
    
    const { filteredPayments, filteredExpenses } = useMemo(() => {
        if (viewMode === 'allTime') {
            return { filteredPayments: payments, filteredExpenses: expenses };
        }
        const [year, month] = selectedMonth.split('-');
        const currentFilteredPayments = payments.filter(p => {
            const [, pMonth, pYear] = p.paymentDate.split('/');
            return pYear === year && pMonth === month;
        });
        const currentFilteredExpenses = expenses.filter(e => {
            const [, eMonth, eYear] = e.date.split('/');
            return eYear === year && eMonth === month;
        });
        return { filteredPayments: currentFilteredPayments, filteredExpenses: currentFilteredExpenses };
    }, [viewMode, selectedMonth, payments, expenses]);

    const totalRevenue = useMemo(() => filteredPayments.reduce((acc, p) => acc + p.amount, 0), [filteredPayments]);
    const totalExpenses = useMemo(() => filteredExpenses.reduce((acc, e) => acc + e.amount, 0), [filteredExpenses]);
    const activeTeachers = useMemo(() => teachers.filter(t => t.status === 'نشط').length, [teachers]);
    const avgTeacherPerf = (teachers.reduce((acc, t) => acc + t.overallRating, 0) / teachers.length).toFixed(1);

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

    const hrTabs = [
        { label: 'أداء الموظفين', content: <DataTable<Teacher>
            title="تقييم أداء الأساتذة"
            data={teachers}
            headers={[{ key: 'fullName', label: 'الاسم'}, { key: 'specialization', label: 'التخصص' }, { key: 'status', label: 'الحالة' }, { key: 'overallRating', label: 'التقييم العام'}]}
            searchKeys={['fullName']}
            filters={[{key: 'specialization', label: 'التخصص'}, {key: 'status', label: 'الحالة'}]}
            customActions={[{ icon: <EyeIcon />, onClick: (item) => openModal('viewPerformance', item), title: 'عرض/إضافة تقييم' }]}
        /> },
        { label: 'التوظيف', content: <DataTable<Applicant>
            title="متابعة طلبات التوظيف"
            data={applicants}
            headers={[{ key: 'name', label: 'اسم المتقدم' }, { key: 'position', label: 'الوظيفة'}, { key: 'applicationDate', label: 'تاريخ التقديم'}, { key: 'status', label: 'الحالة'}]}
            searchKeys={['name', 'position']}
            filters={[{key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addApplicant')} onEdit={(item) => openModal('editApplicant', item)} onDelete={(item) => openModal('deleteApplicant', item)}
        /> },
    ];

    const paymentCustomActions = [
        { icon: <UploadIcon />, onClick: (item: Payment) => openModal('uploadReceipt', item), title: 'رفع إيصال' }
    ];

    const financialTabs = [
        { label: 'الفواتير والمدفوعات (الإيرادات)', content: <DataTable<Payment> 
            title="سجل الإيرادات" 
            data={filteredPayments} 
            headers={[{ key: 'paymentDate', label: 'تاريخ الدفع' }, { key: 'studentName', label: 'اسم الطالب' }, { key: 'amount', label: 'المبلغ' }, { key: 'method', label: 'طريقة الدفع' }, { key: 'receiptFileName', label: 'الإيصال المرفق' }]} 
            searchKeys={['studentName']}
            filters={[{key: 'method', label: 'طريقة الدفع'}]}
            onAdd={() => openModal('addPayment')} onEdit={(item) => openModal('editPayment', item)} onDelete={(item) => openModal('deletePayment', item)}
            customActions={paymentCustomActions}
            onDataFiltered={handlePaymentsFiltered}
            summary={paymentSummary}
        /> },
        { label: 'المصاريف', content: <DataTable<Expense> 
            title="سجل المصاريف" 
            data={filteredExpenses} 
            headers={[{ key: 'date', label: 'التاريخ' }, { key: 'category', label: 'الفئة' }, { key: 'description', label: 'الوصف' }, { key: 'amount', label: 'المبلغ' }]} 
            searchKeys={['description']}
            filters={[{key: 'category', label: 'الفئة'}]}
            onAdd={() => openModal('addExpense')} onEdit={(item) => openModal('editExpense', item)} onDelete={(item) => openModal('deleteExpense', item)}
        /> },
        { label: 'الرواتب', content: <DataTable<Teacher> 
            title="رواتب الأساتذة" 
            data={teachers} 
            headers={[{ key: 'fullName', label: 'الاسم'}, { key: 'salary', label: 'الراتب' }, { key: 'contractType', label: 'العقد' }, { key: 'status', label: 'الحالة'}]}
            searchKeys={['fullName']}
            filters={[{key: 'status', label: 'الحالة'}, {key: 'contractType', label: 'العقد'}]}
            onEdit={(item) => openModal('editSalary', item)} onDelete={(item) => openModal('deleteSalary', item)}
        /> },
    ];
    
    const mainTabs = [
        { label: 'نظرة عامة', content: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString()} د.م`} icon={<DollarSignIcon />} color="green" />
                <DashboardCard title="إجمالي المصاريف" value={`${totalExpenses.toLocaleString()} د.م`} icon={<DollarSignIcon />} color="red" />
                <DashboardCard title="الأساتذة النشطون" value={activeTeachers} icon={<UsersIcon />} color="blue" />
                <DashboardCard title="متوسط أداء الأساتذة" value={avgTeacherPerf} icon={<AwardIcon />} color="yellow" />
            </div>
        )},
        { label: 'الشؤون المالية', content: <TabbedView tabs={financialTabs} /> },
        { label: 'الموارد البشرية', content: <TabbedView tabs={hrTabs} /> },
        { label: 'الجداول الدراسية', content: <DataTable<GroupClass> 
            title="جداول المدربين والطلبة" 
            data={groupClasses} 
            headers={[{ key: 'name', label: 'المجموعة'}, {key: 'teacherName', label: 'الأستاذ'}, {key: 'weekdays', label: 'الأيام'}, {key: 'startTime', label: 'الوقت'}, {key: 'status', label: 'الحالة'}]}
            searchKeys={['name', 'teacherName']}
            filters={[{key: 'level', label: 'المستوى'}, {key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addGroup')} onEdit={(item) => openModal('editGroup', item)} onDelete={(item) => openModal('deleteGroup', item)}
        /> },
        { label: 'المخزون واللوازم', content: <DataTable<InventoryItem>
            title="متابعة المخزون"
            data={inventory}
            headers={[{ key: 'name', label: 'الصنف'}, {key: 'category', label: 'الفئة'}, {key: 'quantity', label: 'الكمية'}]}
            searchKeys={['name']}
            filters={[{key: 'category', label: 'الفئة'}]}
            onAdd={() => openModal('addInventory')} onEdit={(item) => openModal('editInventory', item)} onDelete={(item) => openModal('deleteInventory', item)}
        />},
        { label: 'التقارير', content: <ReportUploader role="DIRECTOR" roleName="المدير التنفيذي" reports={reports} setReports={setReports} /> },
    ];

    const getModalTitle = () => {
      switch(modal.type) {
        case 'addInventory': return 'إضافة صنف جديد للمخزون';
        case 'editInventory': return 'تعديل صنف في المخزون';
        case 'deleteInventory': return 'حذف صنف من المخزون';
        case 'addApplicant': return 'إضافة متقدم جديد';
        case 'editApplicant': return 'تعديل بيانات متقدم';
        case 'deleteApplicant': return 'حذف متقدم';
        case 'viewPerformance': return `تقييم أداء: ${modal.data?.fullName}`;
        case 'addPayment': return 'إضافة دفعة جديدة';
        case 'editPayment': return 'تعديل دفعة';
        case 'deletePayment': return 'حذف دفعة';
        case 'addExpense': return 'إضافة مصروف جديد';
        case 'editExpense': return 'تعديل مصروف';
        case 'deleteExpense': return 'حذف مصروف';
        case 'editSalary': return 'تعديل راتب أستاذ';
        case 'deleteSalary': return 'حذف أستاذ';
        case 'addGroup': return 'إضافة مجموعة جديدة';
        case 'editGroup': return 'تعديل مجموعة';
        case 'deleteGroup': return 'حذف مجموعة';
        case 'uploadReceipt': return 'رفع إيصال الدفع';
        default: return '';
      }
    };
    
    const renderModalContent = () => {
        if (modal.type?.includes('delete')) {
            return <>
                <p>هل أنت متأكد أنك تريد حذف هذا العنصر؟</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100">إلغاء</button>
                    <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-white bg-red-600">تأكيد الحذف</button>
                </div>
            </>;
        }

        if(modal.type === 'viewPerformance') {
            const teacher = modal.data as Teacher;
            return <div className="space-y-4">
                <h4 className="font-bold">الملاحظات السابقة</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {teacher.performanceNotes?.length ? teacher.performanceNotes.map(note => (
                        <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-800">{note.note}</p>
                            <p className="text-xs text-gray-500 text-left mt-1">{note.date}</p>
                        </div>
                    )) : <p className="text-sm text-gray-500">لا توجد ملاحظات مسجلة.</p>}
                </div>
                <form onSubmit={handleSubmit} className="pt-4 border-t">
                    <h4 className="font-bold mb-2">إضافة تقييم جديد</h4>
                    <textarea value={performanceNote} onChange={e => setPerformanceNote(e.target.value)} rows={3} className="w-full p-2 border rounded-md" placeholder="اكتب تقييم الأداء هنا..."></textarea>
                    <div className="flex justify-end gap-4 mt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100">إغلاق</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600">إضافة ملاحظة</button>
                    </div>
                </form>
            </div>;
        }

        if(modal.type === 'uploadReceipt') {
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p>رفع إيصال للطالب: <strong>{modal.data?.studentName}</strong></p>
                    <p>بمبلغ: <strong>{modal.data?.amount} د.م</strong> بتاريخ <strong>{modal.data?.paymentDate}</strong></p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اختر ملف الإيصال (PDF, PNG, JPG)</label>
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(modal.type === 'addInventory' || modal.type === 'editInventory') && <>
                    <div><label>اسم الصنف</label><input name="name" value={formData.name || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label>الفئة</label><select name="category" value={formData.category || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md"><option value="أجهزة">أجهزة</option><option value="لوازم مكتبية">لوازم مكتبية</option><option value="مواد تعليمية">مواد تعليمية</option></select></div>
                    <div><label>الكمية</label><input type="number" name="quantity" value={formData.quantity || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label>تاريخ الشراء</label><input type="date" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" /></div>
                </>}
                {(modal.type === 'addApplicant' || modal.type === 'editApplicant') && <>
                    <div><label>اسم المتقدم</label><input name="name" value={formData.name || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label>الوظيفة المتقدم لها</label><input name="position" value={formData.position || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label>تاريخ التقديم</label><input type="date" name="applicationDate" value={formData.applicationDate || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label>الحالة</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md"><option value="قيد المراجعة">قيد المراجعة</option><option value="مقابلة">مقابلة</option><option value="مقبول">مقبول</option><option value="مرفوض">مرفوض</option></select></div>
                    <div className="md:col-span-2"><label>ملاحظات</label><textarea name="notes" value={formData.notes || ''} onChange={handleFormChange} rows={3} className="w-full p-2 border rounded-md"></textarea></div>
                </>}
                {(modal.type === 'addPayment' || modal.type === 'editPayment') && <>
                    <div><label>تاريخ الدفع</label><input type="date" name="paymentDate" value={formData.paymentDate || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label>اسم الطالب</label><input name="studentName" value={formData.studentName || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div className="md:col-span-2"><label>المبلغ (د.م)</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                </>}
                {(modal.type === 'addExpense' || modal.type === 'editExpense') && <>
                    <div><label>التاريخ</label><input type="date" name="date" value={formData.date || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label>الفئة</label><select name="category" value={formData.category || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required><option value="">اختر فئة</option><option value="Marketing">Marketing</option><option value="Utilities">Utilities</option><option value="Software">Software</option><option value="Other">Other</option><option value="Inventory">Inventory</option></select></div>
                    {formData.category === 'Marketing' && (
                         <div className="md:col-span-2"><label>ربط بحملة (اختياري)</label><select name="campaignId" value={formData.campaignId || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md"><option value="">اختر حملة</option>{campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    )}
                    <div className="md:col-span-2"><label>الوصف</label><input name="description" value={formData.description || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div className="md:col-span-2"><label>المبلغ (د.م)</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                </>}
                {modal.type === 'editSalary' && <>
                    <p className="md:col-span-2"><strong>الأستاذ:</strong> {modal.data?.fullName}</p>
                    <div><label>الراتب (د.م)</label><input type="number" name="salary" value={formData.salary || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                    <div><label>نوع العقد</label><select name="contractType" value={formData.contractType || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md"><option value="دوام كامل">دوام كامل</option><option value="دوام جزئي">دوام جزئي</option></select></div>
                    <div className="md:col-span-2"><label>الحالة</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md"><option value="نشط">نشط</option><option value="معلق">معلق</option><option value="مفصول">مفصول</option></select></div>
                </>}
                {(modal.type === 'addGroup' || modal.type === 'editGroup') && <>
                    <div><label>اسم المجموعة</label><input name="name" value={formData.name || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required /></div>
                     <div>
                        <label>المستوى</label>
                        <select name="level" value={formData.level || 'مبتدئ'} onChange={handleFormChange} className="w-full p-2 border rounded-md">
                            <option value="مبتدئ">مبتدئ</option>
                            <option value="متوسط">متوسط</option>
                            <option value="متقدم">متقدم</option>
                        </select>
                    </div>
                    <div><label>الأستاذ</label>
                      <select name="teacherId" value={formData.teacherId || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" required>
                        <option value="">اختر أستاذًا</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                      </select>
                    </div>
                    <div>
                        <label>الطاقة الاستيعابية</label>
                        <input type="number" name="maxCapacity" value={formData.maxCapacity || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" />
                    </div>
                    <div><label>الأيام</label><input name="weekdays" value={formData.weekdays || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" placeholder="الإثنين,الأربعاء" /></div>
                    <div><label>الوقت</label><input name="startTime" value={formData.startTime || ''} onChange={handleFormChange} className="w-full p-2 border rounded-md" placeholder="17:00" /></div>
                    <div className="md:col-span-2">
                        <label>الحالة</label>
                        <select name="status" value={formData.status || 'نشط'} onChange={handleFormChange} className="w-full p-2 border rounded-md">
                            <option value="نشط">نشط</option>
                            <option value="معلق">معلق</option>
                            <option value="منتهي">منتهي</option>
                        </select>
                    </div>
                </>}

                 <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600">حفظ</button>
                </div>
            </form>
        )
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">لوحة تحكم المدير التنفيذي</h2>
            <div className="p-4 bg-white rounded-xl shadow-md flex items-center gap-4 flex-wrap">
                <span className="font-semibold text-gray-700">عرض البيانات المالية:</span>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="viewModeDirector" value="allTime" checked={viewMode === 'allTime'} onChange={() => setViewMode('allTime')} className="form-radio text-indigo-600" />
                        <span>كل الأوقات</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="viewModeDirector" value="monthly" checked={viewMode === 'monthly'} onChange={() => setViewMode('monthly')} className="form-radio text-indigo-600" />
                        <span>شهري</span>
                    </label>
                </div>
                {viewMode === 'monthly' && (
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)} 
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                )}
            </div>
            <TabbedView tabs={mainTabs} />
            <Modal isOpen={modal.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default DirectorView;