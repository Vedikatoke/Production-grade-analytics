import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-300">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

export const SettingsView: React.FC = () => {
    const currentUser = MOCK_USERS[0];
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [notifications, setNotifications] = useState({
        invoices: true,
        reports: true,
        api: false,
    });

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white">Settings</h1>

            {/* Profile Settings */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-3">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-semibold transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-3">Notifications</h2>
                <div className="space-y-4">
                    <ToggleSwitch
                        label="New Invoice Alerts"
                        enabled={notifications.invoices}
                        onChange={(val) => setNotifications(p => ({ ...p, invoices: val }))}
                    />
                     <ToggleSwitch
                        label="Weekly Report Summaries"
                        enabled={notifications.reports}
                        onChange={(val) => setNotifications(p => ({ ...p, reports: val }))}
                    />
                     <ToggleSwitch
                        label="API Status Changes"
                        enabled={notifications.api}
                        onChange={(val) => setNotifications(p => ({ ...p, api: val }))}
                    />
                </div>
            </div>

             {/* Data Preferences */}
             <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-3">Data Preferences</h2>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-400 mb-1">Default Date Range</label>
                        <select
                            id="region"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
