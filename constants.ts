import type { Invoice, Vendor, Category, InvoiceStatus, Department, User } from './types';

// Raw data from Analytics_Test_Data.json
const ANALYTICS_TEST_DATA = [
    {"invoice_id":"INV-2023001","vendor_name":"Innovate Tech","invoice_date":"2023-01-25","due_date":"2023-02-24","amount":4688.37,"currency":"USD","category":"Software","status":"Paid"},
    {"invoice_id":"INV-2023002","vendor_name":"Google Ads","invoice_date":"2023-11-20","due_date":"2023-12-20","amount":3233.15,"currency":"USD","category":"Marketing","status":"Pending"},
    {"invoice_id":"INV-2023003","vendor_name":"Adobe Inc.","invoice_date":"2023-08-25","due_date":"2023-09-24","amount":4358.49,"currency":"USD","category":"Software","status":"Overdue"},
    {"invoice_id":"INV-2023004","vendor_name":"Meta Platforms","invoice_date":"2023-03-22","due_date":"2023-04-21","amount":337.38,"currency":"USD","category":"Marketing","status":"Paid"},
    {"invoice_id":"INV-2023005","vendor_name":"Cloud Services LLC","invoice_date":"2023-06-21","due_date":"2023-07-21","amount":4381.8,"currency":"USD","category":"Operations","status":"Overdue"},
    {"invoice_id":"INV-2023006","vendor_name":"Innovate Tech","invoice_date":"2023-04-03","due_date":"2023-05-03","amount":352.23,"currency":"USD","category":"Software","status":"Pending"},
    {"invoice_id":"INV-2023007","vendor_name":"Global Travel Inc.","invoice_date":"2023-01-22","due_date":"2023-02-21","amount":2201.37,"currency":"USD","category":"Travel","status":"Pending"},
    {"invoice_id":"INV-2023008","vendor_name":"Creative Solutions","invoice_date":"2023-01-08","due_date":"2023-02-07","amount":4556.55,"currency":"USD","category":"Marketing","status":"Overdue"},
    {"invoice_id":"INV-2023009","vendor_name":"Global Travel Inc.","invoice_date":"2023-06-18","due_date":"2023-07-18","amount":2953.51,"currency":"USD","category":"Travel","status":"Paid"},
    {"invoice_id":"INV-2023010","vendor_name":"Staples","invoice_date":"2023-08-16","due_date":"2023-09-15","amount":1949.33,"currency":"USD","category":"Office Supplies","status":"Paid"},
    {"invoice_id":"INV-2023011","vendor_name":"Adobe Inc.","invoice_date":"2023-08-14","due_date":"2023-09-13","amount":4795.53,"currency":"USD","category":"Software","status":"Pending"},
    {"invoice_id":"INV-2023012","vendor_name":"Cloud Services LLC","invoice_date":"2023-11-25","due_date":"2023-12-25","amount":4778.63,"currency":"USD","category":"Operations","status":"Paid"},
    {"invoice_id":"INV-2023013","vendor_name":"Innovate Tech","invoice_date":"2023-08-04","due_date":"2023-09-03","amount":1660.11,"currency":"USD","category":"Software","status":"Overdue"},
    {"invoice_id":"INV-2023014","vendor_name":"Global Travel Inc.","invoice_date":"2023-07-11","due_date":"2023-08-10","amount":4003.49,"currency":"USD","category":"Travel","status":"Pending"},
    {"invoice_id":"INV-2023015","vendor_name":"Amazon Web Services","invoice_date":"2023-09-24","due_date":"2023-10-24","amount":4533.88,"currency":"USD","category":"Operations","status":"Paid"},
    {"invoice_id":"INV-2023016","vendor_name":"Slack","invoice_date":"2023-04-12","due_date":"2023-05-12","amount":3296.8,"currency":"USD","category":"Software","status":"Overdue"},
    {"invoice_id":"INV-2023017","vendor_name":"Cloud Services LLC","invoice_date":"2023-06-03","due_date":"2023-07-03","amount":4499.86,"currency":"USD","category":"Operations","status":"Pending"},
    {"invoice_id":"INV-2023018","vendor_name":"United Airlines","invoice_date":"2023-04-13","due_date":"2023-05-13","amount":4981.65,"currency":"USD","category":"Travel","status":"Overdue"},
    {"invoice_id":"INV-2023019","vendor_name":"Global Travel Inc.","invoice_date":"2023-12-07","due_date":"2024-01-06","amount":2594.39,"currency":"USD","category":"Travel","status":"Pending"},
    {"invoice_id":"INV-2023020","vendor_name":"Innovate Tech","invoice_date":"2023-02-05","due_date":"2023-03-07","amount":4979.61,"currency":"USD","category":"Software","status":"Paid"},
    {"invoice_id":"INV-2023021","vendor_name":"Global Travel Inc.","invoice_date":"2023-06-25","due_date":"2023-07-25","amount":413.56,"currency":"USD","category":"Travel","status":"Overdue"},
    {"invoice_id":"INV-2023022","vendor_name":"United Airlines","invoice_date":"2023-09-08","due_date":"2023-10-08","amount":2540.2,"currency":"USD","category":"Travel","status":"Paid"},
    {"invoice_id":"INV-2023023","vendor_name":"Office Supplies Co.","invoice_date":"2023-08-16","due_date":"2023-09-15","amount":4826.3,"currency":"USD","category":"Office Supplies","status":"Pending"},
    {"invoice_id":"INV-2023024","vendor_name":"Office Supplies Co.","invoice_date":"2023-10-05","due_date":"2023-11-04","amount":481.56,"currency":"USD","category":"Office Supplies","status":"Paid"},
    {"invoice_id":"INV-2023025","vendor_name":"United Airlines","invoice_date":"2023-06-11","due_date":"2023-07-11","amount":3374.52,"currency":"USD","category":"Travel","status":"Paid"}
];

