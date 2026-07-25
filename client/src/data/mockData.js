// Dashboard Stats
export const mockStats = {
  todayOrders: 0,
  todayRevenue: 0,
  kgOrdered: 0,
  kgDelivered: 0,
  activeCustomers: 5,
  cashCollection: 0,
  upiCollection: 0,
  outstanding: 550000,
  pendingDeliveries: 3,
  completedDeliveries: 0,
  totalHens: 0,
  totalTrays: 0,
};

// Weekly Revenue Data
export const weeklyRevenueData = [
  { day: 'Sun', amount: 0 },
  { day: 'Mon', amount: 0 },
  { day: 'Tue', amount: 0 },
  { day: 'Wed', amount: 0 },
  { day: 'Thu', amount: 0 },
  { day: 'Fri', amount: 0 },
  { day: 'Sat', amount: 0 },
];

// Payment Method Breakdown
export const paymentBreakdown = {
  upiCash: 0,
  store: 0,
  credit: 0,
};

// Recent Orders
export const mockRecentOrders = [
  {
    id: 'ORD-1042',
    retailer: 'Al Madina Chicken Shop',
    retailerPhone: '9876543210',
    quantity: '120 kg',
    amount: 24600,
    paymentStatus: 'Partial',
    orderStatus: 'Out for Delivery',
    date: '24 Jul 2026',
    driver: 'Sameer Khan',
    items: [
      { name: 'Whole Chicken', quantity: 70, rate: 210, total: 14700 },
      { name: 'Chicken Breast', quantity: 50, rate: 198, total: 9900 },
    ],
  },
  {
    id: 'ORD-1041',
    retailer: 'Hyderabad Poultry',
    retailerPhone: '9876543211',
    quantity: '85 kg',
    amount: 17425,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    date: '24 Jul 2026',
    driver: 'Rahul Singh',
    items: [
      { name: 'Whole Chicken', quantity: 60, rate: 210, total: 12600 },
      { name: 'Chicken Legs', quantity: 25, rate: 193, total: 4825 },
    ],
  },
  {
    id: 'ORD-1040',
    retailer: 'City Chicken Store',
    retailerPhone: '9876543212',
    quantity: '150 kg',
    amount: 30750,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    date: '23 Jul 2026',
    driver: 'Unassigned',
    items: [
      { name: 'Whole Chicken', quantity: 100, rate: 205, total: 20500 },
      { name: 'Chicken Wings', quantity: 50, rate: 205, total: 10250 },
    ],
  },
  {
    id: 'ORD-1039',
    retailer: 'Fresh Meat Shop',
    retailerPhone: '9876543213',
    quantity: '65 kg',
    amount: 13325,
    paymentStatus: 'Partial',
    orderStatus: 'Processing',
    date: '23 Jul 2026',
    driver: 'Unassigned',
    items: [
      { name: 'Skinless Chicken', quantity: 45, rate: 235, total: 10575 },
      { name: 'Chicken Breast', quantity: 20, rate: 137.5, total: 2750 },
    ],
  },
];

// Customers
export const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Ahmed Khan',
    shop: 'Al Madina Chicken Shop',
    phone: '9876543210',
    address: '12 Market Road, Hyderabad',
    area: 'Charminar',
    city: 'Hyderabad',
    pincode: '500001',
    creditLimit: 100000,
    outstanding: 24600,
    orders: 45,
    status: 'Active',
    joined: '15 Jan 2024',
  },
  {
    id: 'CUST-002',
    name: 'Suresh Reddy',
    shop: 'Hyderabad Poultry',
    phone: '9876543211',
    address: '45 Main Street, Secunderabad',
    area: 'Secunderabad',
    city: 'Hyderabad',
    pincode: '500003',
    creditLimit: 75000,
    outstanding: 8200,
    orders: 32,
    status: 'Active',
    joined: '22 Mar 2024',
  },
  {
    id: 'CUST-003',
    name: 'Priya Patel',
    shop: 'City Chicken Store',
    phone: '9876543212',
    address: '78 IT Park, Gachibowli',
    area: 'Gachibowli',
    city: 'Hyderabad',
    pincode: '500032',
    creditLimit: 50000,
    outstanding: 5600,
    orders: 28,
    status: 'Active',
    joined: '10 Jun 2024',
  },
  {
    id: 'CUST-004',
    name: 'Ravi Kumar',
    shop: 'Fresh Meat Shop',
    phone: '9876543213',
    address: '234 Jubilee Hills',
    area: 'Jubilee Hills',
    city: 'Hyderabad',
    pincode: '500033',
    creditLimit: 30000,
    outstanding: 3100,
    orders: 18,
    status: 'Inactive',
    joined: '05 Sep 2024',
  },
  {
    id: 'CUST-005',
    name: 'Mohan Reddy',
    shop: 'Lakshmi Poultry',
    phone: '9876543214',
    address: '56 Banjara Hills',
    area: 'Banjara Hills',
    city: 'Hyderabad',
    pincode: '500034',
    creditLimit: 25000,
    outstanding: 0,
    orders: 12,
    status: 'Active',
    joined: '20 Oct 2024',
  },
];

