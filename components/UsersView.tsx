import React, { useState, useMemo } from 'react';
import type { User, UserSortConfig } from '../types';
import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { MOCK_USERS, MOCK_DEPARTMENTS } from '../constants';

const statusColorMap = {
    Active: 'bg-green-500/20 text-green-400',
    Inactive: 'bg-gray-500/20 text-gray-400',
};

export const UsersView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<UserSortConfig | null>({ key: 'name', direction: 'ascending' });

    const enrichedUsers = useMemo(() => {
        return MOCK_USERS.map(user => {
            const department = MOCK_DEPARTMENTS.find(d => d.id === user.departmentId);
            return {
                ...user,
                departmentName: department ? department.name : 'N/A'
            };
        });
    }, [MOCK_USERS, MOCK_DEPARTMENTS]);

    const filteredAndSortedUsers = useMemo(() => {
        let sortableItems = [...enrichedUsers];

        if (searchTerm) {
            sortableItems = sortableItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [enrichedUsers, searchTerm, sortConfig]);

    const requestSort = (key: UserSortConfig['key']) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: UserSortConfig['key'], children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig?.key === sortKey;
        const Icon = sortConfig?.direction === 'ascending' ? ArrowUpIcon : ArrowDownIcon;
        return (
            <th onClick={() => requestSort(sortKey)} className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50">
                <div className="flex items-center">
                    {children}
                    {isSorted && <Icon className="w-4 h-4 ml-2" />}
                </div>
            </th>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <div className="bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            onChange={e => setSearchTerm(e.target.value)}
                            aria-label="Search users"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <SortableHeader sortKey="name">User</SortableHeader>
                                <SortableHeader sortKey="departmentName">Department</SortableHeader>
                                <SortableHeader sortKey="role">Role</SortableHeader>
                                <SortableHeader sortKey="status">Status</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredAndSortedUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                                                {user.avatarInitials}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                                <div className="text-sm text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-300">{user.departmentName}</td>
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-300">{user.role}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[user.status]}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
