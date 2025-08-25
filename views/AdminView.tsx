import React, { useState, useMemo } from 'react';
import DashboardCard from '../components/DashboardCard';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Payment, Expense, Teacher, Student, Campaign, Report } from '../types';

const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8a6 6 0 0 0-6-6" /><path d="M13 13a6 6 0 0 0 6 6" /></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7V21"/><path d="m6 13 6-6 6 6"/><path d="M19 3H5"/></svg>;

interface AdminViewProps {
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    teachers: Teacher[];
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    students: Student[];
    campaigns: Campaign[];
    reports: Report[];
}

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


const AdminView: React.FC<AdminViewProps> = ({ payments, setPayments, expenses, setExpenses, teachers, setTeachers, students, campaigns, reports }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; type?: 'editSalary' | 'deleteSalary' | 'addExpense' | 'editExpense' | 'deleteExpense' | 'addPayment' | 'editPayment' | 'deletePayment' | 'uploadReceipt'; data?: any }>({ isOpen: false });
    const [formData, setFormData] = useState<any>({});
    const [viewMode, setViewMode] = useState<'allTime' | 'monthly'>('allTime');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [displayedPayments, setDisplayedPayments] = useState<any[]>([]);
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

    const openModal = (type: typeof modal.type, data?: any) => {
        let formDataToSet = data || {};
        if (data) {
            if (type?.includes('Expense') && data.date) {
                formDataToSet = { ...data, date: toInputDate(data.date) };
            }
            if (type?.includes('Payment') && data.paymentDate) {
                formDataToSet = { ...data, paymentDate: toInputDate(data.paymentDate) };
            }
        }
        setFormData(formDataToSet);
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => setModal({ isOpen: false });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                setFormData(prev => ({...prev, [name]: files[0] }));
            }
        } else {
             setFormData(prev => ({ ...prev, [name]: name === 'amount' || name === 'salary' ? Number(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, data } = modal;
        
        let finalFormData = { ...formData };
        if ((type === 'addExpense' || type === 'editExpense') && finalFormData.date) {
            finalFormData.date = fromInputDate(finalFormData.date);
        }
        if ((type === 'addPayment' || type === 'editPayment') && finalFormData.paymentDate) {
            finalFormData.paymentDate = fromInputDate(finalFormData.paymentDate);
        }

        switch (type) {
            case 'editSalary':
                setTeachers(teachers.map(t => t.id === data.id ? { ...t, salary: finalFormData.salary, contractType: finalFormData.contractType, status: finalFormData.status } : t));
                break;
            case 'addExpense':
                setExpenses([...expenses, { ...finalFormData, id: `E${Date.now()}` }]);
                break;
            case 'editExpense':
                setExpenses(expenses.map(ex => ex.id === data.id ? finalFormData : ex));
                break;
            case 'addPayment':
            case 'editPayment':
                const student = students.find(s => s.id === finalFormData.studentId);
                const paymentData = {
                    ...finalFormData,
                    studentName: student ? student.studentName : 'Unknown Student'
                };
                 if (type === 'addPayment') {
                    setPayments([...payments, { ...paymentData, id: `P${Date.now()}` }]);
                } else {
                    setPayments(payments.map(p => p.id === data.id ? paymentData : p));
                }
                break;
            case 'uploadReceipt':
                if (formData.file) {
                    setPayments(payments.map(p => p.id === data.id ? {...p, receiptFileName: (formData.file as File).name } : p));
                }
                break;
        }
        closeModal();
    };

    const handleDelete = () => {
        const { type, data } = modal;
        switch (type) {
            case 'deleteSalary':
                setTeachers(teachers.filter(t => t.id !== data.id));
                break;
            case 'deleteExpense':
                setExpenses(expenses.filter(ex => ex.id !== data.id));
                break;
            case 'deletePayment':
                setPayments(payments.filter(p => p.id !== data.id));
                break;
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
    const totalSalaries = useMemo(() => teachers.filter(t => t.status === 'نشط').reduce((acc, t) => acc + t.salary, 0), [teachers]);
    const totalExpensesAmount = useMemo(() => filteredExpenses.reduce((acc, e) => acc + e.amount, 0), [filteredExpenses]);
    const totalExpensesCalculated = totalExpensesAmount + (viewMode === 'monthly' ? 0 : totalSalaries); // Salaries aren't monthly by default
    const netProfit = totalRevenue - totalExpensesCalculated;
    const activeStudents = useMemo(() => students.filter(s => s.status === 'نشط').length, [students]);

    const salaryData = teachers.map(t => ({ ...t, formattedSalary: `${t.salary} د.م` }));
    const expenseData = filteredExpenses.map(e => ({ ...e, formattedAmount: `${e.amount} د.م` }));
    const paymentData = filteredPayments.map(p => ({ ...p, formattedAmount: `${p.amount} د.م` }));
    
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

    const reportHeaders: { key: keyof Report; label: string }[] = [
        { key: 'uploadedByName', label: 'القسم' },
        { key: 'title', label: 'عنوان التقرير' },
        { key: 'fileName', label: 'اسم الملف' },
        { key: 'uploadDate', label: 'تاريخ الرفع' },
    ];
    
    const reportCustomActions = [
        { 
            icon: <DownloadIcon />, 
            onClick: (item: Report) => alert(`سيتم تحميل الملف: ${item.fileName}`), 
            title: 'تحميل التقرير' 
        }
    ];

    const paymentCustomActions = [
        { icon: <UploadIcon />, onClick: (item: Payment) => openModal('uploadReceipt', item), title: 'رفع إيصال' }
    ];
    
    const tabs = [
        { label: 'إدارة الرواتب', content: <DataTable<any> 
            title="رواتب الأساتذة" 
            data={salaryData} 
            headers={[
                { key: 'id', label: 'ID الأستاذ' }, { key: 'fullName', label: 'الاسم الكامل' }, { key: 'formattedSalary', label: 'الراتب' }, { key: 'contractType', label: 'نوع العقد' }, { key: 'status', label: 'الحالة' }
            ]}
            searchKeys={['fullName']}
            filters={[{ key: 'status', label: 'الحالة' }, { key: 'contractType', label: 'نوع العقد' }]}
            onEdit={(item) => openModal('editSalary', item)}
            onDelete={(item) => openModal('deleteSalary', item)}
        /> },
        { label: 'المصاريف', content: <DataTable<any> 
            title="سجل المصاريف" 
            data={expenseData} 
            headers={[
                { key: 'date', label: 'التاريخ' }, { key: 'category', label: 'الفئة' }, { key: 'description', label: 'الوصف' }, { key: 'formattedAmount', label: 'المبلغ' }
            ]}
            searchKeys={['description']}
            filters={[{ key: 'category', label: 'الفئة' }]}
            onAdd={() => openModal('addExpense')}
            onEdit={(item) => openModal('editExpense', item)}
            onDelete={(item) => openModal('deleteExpense', item)}
        /> },
        { label: 'الإيرادات', content: <DataTable<any> 
            title="سجل الإيرادات" 
            data={paymentData} 
            headers={[
                { key: 'paymentDate', label: 'تاريخ الدفع' }, { key: 'studentName', label: 'اسم الطالب' }, { key: 'formattedAmount', label: 'المبلغ' }, { key: 'method', label: 'طريقة الدفع' }, { key: 'receiptFileName', label: 'الإيصال المرفق' }
            ]}
            searchKeys={['studentName']}
            filters={[{ key: 'method', label: 'طريقة الدفع' }]}
            onAdd={() => openModal('addPayment')}
            onEdit={(item) => openModal('editPayment', item)}
            onDelete={(item) => openModal('deletePayment', item)}
            customActions={paymentCustomActions}
            onDataFiltered={handlePaymentsFiltered}
            summary={paymentSummary}
        /> },
        { 
            label: 'تقارير الأقسام', 
            content: <DataTable<Report> 
                title="التقارير المرفوعة من الأقسام" 
                data={reports} 
                headers={reportHeaders}
                searchKeys={['title', 'fileName']}
                filters={[{ key: 'uploadedByName', label: 'القسم' }]}
                customActions={reportCustomActions}
            /> 
        }
    ];

    const getModalTitle = () => {
        switch (modal.type) {
            case 'editSalary': return 'تعديل راتب موظف';
            case 'deleteSalary': return 'حذف راتب موظف';
            case 'addExpense': return 'إضافة مصروف جديد';
            case 'editExpense': return 'تعديل المصروف';
            case 'deleteExpense': return 'حذف المصروف';
            case 'addPayment': return 'إضافة إيراد جديد';
            case 'editPayment': return 'تعديل الإيراد';
            case 'deletePayment': return 'حذف الإيراد';
            case 'uploadReceipt': return 'رفع إيصال الدفع';
            default: return '';
        }
    };
    
    const renderModalContent = () => {
       if (modal.type?.includes('delete')) {
            return (
                <div>
                    <p>هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">تأكيد الحذف</button>
                    </div>
                </div>
            );
        }

        if (modal.type === 'uploadReceipt') {
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p>رفع إيصال للطالب: <strong>{modal.data?.studentName}</strong></p>
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
                { (modal.type === 'editSalary') && <>
                    <p><strong>الأستاذ:</strong> {modal.data?.fullName}</p>
                    <div><label className="block text-sm font-medium text-gray-700">الراتب (د.م)</label><input type="number" name="salary" value={formData.salary || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">نوع العقد</label><select name="contractType" value={formData.contractType || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="دوام كامل">دوام كامل</option><option value="دوام جزئي">دوام جزئي</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700">الحالة</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="نشط">نشط</option><option value="معلق">معلق</option><option value="مفصول">مفصول</option></select></div>
                </>}
                { (modal.type === 'addExpense' || modal.type === 'editExpense') && <>
                    <div><label className="block text-sm font-medium text-gray-700">التاريخ</label><input type="date" name="date" value={formData.date || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">الفئة</label><select name="category" value={formData.category || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required><option value="">اختر فئة</option><option value="Marketing">Marketing</option><option value="Utilities">Utilities</option><option value="Software">Software</option><option value="Other">Other</option></select></div>
                    {formData.category === 'Marketing' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">ربط بحملة إعلانية (اختياري)</label>
                            <select name="campaignId" value={formData.campaignId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="">بدون حملة</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div><label className="block text-sm font-medium text-gray-700">الوصف</label><input type="text" name="description" value={formData.description || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">المبلغ (د.م)</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                </>}
                 { (modal.type === 'addPayment' || modal.type === 'editPayment') && <>
                    <div><label className="block text-sm font-medium text-gray-700">تاريخ الدفع</label><input type="date" name="paymentDate" value={formData.paymentDate || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">الطالب</label>
                        <select name="studentId" value={formData.studentId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                            <option value="">اختر طالبًا</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.studentName}</option>
                            ))}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">المبلغ (د.م)</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">طريقة الدفع</label><select name="method" value={formData.method || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required><option value="">اختر طريقة</option><option value="Credit Card">Credit Card</option><option value="Bank Transfer">Bank Transfer</option><option value="Cash">Cash</option></select></div>
                </>}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">حفظ التغييرات</button>
                </div>
            </form>
        );
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">لوحة تحكم المدير العام</h2>
            <div className="p-4 bg-white rounded-xl shadow-md flex items-center gap-4 flex-wrap">
                <span className="font-semibold text-gray-700">عرض البيانات المالية:</span>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="viewMode" value="allTime" checked={viewMode === 'allTime'} onChange={() => setViewMode('allTime')} className="form-radio text-indigo-600" />
                        <span>كل الأوقات</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="viewMode" value="monthly" checked={viewMode === 'monthly'} onChange={() => setViewMode('monthly')} className="form-radio text-indigo-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString()} د.م`} icon={<DollarSignIcon />} color="green" />
                <DashboardCard title="إجمالي المصاريف" value={`${totalExpensesCalculated.toLocaleString()} د.م`} icon={<DollarSignIcon />} color="red" />
                <DashboardCard title="صافي الربح" value={`${netProfit.toLocaleString()} د.م`} icon={<ChartIcon />} color="blue" />
                <DashboardCard title="الطلاب النشطين" value={activeStudents} icon={<UsersIcon />} color="indigo" />
            </div>
            <TabbedView tabs={tabs} />
             <Modal isOpen={modal.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default AdminView;