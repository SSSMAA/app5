import React, { useState, useMemo } from 'react';
import TabbedView from '../components/TabbedView';
import DataTable from '../components/DataTable';
import DashboardCard from '../components/DashboardCard';
import Modal from '../components/Modal';
import type { Lead, Expense, Campaign, Report, Role, User } from '../types';

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>;
const PercentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>;

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


interface MarketerViewProps {
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    expenses: Expense[];
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    users: User[];
}

interface DisplayCampaign extends Campaign {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
    cost: string;
    costPerLead: string;
}

interface ChannelPerformance {
    source: 'Facebook' | 'Google' | 'Instagram' | 'WhatsApp';
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
}

type DisplayLead = Lead & { assignedAgentName: string };

const MarketerView: React.FC<MarketerViewProps> = ({ leads, setLeads, expenses, campaigns, setCampaigns, reports, setReports, users }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; type?: 'addLead' | 'editLead' | 'deleteLead' | 'addCampaign' | 'editCampaign' | 'deleteCampaign'; data?: any }>({ isOpen: false });
    const [formData, setFormData] = useState<any>({});

    const agents = useMemo(() => users.filter(u => u.role === 'AGENT'), [users]);

    const openModal = (type: typeof modal.type, data?: any) => {
        let formDataToSet = data || {};
        if (data) {
            if (type === 'editCampaign' || type === 'addCampaign') {
                formDataToSet = { ...data, startDate: toInputDate(data.startDate), endDate: toInputDate(data.endDate) };
            }
        }
        setFormData(formDataToSet);
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => setModal({ isOpen: false });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { type, data } = modal;

        let finalFormData = { ...formData };
        if (type === 'addCampaign' || type === 'editCampaign') {
             finalFormData.startDate = fromInputDate(finalFormData.startDate);
             finalFormData.endDate = fromInputDate(finalFormData.endDate);
        }

        switch(type) {
            case 'addLead':
                 const newLead: Lead = {
                    id: `L${Date.now()}`,
                    name: formData.name || '',
                    phone: formData.phone || '',
                    email: formData.email || '',
                    source: formData.source || 'Facebook',
                    campaignId: formData.campaignId || '',
                    receivedDate: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'), // DD/MM/YYYY
                    status: formData.status || 'جديد',
                    followUpDate: formData.followUpDate || '',
                    assignedAgentId: formData.assignedAgentId || '',
                    notes: formData.notes || '',
                };
                setLeads(prev => [...prev, newLead]);
                break;
            case 'editLead':
                setLeads(prev => prev.map(lead => lead.id === data?.id ? { ...data, ...formData } as Lead : lead));
                break;
            case 'addCampaign':
                setCampaigns(prev => [...prev, { ...finalFormData, id: `C${Date.now()}` }]);
                break;
            case 'editCampaign':
                setCampaigns(prev => prev.map(c => c.id === data.id ? { ...data, ...finalFormData } : c));
                break;
        }

        closeModal();
    };

    const handleDelete = () => {
        if (!modal.data) return;

        switch(modal.type) {
            case 'deleteLead':
                setLeads(prev => prev.filter(lead => lead.id !== modal.data!.id));
                break;
            case 'deleteCampaign':
                setCampaigns(prev => prev.filter(c => c.id !== modal.data.id));
                break;
        }
        closeModal();
    };

    const totalLeads = useMemo(() => leads.length, [leads]);
    const newLeads = useMemo(() => leads.filter(l => l.status === 'جديد').length, [leads]);
    const convertedLeads = useMemo(() => leads.filter(l => l.status === 'تم التحويل').length, [leads]);
    const conversionRate = useMemo(() => {
        if (totalLeads === 0) return '0%';
        return `${((convertedLeads / totalLeads) * 100).toFixed(1)}%`;
    }, [totalLeads, convertedLeads]);
    
    const displayLeads = useMemo(() => {
      return leads.map(lead => {
        const agent = agents.find(a => a.id === lead.assignedAgentId);
        return {
          ...lead,
          assignedAgentName: agent ? agent.fullName.split('(')[0].trim() : 'غير معين'
        };
      });
    }, [leads, agents]);


    const campaignPerformance: DisplayCampaign[] = useMemo(() => {
        return campaigns.map(campaign => {
            const campaignLeads = leads.filter(lead => lead.campaignId === campaign.id);
            const totalLeads = campaignLeads.length;
            const convertedLeads = campaignLeads.filter(lead => lead.status === 'تم التحويل').length;
            const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) + '%' : '0.0%';
            
            const totalCost = expenses
                .filter(e => e.campaignId === campaign.id)
                .reduce((acc, e) => acc + e.amount, 0);
                
            const costPerLead = totalLeads > 0 ? (totalCost / totalLeads).toFixed(2) : '0.00';

            return {
                ...campaign,
                totalLeads,
                convertedLeads,
                conversionRate,
                cost: `${totalCost.toLocaleString()} د.م`,
                costPerLead: `${costPerLead} د.م`,
            };
        });
    }, [campaigns, leads, expenses]);

    const channelPerformance = useMemo(() => {
        const sources: Array<'Facebook' | 'Google' | 'Instagram' | 'WhatsApp'> = ['Facebook', 'Google', 'Instagram', 'WhatsApp'];
        return sources.map(source => {
            const channelLeads = leads.filter(lead => lead.source === source);
            const totalLeads = channelLeads.length;
            const convertedLeads = channelLeads.filter(lead => lead.status === 'تم التحويل').length;
            const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) + '%' : '0.0%';

            return {
                source,
                totalLeads,
                convertedLeads,
                conversionRate,
            };
        });
    }, [leads]);

    const leadHeaders: { key: keyof DisplayLead; label: string }[] = [ { key: 'name', label: 'الاسم' }, { key: 'phone', label: 'رقم الهاتف' }, { key: 'source', label: 'المصدر' }, { key: 'receivedDate', label: 'تاريخ الاستلام' }, { key: 'status', label: 'حالة العميل' }, { key: 'assignedAgentName', label: 'Agent المسؤول' } ];
    const campaignHeaders: { key: keyof DisplayCampaign; label: string }[] = [ { key: 'name', label: 'اسم الحملة' }, { key: 'startDate', label: 'تاريخ البدء' }, { key: 'endDate', label: 'تاريخ الانتهاء' }, { key: 'totalLeads', label: 'إجمالي العملاء' }, { key: 'convertedLeads', label: 'التحويلات' }, { key: 'conversionRate', label: 'معدل التحويل' }, { key: 'cost', label: 'التكلفة' }, { key: 'costPerLead', label: 'تكلفة العميل' } ];
    const channelHeaders: { key: keyof ChannelPerformance; label: string }[] = [ { key: 'source', label: 'القناة' }, { key: 'totalLeads', label: 'إجمالي العملاء' }, { key: 'convertedLeads', label: 'التحويلات' }, { key: 'conversionRate', label: 'معدل التحويل' } ];

    const tabs = [
        { label: 'العملاء المحتملين', content: <DataTable<DisplayLead> 
            title="قائمة العملاء المحتملين" 
            data={displayLeads} 
            headers={leadHeaders} 
            searchKeys={['name', 'phone', 'email']}
            filters={[{key: 'source', label: 'المصدر'}, {key: 'status', label: 'الحالة'}]}
            onAdd={() => openModal('addLead')}
            onEdit={(item) => openModal('editLead', leads.find(l => l.id === item.id))}
            onDelete={(item) => openModal('deleteLead', item)}
        /> },
        { label: 'الحملات الإعلانية', content: <DataTable<DisplayCampaign>
            title="أداء الحملات الإعلانية"
            data={campaignPerformance}
            headers={campaignHeaders}
            searchKeys={['name']}
            onAdd={() => openModal('addCampaign')}
            onEdit={(item) => openModal('editCampaign', item)}
            onDelete={(item) => openModal('deleteCampaign', item)}
        /> },
        { label: 'أداء القنوات', content: <DataTable<ChannelPerformance>
            title="أداء قنوات التسويق"
            data={channelPerformance}
            headers={channelHeaders}
            searchKeys={['source']}
        /> }
    ];

    const getModalTitle = () => {
        switch (modal.type) {
            case 'addLead': return 'إضافة عميل محتمل جديد';
            case 'editLead': return 'تعديل بيانات العميل';
            case 'deleteLead': return 'حذف عميل محتمل';
            case 'addCampaign': return 'إضافة حملة إعلانية جديدة';
            case 'editCampaign': return 'تعديل الحملة الإعلانية';
            case 'deleteCampaign': return 'حذف الحملة الإعلانية';
            default: return 'تأكيد';
        }
    };

    const renderModalContent = () => {
        if (modal.type?.includes('delete')) {
            const itemType = modal.type.includes('Lead') ? 'العميل المحتمل' : 'الحملة الإعلانية';
            return (
                <div>
                    <p>هل أنت متأكد أنك تريد حذف {itemType} <strong>{modal.data?.name}</strong>؟</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">تأكيد الحذف</button>
                    </div>
                </div>
            );
        }

        if (modal.type === 'addCampaign' || modal.type === 'editCampaign') {
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div><label className="block text-sm font-medium text-gray-700">اسم الحملة</label><input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                     <div><label className="block text-sm font-medium text-gray-700">تاريخ البدء</label><input type="date" name="startDate" value={formData.startDate || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                     <div><label className="block text-sm font-medium text-gray-700">تاريخ الانتهاء</label><input type="date" name="endDate" value={formData.endDate || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">حفظ</button>
                    </div>
                </form>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">الاسم</label><input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">رقم الهاتف</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label><input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700">المصدر</label><select name="source" value={formData.source || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="Facebook">Facebook</option><option value="Google">Google</option><option value="Instagram">Instagram</option><option value="WhatsApp">WhatsApp</option></select></div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">الحملة الإعلانية</label>
                    <select name="campaignId" value={formData.campaignId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">اختر حملة</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Agent المسؤول</label>
                    <select name="assignedAgentId" value={formData.assignedAgentId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">اختر وكيلاً</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.fullName}</option>
                        ))}
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">حالة العميل</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="جديد">جديد</option><option value="متصل به">متصل به</option><option value="حجز حصة">حجز حصة</option><option value="تم التحويل">تم التحويل</option><option value="ملغي">ملغي</option></select></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">الملاحظات</label><input type="text" name="notes" value={formData.notes || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">حفظ</button>
                </div>
            </form>
        );
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">لوحة تحكم مسؤول التسويق</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="إجمالي العملاء المحتملين" value={totalLeads} icon={<UsersIcon />} color="blue" />
                <DashboardCard title="عملاء جدد" value={newLeads} icon={<UserPlusIcon />} color="yellow" />
                <DashboardCard title="التحويلات الناجحة" value={convertedLeads} icon={<UserPlusIcon />} color="green" />
                <DashboardCard title="نسبة التحويل" value={conversionRate} icon={<PercentIcon />} color="purple" />
            </div>
            <TabbedView tabs={tabs} />
            <Modal isOpen={modal.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
            <ReportUploader role="MARKETER" roleName="مسؤول التسويق" reports={reports} setReports={setReports} />
        </div>
    );
};

export default MarketerView;