import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { User } from '../types';
import { PRIVILEGES } from '../constants';

interface SettingsViewProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const roleArabicNames: Record<User['role'], string> = {
    'AGENT': 'وكيل خدمة العملاء',
    'TEACHER': 'أستاذ',
    'HEAD_TRAINER': 'مسؤول التدريب',
    'MARKETER': 'مسؤول التسويق',
    'DIRECTOR': 'المدير التنفيذي',
    'ADMIN': 'المدير العام',
};

type UserWithDisplayRole = User & { roleDisplay: string };

const SettingsView: React.FC<SettingsViewProps> = ({ users, setUsers }) => {
    const [modal, setModal] = useState<{ isOpen: boolean; type?: 'addUser' | 'editUser' | 'deleteUser'; data?: User }>({ isOpen: false });
    const [formData, setFormData] = useState<Partial<User> & { password?: string }>({});

    const openModal = (type: typeof modal.type, data?: User) => {
        setFormData(data ? { ...data } : { role: 'ADMIN', status: 'Active', privileges: [] });
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => setModal({ isOpen: false });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'role') {
            // Reset privileges when role changes
            setFormData(prev => ({ ...prev, [name]: value as User['role'], privileges: [] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePrivilegeChange = (privilegeId: string) => {
        setFormData(prev => {
            const currentPrivileges = prev.privileges || [];
            const newPrivileges = currentPrivileges.includes(privilegeId)
                ? currentPrivileges.filter(p => p !== privilegeId)
                : [...currentPrivileges, privilegeId];
            return { ...prev, privileges: newPrivileges };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, data } = modal;
        
        // Basic validation
        if (!formData.fullName || !formData.username || !formData.role || !formData.status) {
            alert('يرجى ملء جميع الحقول المطلوبة.');
            return;
        }

        if (type === 'addUser') {
            if (!formData.password) {
                alert('يرجى إدخال كلمة المرور.');
                return;
            }
            const newUser: User = {
                id: `U${Date.now()}`,
                fullName: formData.fullName,
                username: formData.username,
                role: formData.role,
                status: formData.status as 'Active' | 'Inactive',
                privileges: formData.privileges || [],
            };
            setUsers(prev => [...prev, newUser]);
        } else if (type === 'editUser' && data) {
            setUsers(prev => prev.map(user => user.id === data.id ? { ...data, ...formData } as User : user));
        }

        closeModal();
    };

    const handleDelete = () => {
        if (modal.data) {
            setUsers(prev => prev.filter(user => user.id !== modal.data!.id));
        }
        closeModal();
    };
    
    const userTableData = users.map(user => ({
        ...user,
        roleDisplay: roleArabicNames[user.role]
    }));

    const userHeaders: { key: keyof UserWithDisplayRole; label: string }[] = [
        { key: 'fullName', label: 'الاسم الكامل' },
        { key: 'username', label: 'اسم المستخدم' },
        { key: 'roleDisplay', label: 'الدور' },
        { key: 'status', label: 'الحالة' },
    ];
    
    const renderModalContent = () => {
        if (modal.type === 'deleteUser') {
            return (
                <div>
                    <p>هل أنت متأكد أنك تريد حذف المستخدم <strong>{modal.data?.fullName}</strong>؟</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">تأكيد الحذف</button>
                    </div>
                </div>
            );
        }

        const availablePrivileges = formData.role ? PRIVILEGES[formData.role as keyof typeof PRIVILEGES] : [];

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">الاسم الكامل</label><input type="text" name="fullName" value={formData.fullName || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">اسم المستخدم</label><input type="text" name="username" value={formData.username || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">كلمة المرور</label><input type="password" name="password" value={formData.password || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" placeholder={modal.type === 'editUser' ? 'اتركه فارغًا لعدم التغيير' : ''} required={modal.type === 'addUser'} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">الدور</label><select name="role" value={formData.role || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required>
                        <option value="ADMIN">المدير العام</option>
                        <option value="DIRECTOR">المدير التنفيذي</option>
                        <option value="MARKETER">مسؤول التسويق</option>
                        <option value="HEAD_TRAINER">مسؤول التدريب</option>
                        <option value="AGENT">وكيل خدمة العملاء</option>
                        <option value="TEACHER">أستاذ</option>
                    </select></div>
                    <div><label className="block text-sm font-medium text-gray-700">الحالة</label><select name="status" value={formData.status || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm border-gray-300" required><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                </div>
                
                {availablePrivileges.length > 0 && (
                     <fieldset className="pt-4 mt-4 border-t">
                        <legend className="text-base font-medium text-gray-900">الصلاحيات</legend>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availablePrivileges.map(privilege => (
                                <div key={privilege.id} className="relative flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id={privilege.id}
                                            name="privileges"
                                            type="checkbox"
                                            checked={(formData.privileges || []).includes(privilege.id)}
                                            onChange={() => handlePrivilegeChange(privilege.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="mr-3 text-sm">
                                        <label htmlFor={privilege.id} className="font-medium text-gray-700">{privilege.label}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                )}
               
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">حفظ</button>
                </div>
            </form>
        )
    };

    const getModalTitle = () => {
        switch(modal.type) {
            case 'addUser': return 'إضافة مستخدم جديد';
            case 'editUser': return `تعديل المستخدم: ${modal.data?.fullName}`;
            case 'deleteUser': return 'حذف المستخدم';
            default: return '';
        }
    };
    

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">إدارة المستخدمين والصلاحيات</h2>
            <DataTable
                title="قائمة المستخدمين"
                data={userTableData}
                headers={userHeaders}
                searchKeys={['fullName', 'username']}
                filters={[{ key: 'roleDisplay', label: 'الدور' }, { key: 'status', label: 'الحالة' }]}
                onAdd={() => openModal('addUser')}
                onEdit={(item) => openModal('editUser', users.find(u => u.id === item.id))}
                onDelete={(item) => openModal('deleteUser', users.find(u => u.id === item.id))}
            />
            <Modal isOpen={modal.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default SettingsView;