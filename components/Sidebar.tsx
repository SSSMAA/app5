import React from 'react';
import type { User, Role } from '../types';
import { ROLES, MENU_PERMISSIONS } from '../constants';

interface SidebarProps {
  user: User;
  activeView: Role;
  setActiveView: (view: Role) => void;
  onLogout: () => void;
}

const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView, onLogout }) => {
  const userRoleInfo = ROLES.find(r => r.id === user.role);

  const visibleMenuIds = MENU_PERMISSIONS[user.role];
  const visibleMenuItems = ROLES.filter(role => visibleMenuIds.includes(role.id));

  return (
    <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
      <div className="h-20 flex items-center justify-center border-b">
        <h1 className="text-2xl font-bold text-indigo-600">ISCHOOLGO</h1>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-2xl mb-2">
                {user.fullName.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-gray-800">{user.fullName}</p>
            <p className="text-sm text-gray-500">{userRoleInfo?.arabicName}</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">القائمة الرئيسية</p>
        <ul>
          {visibleMenuItems.map((role) => (
            <li key={role.id}>
              <button
                onClick={() => setActiveView(role.id)}
                className={`w-full flex items-center p-3 my-1 rounded-lg transition-all duration-200 ${
                  activeView === role.id
                    ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <span className="me-3">{role.icon}</span>
                <div className="text-right">
                  <p>{role.arabicName}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-50"
          >
            <span className="me-3"><LogoutIcon /></span>
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;