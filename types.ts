export type View = 'dashboard' | 'chat' | 'departments' | 'users' | 'settings';

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';
export type Category = 'Software' | 'Marketing' | 'Office Supplies' | 'Travel' | 'Operations';

export interface Department {
    id: number;
    name: string;
    manager: string;
    employeeCount: number;
    totalSpend: number;
}
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    departmentId: number;
    status: 'Active' | 'Inactive';
    avatarInitials: string;
}

export interface Vendor {
    id: number;
    name: string;
    category: Category;
}

export interface Invoice {
    id: string;
    vendorId: number;
    date: string;
    dueDate: string;
    amount: number;
    status: InvoiceStatus;
}

export interface ChatMessage {
    id: number;
    role: 'user' | 'ai';
    content: string;
    sql?: string;
    data?: Record<string, any>[];
    isError?: boolean;
}

export interface SortConfig {
    key: keyof Invoice | 'vendorName';
    direction: 'ascending' | 'descending';
}

export interface UserSortConfig {
    key: keyof User | 'departmentName';
    direction: 'ascending' | 'descending';
}
