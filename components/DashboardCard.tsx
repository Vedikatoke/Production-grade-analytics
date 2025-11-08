
import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string | number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h4>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
    );
};
