
import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import { SparklesIcon, CopyIcon, CheckIcon } from './icons';

interface ChatMessageProps {
    message: ChatMessage;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg my-2 relative">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg">
                <span className="text-xs font-semibold text-gray-400">Generated SQL</span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <pre className="p-4 text-sm text-cyan-300 overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const DataTable: React.FC<{ data: Record<string, any>[] }> = ({ data }) => {
    if (!data || data.length === 0) return null;
    const headers = Object.keys(data[0]);
    return (
        <div className="my-2 overflow-x-auto border border-gray-600 rounded-lg">
            <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-800">
                    <tr>
                        {headers.map(header => (
                            <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                {header.replace(/_/g, ' ')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-700 divide-y divide-gray-600">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map(header => (
                                <td key={`${rowIndex}-${header}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">
                                    {row[header]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const bgColor = isUser ? 'bg-blue-600' : 'bg-gray-700';
    const alignment = isUser ? 'justify-end' : 'justify-start';

    return (
        <div className={`flex ${alignment}`}>
            <div className={`flex items-start space-x-2 max-w-xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isUser && (
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                )}
                <div className={`p-4 rounded-lg ${bgColor}`}>
                    <p className={`text-white ${message.isError ? 'text-red-400' : ''}`}>{message.content}</p>
                    {message.sql && <CodeBlock code={message.sql} />}
                    {message.data && <DataTable data={message.data} />}
                </div>
            </div>
        </div>
    );
};
