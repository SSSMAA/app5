import React from 'react';
import Notifications from './Notifications';
import { Notification, User, Role } from '../types';
import { ROLES } from '../constants';

interface HeaderProps {
    user: User;
    activeView: Role;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const Header: React.FC<HeaderProps> = ({ user, activeView, notifications, setNotifications }) => {
    const viewName = ROLES.find(r => r.id === activeView)?.arabicName || 'لوحة التحكم';
    const userInitial = user.fullName.charAt(0).toUpperCase();

    return (
        <header className="flex-shrink-0 bg-white shadow-sm border-b p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{viewName}</h2>
            <div className="flex items-center gap-4">
                <Notifications notifications={notifications} setNotifications={setNotifications} />
                <div className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                    {userInitial}
                </div>
            </div>
        </header>
    );
};

export default Header;