import { GoogleGenAI } from "@google/genai";
import { MOCK_INVOICES, MOCK_VENDORS } from '../constants';

// Ensure you have a valid API_KEY in your environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using mocked responses.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SCHEMA_PROMPT = `
You are an expert PostgreSQL data analyst. You are given a database schema and a user question. 
Your task is to generate a valid SQL query to answer the question.

Database Schema:
- invoices (invoice_id: TEXT, vendor_id: INTEGER, amount: NUMERIC, due_date: DATE, status: TEXT) -- Status can be 'Paid', 'Pending', 'Overdue'
- vendors (vendor_id: INTEGER, name: TEXT, category: TEXT) -- Category can be 'Software', 'Marketing', 'Office Supplies', 'Travel', 'Operations'

User Question:
"{{USER_PROMPT}}"

Generate only the SQL query. Do not add any explanation, markdown formatting, or trailing semicolons.
`;

const generateMockDataFromSql = (sql: string): Record<string, any>[] => {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('group by v.name')) { // Top vendors
        const vendorSpend = MOCK_INVOICES.reduce((acc, invoice) => {
            const vendor = MOCK_VENDORS.find(v => v.id === invoice.vendorId);
            if (vendor) {
                acc[vendor.name] = (acc[vendor.name] || 0) + invoice.amount;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(vendorSpend)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([vendor_name, total_spend]) => ({ vendor_name, total_spend: `$${total_spend.toFixed(2)}` }));
    }

    if (lowerSql.includes("status = 'overdue'")) { // Overdue invoices
        return MOCK_INVOICES
            .filter(inv => inv.status === 'Overdue')
            .slice(0, 10)
            .map(inv => {
                const vendor = MOCK_VENDORS.find(v => v.id === inv.vendorId);
                return { invoice_id: inv.id, vendor_name: vendor?.name, amount: `$${inv.amount.toFixed(2)}`, due_date: inv.dueDate };
            });
    }

    if (lowerSql.includes('sum(amount)')) { // Total spend
        const totalSpend = MOCK_INVOICES.reduce((acc, inv) => acc + inv.amount, 0);
        return [{ total_spend: `$${totalSpend.toFixed(2)}` }];
    }

    // Default: return a few recent invoices
    return MOCK_INVOICES.slice(0, 5).map(inv => {
        const vendor = MOCK_VENDORS.find(v => v.id === inv.vendorId);
        return {
            invoice_id: inv.id,
            vendor_name: vendor?.name,
            amount: `$${inv.amount.toFixed(2)}`,
            status: inv.status,
            date: inv.date,
            due_date: inv.dueDate,
        };
    });
};

export const generateSqlAndData = async (prompt: string): Promise<{ sql: string; data: Record<string, any>[] }> => {
    let sqlQuery = '';
    
    if (ai) {
        try {
            const fullPrompt = SCHEMA_PROMPT.replace('{{USER_PROMPT}}', prompt);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });
            
            // Clean up the response to get just the SQL
            sqlQuery = response.text.trim().replace(/```sql|```/g, '').trim();

        } catch (error) {
            console.error("Gemini API error:", error);
            // Fallback to mock SQL on API error
            sqlQuery = `SELECT 'Error generating SQL, using mock response' AS status;`;
        }
    } else {
        // Mock SQL generation if no API key
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        if (prompt.toLowerCase().includes('top 5 vendors')) {
            sqlQuery = `SELECT v.name, SUM(i.amount) as total_spend FROM vendors v JOIN invoices i ON v.vendor_id = i.vendor_id GROUP BY v.name ORDER BY total_spend DESC LIMIT 5;`;
        } else if (prompt.toLowerCase().includes('overdue')) {
            sqlQuery = `SELECT i.invoice_id, v.name as vendor_name, i.amount, i.due_date FROM invoices i JOIN vendors v ON i.vendor_id = v.vendor_id WHERE i.status = 'Overdue' ORDER BY i.due_date DESC;`;
        } else {
            sqlQuery = `SELECT * FROM invoices LIMIT 5;`;
        }
    }

    const data = generateMockDataFromSql(sqlQuery);
    return { sql: sqlQuery, data };
};