// Process raw data to fit our application's types
const processData = () => {
  const vendorsMap = new Map<string, { id: number; category: Category }>();
  let vendorIdCounter = 1;

  const invoices: Invoice[] = ANALYTICS_TEST_DATA.map(item => {
    if (!vendorsMap.has(item.vendor_name)) {
      vendorsMap.set(item.vendor_name, {
        id: vendorIdCounter,
        category: item.category as Category,
      });
      vendorIdCounter++;
    }

    const vendor = vendorsMap.get(item.vendor_name)!;

    return {
      id: item.invoice_id,
      vendorId: vendor.id,
      date: item.invoice_date,
      dueDate: item.due_date,
      amount: item.amount,
      status: item.status as InvoiceStatus,
    };
  });

  const vendors: Vendor[] = Array.from(vendorsMap.entries()).map(([name, data]) => ({
    id: data.id,
    name: name,
    category: data.category,
  }));

  // Add any vendors from the initial list that might not be in the test data
  const allVendorNames = new Set(vendors.map(v => v.name));
  // FIX: Explicitly type initialVendors as Vendor[] to avoid type inference issues.
  const initialVendors: Vendor[] = [
      { id: 1, name: 'Adobe Inc.', category: 'Software' },
      { id: 2, name: 'Meta Platforms', category: 'Marketing' },
      { id: 3, name: 'Staples', category: 'Office Supplies' },
      { id: 4, name: 'Expedia Group', category: 'Travel' },
      { id: 5, name: 'Slack', category: 'Software' },
      { id: 6, name: 'Google Ads', category: 'Marketing' },
      { id: 7, name: 'Amazon Web Services', category: 'Operations' },
      { id: 8, name: 'United Airlines', category: 'Travel' }
  ];

  initialVendors.forEach(iv => {
      if(!allVendorNames.has(iv.name)) {
          const newId = Math.max(...vendors.map(v => v.id), 0) + 1;
          vendors.push({ ...iv, id: newId });
          allVendorNames.add(iv.name);
      }
  })


  return { vendors, invoices };
};

const { vendors, invoices } = processData();

export const MOCK_VENDORS: Vendor[] = vendors;
export const MOCK_INVOICES: Invoice[] = invoices;

export const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: 'Engineering', manager: 'Jane Smith', employeeCount: 25, totalSpend: 125000 },
    { id: 2, name: 'Marketing', manager: 'John Doe', employeeCount: 15, totalSpend: 250000 },
    { id: 3, name: 'Sales', manager: 'Sam Wilson', employeeCount: 30, totalSpend: 80000 },
    { id: 4, name: 'Operations', manager: 'Lisa Ray', employeeCount: 12, totalSpend: 150000 },
];

export const MOCK_USERS: User[] = [
    { id: 101, name: 'abc', email: 'alex.doe@example.com', role: 'Data Analyst', departmentId: 2, status: 'Active', avatarInitials: 'A' },
    { id: 102, name: 'Brian Smith', email: 'brian.s@example.com', role: 'Frontend Developer', departmentId: 1, status: 'Active', avatarInitials: 'BS' },
    { id: 103, name: 'Cindy White', email: 'cindy.w@example.com', role: 'Sales Lead', departmentId: 3, status: 'Active', avatarInitials: 'CW' },
    { id: 104, name: 'David Green', email: 'david.g@example.com', role: 'Backend Developer', departmentId: 1, status: 'Inactive', avatarInitials: 'DG' },
    { id: 105, name: 'Emily Brown', email: 'emily.b@example.com', role: 'Marketing Manager', departmentId: 2, status: 'Active', avatarInitials: 'EB' },
    { id: 106, name: 'Frank Black', email: 'frank.b@example.com', role: 'DevOps Engineer', departmentId: 4, status: 'Active', avatarInitials: 'FB' },
];