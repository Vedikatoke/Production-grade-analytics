import React, { useState, useMemo } from 'react';
import type { Invoice, Vendor, SortConfig } from '../types';
import { SearchIcon, ArrowUpIcon, ArrowDownIcon, DownloadIcon } from './icons';

interface InvoicesTableProps {
    invoices: Invoice[];
    vendors: Vendor[];
}

const statusColorMap = {
    Paid: 'bg-green-500/20 text-green-400',
    Pending: 'bg-yellow-500/20 text-yellow-400',
    Overdue: 'bg-red-500/20 text-red-400',
};

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, vendors }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date', direction: 'descending' });

    const enrichedInvoices = useMemo(() => {
        return invoices.map(invoice => {
            const vendor = vendors.find(v => v.id === invoice.vendorId);
            return {
                ...invoice,
                vendorName: vendor ? vendor.name : 'Unknown Vendor'
            };
        });
    }, [invoices, vendors]);

    const filteredAndSortedInvoices = useMemo(() => {
        let sortableItems = [...enrichedInvoices];

        if (searchTerm) {
            sortableItems = sortableItems.filter(item =>
                item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.status.toLowerCase().includes(searchTerm.toLowerCase())
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
    }, [enrichedInvoices, searchTerm, sortConfig]);

    const requestSort = (key: SortConfig['key']) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
        const headers = ['Invoice ID', 'Vendor', 'Date', 'Amount', 'Status'];
        // Escape commas in vendor names if any
        const escapeCsvCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
        
        const rows = filteredAndSortedInvoices.map(invoice => 
            [
                escapeCsvCell(invoice.id),
                escapeCsvCell(invoice.vendorName), 
                escapeCsvCell(invoice.date), 
                invoice.amount, 
                escapeCsvCell(invoice.status)
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "invoices.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SortableHeader: React.FC<{ sortKey: SortConfig['key'], children: React.ReactNode }> = ({ sortKey, children }) => {
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
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative flex-grow w-full sm:w-auto">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        onChange={e => setSearchTerm(e.target.value)}
                        aria-label="Search invoices"
                    />
                </div>
                <button 
                    onClick={handleExportCSV}
                    className="flex-shrink-0 flex items-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white hover:bg-gray-600 transition-colors w-full sm:w-auto"
                    aria-label="Export data as CSV"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <SortableHeader sortKey="vendorName">Vendor</SortableHeader>
                            <SortableHeader sortKey="date">Date</SortableHeader>
                            <SortableHeader sortKey="id">Invoice #</SortableHeader>
                            <SortableHeader sortKey="amount">Amount</SortableHeader>
                            <SortableHeader sortKey="status">Status</SortableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredAndSortedInvoices.map(invoice => (
                            <tr key={invoice.id} className="hover:bg-gray-700/50 transition-colors">
                                <td className="p-4 whitespace-nowrap text-sm font-medium text-white">{invoice.vendorName}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-300">{invoice.date}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-300">{invoice.id}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-300">${invoice.amount.toFixed(2)}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[invoice.status]}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
