import React from 'react';
import type { View, User } from '../types';
import { DashboardIcon, ChatIcon, LogoutIcon, DepartmentsIcon, UsersIcon, SettingsIcon } from './icons';
import { MOCK_USERS } from '../constants';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
    const activeClasses = 'bg-gray-700 text-white';
    const inactiveClasses = 'text-gray-400 hover:bg-gray-700 hover:text-white';
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <Icon className="w-6 h-6 mr-3" />
            <span className="font-medium">{label}</span>
        </button>
    );
};

const userProfile: User = MOCK_USERS[0];

const UserProfile: React.FC<{ user: User }> = ({ user }) => (
    <div className="mt-auto border-t border-gray-700 pt-4">
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                {user.avatarInitials}
            </div>
            <div className="ml-3">
                <p className="font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
        </div>
        <button className="flex items-center w-full mt-4 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            <LogoutIcon className="w-6 h-6 mr-3" />
            <span className="font-medium">Log Out</span>
        </button>
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    return (
        <aside className="w-64 bg-gray-800 p-4 flex-shrink-0 flex flex-col" role="navigation">
            <div>
                <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-xl flex-shrink-0">V</div>
                    <h1 className="ml-3 text-xl font-bold text-white">Vanna AI</h1>
                </div>
                <nav className="space-y-2">
                    <NavItem
                        icon={DashboardIcon}
                        label="Dashboard"
                        isActive={currentView === 'dashboard'}
                        onClick={() => setView('dashboard')}
                    />
                    <NavItem
                        icon={ChatIcon}
                        label="Chat with Data"
                        isActive={currentView === 'chat'}
                        onClick={() => setView('chat')}
                    />
                    <NavItem
                        icon={DepartmentsIcon}
                        label="Departments"
                        isActive={currentView === 'departments'}
                        onClick={() => setView('departments')}
                    />
                    <NavItem
                        icon={UsersIcon}
                        label="Users"
                        isActive={currentView === 'users'}
                        onClick={() => setView('users')}
                    />
                    <NavItem
                        icon={SettingsIcon}
                        label="Settings"
                        isActive={currentView === 'settings'}
                        onClick={() => setView('settings')}
                    />
                </nav>
            </div>
            <UserProfile user={userProfile} />
        </aside>
    );
};