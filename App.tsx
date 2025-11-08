import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LabelList, Sector } from 'recharts';
// FIX: Import SendIcon used in the chat input.
import { SparklesIcon, TrashIcon, SendIcon } from './components/icons';
import type { Invoice, Vendor, Category, ChatMessage, View, SortConfig } from './types';
import { generateSqlAndData } from './services/geminiService';
import { MOCK_INVOICES, MOCK_VENDORS } from './constants';
import { DashboardCard } from './components/DashboardCard';
import { InvoicesTable } from './components/InvoicesTable';
import { ChatMessageComponent } from './components/ChatMessage';
import { Sidebar } from './components/Sidebar';
import { DepartmentsView } from './components/DepartmentsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');

    const renderView = () => {
        switch(view) {
            case 'dashboard':
                return <DashboardView />;
            case 'chat':
                return <ChatView />;
            case 'departments':
                return <DepartmentsView />;
            case 'users':
                return <UsersView />;
            case 'settings':
                return <SettingsView />;
            default:
                return <DashboardView />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <Sidebar currentView={view} setView={setView} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

// Sub-components for views to keep App.tsx clean
const DashboardView: React.FC = () => {
    // Mock data fetching hook simulation
    const { stats, invoiceTrends, spendByVendor, spendByCategory, cashOutflow, isLoading } = useMockAnalyticsData();
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, [setActiveIndex]);

    // FIX: The recharts types are outdated. Casting Pie to `any` allows the use of the valid `activeIndex` prop.
    const PieWithActiveShapeFix = Pie as any;


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div></div>;
    }

    const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

    const renderActiveShape = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={20} fontWeight="bold">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`$${value.toLocaleString()}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(${(percent * 100).toFixed(2)}%)`}
            </text>
            </g>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Spend (YTD)" value={stats.totalSpendYTD} />
                <DashboardCard title="Total Invoices Processed" value={stats.totalInvoices} />
                <DashboardCard title="Documents Uploaded" value={stats.documentsUploaded} />
                <DashboardCard title="Average Invoice Value" value={stats.avgInvoiceValue} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Invoice Volume + Value Trend">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={invoiceTrends} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af', dx: -10 }} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Volume', angle: 90, position: 'insideRight', fill: '#9ca3af', dx: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #4a4a4a' }} />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorValue)" name="Invoice Value" activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                            <Area yAxisId="right" type="monotone" dataKey="volume" stroke="#8b5cf6" fill="transparent" name="Invoice Volume" activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Spend by Vendor (Top 5)">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={spendByVendor} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" horizontal={false} />
                            <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `$${(Number(value)/1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" width={100} stroke="#9ca3af" tick={{ fill: '#e5e7eb' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #4a4a4a' }} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="value" name="Spend" fill="#3b82f6">
                                <LabelList dataKey="value" position="right" formatter={(value: number) => `$${(value / 1000).toFixed(1)}k`} fill="#e5e7eb" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Spend by Category">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <PieWithActiveShapeFix 
                                data={spendByCategory} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={80}
                                outerRadius={110} 
                                fill="#8884d8" 
                                paddingAngle={5}
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                            >
                                {spendByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </PieWithActiveShapeFix>
                             <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #4a4a4a' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Cash Outflow Forecast">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cashOutflow} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(Number(value)/1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #4a4a4a' }} formatter={(value: number) => `$${value.toLocaleString()}`} cursor={{fill: 'rgba(139, 92, 246, 0.2)'}}/>
                            <Legend />
                            <Bar dataKey="value" name="Projected Outflow" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
            
            {/* Invoices Table */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
                 <h2 className="text-xl font-semibold mb-4 text-white">All Invoices</h2>
                <InvoicesTable invoices={MOCK_INVOICES} vendors={MOCK_VENDORS} />
            </div>
        </div>
    );
};

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        {children}
    </div>
);

const CHAT_HISTORY_KEY = 'vanna_ai_chat_history';

const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch (error) {
            console.error("Failed to parse chat history from localStorage", error);
            return [];
        }
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save chat history to localStorage", error);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await generateSqlAndData(input);
            const aiMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'ai',
                content: 'Here is the SQL query and the result based on your request.',
                sql: result.sql,
                data: result.data,
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error fetching from Gemini:", error);
            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                isError: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-gray-800/50 rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-8 h-8 text-cyan-500" />
                    <h2 className="text-2xl font-semibold text-white">Chat with your Data</h2>
                </div>
                {messages.length > 0 && (
                    <button 
                        onClick={handleClearChat}
                        className="flex items-center px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                        aria-label="Clear chat history"
                    >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Clear Chat
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                        <p>Ask questions like "What's the total spend last quarter?" or "List top 5 vendors by spend".</p>
                    </div>
                )}
                {messages.map(msg => (
                    <ChatMessageComponent key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="p-3 bg-gray-700 rounded-lg">
                            <div className="animate-pulse flex space-x-4">
                                <div className="rounded-full bg-gray-600 h-2 w-2"></div>
                                <div className="rounded-full bg-gray-600 h-2 w-2"></div>
                                <div className="rounded-full bg-gray-600 h-2 w-2"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask a question about your data..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-full py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isLoading}
                        aria-label="Chat input"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const useMockAnalyticsData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        stats: { totalSpendYTD: '$0', totalInvoices: 0, documentsUploaded: 0, avgInvoiceValue: '$0' },
        invoiceTrends: [] as { name: string; value: number; volume: number; }[],
        spendByVendor: [] as { name: string; value: number; }[],
        spendByCategory: [] as { name: string; value: number; }[],
        cashOutflow: [] as { name: string; value: number; }[],
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const totalSpend = MOCK_INVOICES.reduce((acc, inv) => acc + inv.amount, 0);
            const avgInvoiceValue = totalSpend / MOCK_INVOICES.length;
            const stats = {
                totalSpendYTD: `$${(totalSpend / 1000).toFixed(1)}k`,
                totalInvoices: MOCK_INVOICES.length,
                documentsUploaded: MOCK_INVOICES.length + 25, // Mocked value
                avgInvoiceValue: `$${avgInvoiceValue.toFixed(2)}`,
            };

            const trends = MOCK_INVOICES.reduce((acc, inv) => {
                const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
                if (!acc[month]) {
                    acc[month] = { value: 0, volume: 0 };
                }
                acc[month].value += inv.amount;
                acc[month].volume += 1;
                return acc;
            }, {} as Record<string, { value: number, volume: number }>);
            
            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const invoiceTrends = monthOrder
                .filter(month => trends[month])
                .map(month => ({
                    name: month,
                    value: trends[month].value,
                    volume: trends[month].volume,
                }));

            const vendorSpend = MOCK_INVOICES.reduce((acc, invoice) => {
                const vendor = MOCK_VENDORS.find(v => v.id === invoice.vendorId);
                if (vendor) {
                    acc[vendor.name] = (acc[vendor.name] || 0) + invoice.amount;
                }
                return acc;
            }, {} as Record<string, number>);

            const spendByVendor = Object.entries(vendorSpend)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, value]) => ({ name, value }));

            const categorySpend = MOCK_INVOICES.reduce((acc, invoice) => {
                const vendor = MOCK_VENDORS.find(v => v.id === invoice.vendorId);
                if (vendor) {
                    acc[vendor.category] = (acc[vendor.category] || 0) + invoice.amount;
                }
                return acc;
            }, {} as Record<string, number>);

            const spendByCategory = Object.entries(categorySpend).map(([name, value]) => ({ name, value }));
            
            const today = new Date();
            const upcomingPayments = MOCK_INVOICES.filter(inv => ['Pending', 'Overdue'].includes(inv.status));
            
            const outflow = {
                'Overdue': 0,
                'Next 7 Days': 0,
                'Next 30 Days': 0,
                'Next 60 Days': 0,
            };
    
            upcomingPayments.forEach(inv => {
                if (inv.status === 'Overdue') {
                    outflow['Overdue'] += inv.amount;
                } else { // Pending
                    const dueDate = new Date(inv.dueDate);
                    const diffDays = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
                    
                    if (diffDays >=0 && diffDays <= 7) {
                        outflow['Next 7 Days'] += inv.amount;
                    } else if (diffDays > 7 && diffDays <= 30) {
                        outflow['Next 30 Days'] += inv.amount;
                    } else if (diffDays > 30 && diffDays <= 60) {
                        outflow['Next 60 Days'] += inv.amount;
                    }
                }
            });
    
            const cashOutflow = Object.entries(outflow).map(([name, value]) => ({ name, value }));

            setData({ stats, invoiceTrends, spendByVendor, spendByCategory, cashOutflow });
            setIsLoading(false);
        }, 1500); // Simulate network delay
        return () => clearTimeout(timer);
    }, []);

    return { ...data, isLoading };
};

export default App;