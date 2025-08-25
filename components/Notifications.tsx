import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

interface NotificationsProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };
    
    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={handleToggle} className="relative text-gray-500 hover:text-gray-700">
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-80 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        <div className="flex justify-between items-center px-4 py-2 border-b">
                            <h3 className="font-semibold text-gray-800">الإشعارات</h3>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllAsRead} className="text-xs text-indigo-600 hover:underline">
                                    تحديد الكل كمقروء
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.slice().reverse().map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-indigo-50' : ''}`}
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        <p className="text-sm text-gray-700">{notification.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(notification.date).toLocaleString('ar-EG')}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">لا توجد إشعارات جديدة.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
