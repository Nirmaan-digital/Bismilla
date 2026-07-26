import { useState } from 'react';
import { 
  FiUsers, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX,
  FiCheck,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTruck,
  FiUser,
  FiFilter,
  FiSearch,
  FiEye,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';

// Mock staff data
const mockStaff = [
  {
    id: 'STF-001',
    name: 'Ramesh Kumar',
    phone: '9876543220',
    role: 'Driver',
    vehicle: 'KA-01-AB-1234',
    dailySalary: 500,
    status: 'Active',
    joinDate: '01 Jan 2024',
    totalTrips: 45,
    tripsThisMonth: 12,
    salaryThisMonth: 6000,
    trips: [
      { date: '25 Jul 2026', tripId: 'TRIP-001', role: 'Driver', status: 'Completed' },
      { date: '24 Jul 2026', tripId: 'TRIP-002', role: 'Driver', status: 'Completed' },
      { date: '23 Jul 2026', tripId: 'TRIP-003', role: 'Driver', status: 'Completed' },
      { date: '22 Jul 2026', tripId: 'TRIP-004', role: 'Driver', status: 'Completed' },
    ]
  },
  {
    id: 'STF-002',
    name: 'Salim Ahmed',
    phone: '9876543221',
    role: 'Driver',
    vehicle: 'KA-01-CD-5678',
    dailySalary: 500,
    status: 'Active',
    joinDate: '15 Feb 2024',
    totalTrips: 32,
    tripsThisMonth: 8,
    salaryThisMonth: 4000,
    trips: [
      { date: '25 Jul 2026', tripId: 'TRIP-001', role: 'Driver', status: 'Completed' },
      { date: '24 Jul 2026', tripId: 'TRIP-002', role: 'Driver', status: 'Completed' },
    ]
  },
  {
    id: 'STF-003',
    name: 'Suresh',
    phone: '9876543230',
    role: 'Cleaner',
    vehicle: '-',
    dailySalary: 300,
    status: 'Active',
    joinDate: '10 Mar 2024',
    totalTrips: 28,
    tripsThisMonth: 10,
    salaryThisMonth: 3000,
    trips: [
      { date: '25 Jul 2026', tripId: 'TRIP-001', role: 'Cleaner', status: 'Completed' },
      { date: '24 Jul 2026', tripId: 'TRIP-002', role: 'Cleaner', status: 'Completed' },
      { date: '23 Jul 2026', tripId: 'TRIP-003', role: 'Cleaner', status: 'Completed' },
    ]
  },
  {
    id: 'STF-004',
    name: 'Ravi',
    phone: '9876543231',
    role: 'Cleaner',
    vehicle: '-',
    dailySalary: 300,
    status: 'Active',
    joinDate: '05 Apr 2024',
    totalTrips: 20,
    tripsThisMonth: 5,
    salaryThisMonth: 1500,
    trips: [
      { date: '25 Jul 2026', tripId: 'TRIP-001', role: 'Cleaner', status: 'Completed' },
    ]
  },
  {
    id: 'STF-005',
    name: 'Ganesh Rao',
    phone: '9876543222',
    role: 'Driver',
    vehicle: 'KA-01-EF-9012',
    dailySalary: 500,
    status: 'On Leave',
    joinDate: '10 Jun 2024',
    totalTrips: 12,
    tripsThisMonth: 0,
    salaryThisMonth: 0,
    trips: []
  },
];

const Staff = () => {
  const [staff, setStaff] = useState(mockStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Driver',
    dailySalary: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Filter staff
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Statistics
  const totalStaff = staff.length;
  const totalDrivers = staff.filter(s => s.role === 'Driver').length;
  const totalCleaners = staff.filter(s => s.role === 'Cleaner').length;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const totalSalaryThisMonth = staff.reduce((sum, s) => sum + s.salaryThisMonth, 0);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (formData.phone.length < 10) errors.phone = 'Phone must be 10 digits';
    if (!formData.dailySalary || parseFloat(formData.dailySalary) <= 0) {
      errors.dailySalary = 'Valid daily salary is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add staff
  const handleAddStaff = () => {
    if (!validateForm()) return;

    const newStaff = {
      id: `STF-${String(staff.length + 1).padStart(3, '0')}`,
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      vehicle: formData.role === 'Driver' ? '-' : '-',
      dailySalary: parseFloat(formData.dailySalary),
      status: formData.status,
      joinDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      totalTrips: 0,
      tripsThisMonth: 0,
      salaryThisMonth: 0,
      trips: [],
    };

    setStaff([...staff, newStaff]);
    setIsAddModalOpen(false);
    resetForm();
    alert('Staff member added successfully!');
  };

  // Handle edit staff
  const handleEditStaff = () => {
    if (!validateForm()) return;

    const updatedStaff = staff.map(s =>
      s.id === selectedStaff.id
        ? {
            ...s,
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            dailySalary: parseFloat(formData.dailySalary),
            status: formData.status,
          }
        : s
    );

    setStaff(updatedStaff);
    setIsEditModalOpen(false);
    resetForm();
    alert('Staff member updated successfully!');
  };

  // Handle delete staff
  const handleDeleteStaff = () => {
    const updatedStaff = staff.filter(s => s.id !== selectedStaff.id);
    setStaff(updatedStaff);
    setIsDeleteModalOpen(false);
    alert('Staff member removed successfully!');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      role: 'Driver',
      dailySalary: '',
      status: 'Active',
    });
    setFormErrors({});
    setSelectedStaff(null);
  };

  // Open edit modal
  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      phone: staffMember.phone,
      role: staffMember.role,
      dailySalary: staffMember.dailySalary.toString(),
      status: staffMember.status,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  // Open view modal
  const openViewModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsViewModalOpen(true);
  };

  // Toggle staff status
  const toggleStatus = (staffId) => {
    const updatedStaff = staff.map(s =>
      s.id === staffId
        ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' }
        : s
    );
    setStaff(updatedStaff);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Staff Management</h1>
          <p className="text-sm text-[#6B716D] mt-1">Manage drivers, cleaners, and their salaries</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddModalOpen(true);
        }}>
          <FiPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <p className="text-xs text-[#6B716D]">Total Staff</p>
          <p className="text-xl font-semibold text-[#151A17]">{totalStaff}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <p className="text-xs text-[#6B716D]">Drivers</p>
          <p className="text-xl font-semibold text-[#151A17]">{totalDrivers}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <p className="text-xs text-[#6B716D]">Cleaners</p>
          <p className="text-xl font-semibold text-[#151A17]">{totalCleaners}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <p className="text-xs text-[#6B716D]">Active</p>
          <p className="text-xl font-semibold text-[#16834B]">{activeStaff}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <p className="text-xs text-[#6B716D]">Salary This Month</p>
          <p className="text-xl font-semibold text-[#151A17]">{formatCurrency(totalSalaryThisMonth)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or phone..."
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2.5 border border-[#E5E8E6] rounded-lg bg-white focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="all">All Roles</option>
              <option value="Driver">Driver</option>
              <option value="Cleaner">Cleaner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staffMember) => (
            <div key={staffMember.id} className="bg-white rounded-xl border border-[#E5E8E6] p-6 hover:shadow-md transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    staffMember.role === 'Driver' ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    {staffMember.role === 'Driver' ? (
                      <FiTruck className={`w-5 h-5 ${staffMember.role === 'Driver' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <FiUser className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#151A17]">{staffMember.name}</h3>
                    <p className="text-xs text-[#6B716D]">{staffMember.phone}</p>
                  </div>
                </div>
                <Badge variant={staffMember.status === 'Active' ? 'success' : 'default'}>
                  {staffMember.status}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B716D]">Role</span>
                  <span className="font-medium text-[#151A17]">{staffMember.role}</span>
                </div>
                {staffMember.role === 'Driver' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B716D]">Vehicle</span>
                    <span className="font-medium text-[#151A17]">{staffMember.vehicle}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B716D]">Daily Salary</span>
                  <span className="font-medium text-[#151A17]">{formatCurrency(staffMember.dailySalary)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B716D]">Trips This Month</span>
                  <span className="font-medium text-[#151A17]">{staffMember.tripsThisMonth}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B716D]">Salary This Month</span>
                  <span className="font-medium text-[#16834B]">{formatCurrency(staffMember.salaryThisMonth)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E8E6]">
                <button
                  onClick={() => openViewModal(staffMember)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="View Details"
                >
                  <FiEye className="w-4 h-4 text-[#6B716D]" />
                </button>
                <button
                  onClick={() => toggleStatus(staffMember.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    staffMember.status === 'Active'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-[#16834B] text-white hover:bg-[#13703A]'
                  }`}
                >
                  {staffMember.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditModal(staffMember)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Edit Staff"
                >
                  <FiEdit2 className="w-4 h-4 text-[#6B716D]" />
                </button>
                <button
                  onClick={() => openDeleteModal(staffMember)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                  title="Remove Staff"
                >
                  <FiTrash2 className="w-4 h-4 text-[#D14343]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No staff found"
          description="Try adjusting your search or filter criteria."
          icon={FiUsers}
          action={
            <Button onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}>
              <FiPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          }
        />
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add Staff"
        description="Add a new staff member (Driver or Cleaner)"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>
              <FiPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Full Name <span className="text-[#D14343]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition ${
                formErrors.name ? 'border-[#D14343]' : 'border-[#E5E8E6]'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-[#D14343]">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Phone Number <span className="text-[#D14343]">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-[#E5E8E6] rounded-l-lg bg-gray-50 text-[#6B716D]">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit phone number"
                className={`flex-1 px-4 py-2.5 border rounded-r-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition ${
                  formErrors.phone ? 'border-[#D14343]' : 'border-[#E5E8E6]'
                }`}
              />
            </div>
            {formErrors.phone && (
              <p className="mt-1 text-sm text-[#D14343]">{formErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Role <span className="text-[#D14343]">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Driver">Driver</option>
              <option value="Cleaner">Cleaner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Daily Salary (₹) <span className="text-[#D14343]">*</span>
            </label>
            <input
              type="number"
              name="dailySalary"
              value={formData.dailySalary}
              onChange={handleInputChange}
              placeholder="e.g., 500"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition ${
                formErrors.dailySalary ? 'border-[#D14343]' : 'border-[#E5E8E6]'
              }`}
              min="0"
              step="1"
            />
            {formErrors.dailySalary && (
              <p className="mt-1 text-sm text-[#D14343]">{formErrors.dailySalary}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Staff"
        description="Update staff member details"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStaff}>
              <FiEdit2 className="w-4 h-4 mr-2" />
              Update Staff
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Full Name <span className="text-[#D14343]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition ${
                formErrors.name ? 'border-[#D14343]' : 'border-[#E5E8E6]'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-[#D14343]">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Phone Number <span className="text-[#D14343]">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-[#E5E8E6] rounded-l-lg bg-gray-50 text-[#6B716D]">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`flex-1 px-4 py-2.5 border rounded-r-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition ${
                  formErrors.phone ? 'border-[#D14343]' : 'border-[#E5E8E6]'
                }`}
              />
            </div>
            {formErrors.phone && (
              <p className="mt-1 text-sm text-[#D14343]">{formErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Role <span className="text-[#D14343]">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Driver">Driver</option>
              <option value="Cleaner">Cleaner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Daily Salary (₹) <span className="text-[#D14343]">*</span>
            </label>
            <input
              type="number"
              name="dailySalary"
              value={formData.dailySalary}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition ${
                formErrors.dailySalary ? 'border-[#D14343]' : 'border-[#E5E8E6]'
              }`}
              min="0"
              step="1"
            />
            {formErrors.dailySalary && (
              <p className="mt-1 text-sm text-[#D14343]">{formErrors.dailySalary}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Staff Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          resetForm();
        }}
        title="Remove Staff"
        description={`Are you sure you want to remove ${selectedStaff?.name}? This action cannot be undone.`}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteStaff}>
              <FiTrash2 className="w-4 h-4 mr-2" />
              Remove Staff
            </Button>
          </>
        }
      >
        <div className="p-4 bg-[#FDEEEE] rounded-lg border border-[#D14343]/20">
          <p className="text-sm text-[#D14343]">
            <FiTrash2 className="inline w-4 h-4 mr-2" />
            This will permanently remove {selectedStaff?.name} from the staff list.
          </p>
        </div>
      </Modal>

      {/* View Staff Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStaff(null);
        }}
        title={selectedStaff?.name}
        description={`${selectedStaff?.role} • ${selectedStaff?.phone}`}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => {
            setIsViewModalOpen(false);
            setSelectedStaff(null);
          }}>
            Close
          </Button>
        }
      >
        {selectedStaff && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
                <p className="text-xs text-[#6B716D]">Daily Salary</p>
                <p className="text-lg font-semibold text-[#151A17]">{formatCurrency(selectedStaff.dailySalary)}</p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
                <p className="text-xs text-[#6B716D]">Total Trips</p>
                <p className="text-lg font-semibold text-[#151A17]">{selectedStaff.totalTrips}</p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
                <p className="text-xs text-[#6B716D]">Trips This Month</p>
                <p className="text-lg font-semibold text-[#151A17]">{selectedStaff.tripsThisMonth}</p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
                <p className="text-xs text-[#6B716D]">Salary This Month</p>
                <p className="text-lg font-semibold text-[#16834B]">{formatCurrency(selectedStaff.salaryThisMonth)}</p>
              </div>
            </div>

            {/* Trip History */}
            <div>
              <h4 className="font-medium text-[#151A17] mb-3">Trip History</h4>
              {selectedStaff.trips.length > 0 ? (
                <div className="border border-[#E5E8E6] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F6F7F6]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Trip ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8E6]">
                      {selectedStaff.trips.map((trip) => (
                        <tr key={trip.tripId} className="hover:bg-[#F6F7F6] transition">
                          <td className="px-4 py-2 text-sm text-[#6B716D]">{trip.date}</td>
                          <td className="px-4 py-2 text-sm font-medium text-[#151A17]">{trip.tripId}</td>
                          <td className="px-4 py-2 text-sm text-[#151A17]">{trip.role}</td>
                          <td className="px-4 py-2">
                            <Badge variant={trip.status === 'Completed' ? 'success' : 'warning'}>
                              {trip.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B716D]">
                  <p>No trips assigned yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Staff;