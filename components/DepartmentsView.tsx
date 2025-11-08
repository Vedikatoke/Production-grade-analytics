import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_DEPARTMENTS } from '../constants';
import { UsersIcon } from './icons';

export const DepartmentsView: React.FC = () => {
    const chartData = [
        { name: 'Q1', spend: 4000 },
        { name: 'Q2', spend: 3000 },
        { name: 'Q3', spend: 2000 },
        { name: 'Q4', spend: 2780 },
      ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Departments</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_DEPARTMENTS.map(dept => (
                    <div key={dept.id} className="bg-gray-800 rounded-lg shadow-lg p-6 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white">{dept.name}</h2>
                                <p className="text-sm text-gray-400">Managed by {dept.manager}</p>
                            </div>
                            <div className="flex items-center bg-gray-700/50 rounded-full px-3 py-1 text-sm">
                                <UsersIcon className="w-4 h-4 mr-2 text-cyan-400"/>
                                {dept.employeeCount}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-300">Total Spend</p>
                            <p className="text-2xl font-semibold text-cyan-400">${dept.totalSpend.toLocaleString()}</p>
                        </div>
                        
                        <div className="mt-4 h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                     <Tooltip
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                        contentStyle={{
                                            backgroundColor: '#1e1e1e',
                                            border: '1px solid #4a4a4a',
                                            fontSize: '12px',
                                            padding: '4px 8px'
                                        }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