// Drivers
export const mockDrivers = [
  {
    id: 'DRV-001',
    name: 'Sameer Khan',
    phone: '9876543220',
    vehicleNumber: 'AP 09 AB 1234',
    vehicleType: 'Mini Truck',
    licenseNumber: 'DL-2024-1234',
    status: 'Available',
    deliveriesToday: 5,
    completed: 4,
    pending: 1,
    joined: '01 Jan 2024',
  },
  {
    id: 'DRV-002',
    name: 'Rahul Singh',
    phone: '9876543221',
    vehicleNumber: 'AP 09 CD 5678',
    vehicleType: 'Van',
    licenseNumber: 'DL-2024-5678',
    status: 'On Delivery',
    deliveriesToday: 6,
    completed: 3,
    pending: 3,
    joined: '15 Feb 2024',
  },
  {
    id: 'DRV-003',
    name: 'Venkatesh Rao',
    phone: '9876543222',
    vehicleNumber: 'AP 09 EF 9012',
    vehicleType: 'Pickup',
    licenseNumber: 'DL-2024-9012',
    status: 'Inactive',
    deliveriesToday: 0,
    completed: 0,
    pending: 0,
    joined: '10 Mar 2024',
  },
  {
    id: 'DRV-004',
    name: 'Suresh Babu',
    phone: '9876543223',
    vehicleNumber: 'AP 09 GH 3456',
    vehicleType: 'Van',
    licenseNumber: 'DL-2024-3456',
    status: 'Available',
    deliveriesToday: 0,
    completed: 0,
    pending: 0,
    joined: '05 Apr 2024',
  },
];

// Products
export const mockProducts = [
  { id: 'PROD-001', name: 'Whole Chicken', sku: 'WC-001', unit: 'kg', purchasePrice: 180, sellingPrice: 210, stock: 500, minimumStock: 100, status: 'In Stock' },
  { id: 'PROD-002', name: 'Skinless Chicken', sku: 'SC-001', unit: 'kg', purchasePrice: 200, sellingPrice: 240, stock: 300, minimumStock: 80, status: 'In Stock' },
  { id: 'PROD-003', name: 'Chicken Breast', sku: 'CB-001', unit: 'kg', purchasePrice: 235, sellingPrice: 280, stock: 200, minimumStock: 50, status: 'In Stock' },
  { id: 'PROD-004', name: 'Chicken Legs', sku: 'CL-001', unit: 'kg', purchasePrice: 165, sellingPrice: 195, stock: 150, minimumStock: 100, status: 'Low Stock' },
  { id: 'PROD-005', name: 'Chicken Wings', sku: 'CW-001', unit: 'kg', purchasePrice: 145, sellingPrice: 175, stock: 80, minimumStock: 50, status: 'Low Stock' },
  { id: 'PROD-006', name: 'Boneless Chicken', sku: 'BC-001', unit: 'kg', purchasePrice: 260, sellingPrice: 310, stock: 120, minimumStock: 30, status: 'In Stock' },
  { id: 'PROD-007', name: 'Live Chicken', sku: 'LC-001', unit: 'piece', purchasePrice: 180, sellingPrice: 220, stock: 200, minimumStock: 50, status: 'In Stock' },
];

// Payments
export const mockPayments = [
  { id: 'PAY-001', retailer: 'Al Madina Chicken Shop', order: 'ORD-1042', amount: 10000, method: 'Cash', status: 'Partial', date: '24 Jul 2026', collectedBy: 'Admin' },
  { id: 'PAY-002', retailer: 'Hyderabad Poultry', order: 'ORD-1041', amount: 17425, method: 'UPI', status: 'Paid', date: '24 Jul 2026', collectedBy: 'Admin' },
  { id: 'PAY-003', retailer: 'Fresh Meat Shop', order: 'ORD-1039', amount: 5000, method: 'Bank Transfer', status: 'Partial', date: '23 Jul 2026', collectedBy: 'Admin' },
  { id: 'PAY-004', retailer: 'City Chicken Store', order: 'ORD-1040', amount: 0, method: 'Cash', status: 'Pending', date: '23 Jul 2026', collectedBy: 'Pending' },
  { id: 'PAY-005', retailer: 'Lakshmi Poultry', order: 'ORD-1038', amount: 12500, method: 'UPI', status: 'Paid', date: '22 Jul 2026', collectedBy: 'Admin' },
];

// Expenses
export const mockExpenses = [
  { id: 'EXP-001', category: 'Fuel', description: 'Diesel for delivery vehicles', amount: 5000, date: '24 Jul 2026', recordedBy: 'Admin' },
  { id: 'EXP-002', category: 'Vehicle', description: 'Truck maintenance', amount: 3500, date: '23 Jul 2026', recordedBy: 'Admin' },
  { id: 'EXP-003', category: 'Purchase', description: 'Chicken purchase from farm', amount: 120000, date: '22 Jul 2026', recordedBy: 'Admin' },
  { id: 'EXP-004', category: 'Staff', description: 'Staff salary - July week 3', amount: 15000, date: '22 Jul 2026', recordedBy: 'Admin' },
  { id: 'EXP-005', category: 'Electricity', description: 'Monthly electricity bill', amount: 2800, date: '21 Jul 2026', recordedBy: 'Admin' },
  { id: 'EXP-006', category: 'Maintenance', description: 'Freezer repair', amount: 4500, date: '20 Jul 2026', recordedBy: 'Admin' },
];

// Daily Deliveries (for the deliveries section)
export const mockDeliveries = [
  {
    id: 'DEL-001',
    orderId: 'ORD-1042',
    retailer: 'Al Madina Chicken Shop',
    address: '12 Market Road, Hyderabad',
    phone: '9876543210',
    status: 'Out for Delivery',
    driver: 'Sameer Khan',
    weight: '120 kg',
    amount: 24600,
    paymentStatus: 'Partial',
    amountToCollect: 14600,
    scheduledTime: '10:00 AM',
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-1041',
    retailer: 'Hyderabad Poultry',
    address: '45 Main Street, Secunderabad',
    phone: '9876543211',
    status: 'Delivered',
    driver: 'Rahul Singh',
    weight: '85 kg',
    amount: 17425,
    paymentStatus: 'Paid',
    amountToCollect: 0,
    scheduledTime: '09:30 AM',
  },
  {
    id: 'DEL-003',
    orderId: 'ORD-1040',
    retailer: 'City Chicken Store',
    address: '78 IT Park, Gachibowli',
    phone: '9876543212',
    status: 'Pending',
    driver: 'Unassigned',
    weight: '150 kg',
    amount: 30750,
    paymentStatus: 'Pending',
    amountToCollect: 30750,
    scheduledTime: '02:00 PM',
  },
];

// Daily Summary Data (for the dashboard)
export const mockDailySummary = {
  date: '25 Jul 2026',
  totalOrders: 0,
  totalRevenue: 0,
  totalKgOrdered: 0,
  totalKgDelivered: 0,
  activeCustomers: 5,
  cashCollection: 0,
  upiCollection: 0,
  outstanding: 550000,
  pendingDeliveries: 3,
  completedDeliveries: 0,
  totalHens: 0,
  totalTrays: 0,
  weeklyRevenue: [
    { day: 'Sun', amount: 0 },
    { day: 'Mon', amount: 0 },
    { day: 'Tue', amount: 0 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 0 },
    { day: 'Fri', amount: 0 },
    { day: 'Sat', amount: 0 },
  ],
  paymentBreakdown: {
    upiCash: 0,
    store: 0,
    credit: 0,
  },
};

// Helper function to get status color
export const getStatusColor = (status) => {
  const colors = {
    'Delivered': 'success',
    'Out for Delivery': 'info',
    'Processing': 'primary',
    'Pending': 'warning',
    'Cancelled': 'danger',
    'Paid': 'success',
    'Partial': 'warning',
    'In Stock': 'success',
    'Low Stock': 'danger',
    'Active': 'success',
    'Inactive': 'default',
    'Available': 'success',
    'On Delivery': 'info',
  };
  return colors[status] || 'default';
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};