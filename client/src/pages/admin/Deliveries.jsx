import { useState } from 'react';
import { 
  FiTruck, 
  FiUser, 
  FiPhone, 
  FiMapPin,
  FiPlus,
  FiX,
  FiCheck,
  FiUsers,
  FiPackage,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';

// Mock deliveries data
const mockDeliveries = [
  {
    id: 'ORD-1008',
    customer: 'Reddy Fresh Meats',
    address: 'Plot 8, Industrial Area, Hyderabad',
    phone: '9876543212',
    kg: 500,
    amount: 94000,
    status: 'Pending',
    assigned: false,
    driver: null,
    vehicle: null,
    cleaners: [],
  },
];

// Mock in-progress deliveries
const mockInProgressDeliveries = [
  {
    id: 'ORD-1001',
    customer: 'Sharma Chicken Corner',
    address: 'Shop 12, Market Rd, Bengaluru',
    phone: '9876543210',
    kg: 220,
    amount: 42680,
    status: 'In Progress',
    assigned: true,
    driver: 'Ramesh Kumar',
    vehicle: 'KA-01-AB-1234',
    cleaners: ['Suresh', 'Ravi'],
    deliveryStatus: 'En route',
  },
  {
    id: 'ORD-1003',
    customer: 'Reddy Fresh Meats',
    address: 'Plot 8, Industrial Area, Hyderabad',
    phone: '9876543212',
    kg: 400,
    amount: 77600,
    status: 'In Progress',
    assigned: true,
    driver: 'Ramesh Kumar',
    vehicle: 'KA-01-AB-1234',
    cleaners: ['Suresh'],
    deliveryStatus: 'Assigned',
  },
];

// Mock drivers
const mockDrivers = [
  { id: 'DRV-001', name: 'Ramesh Kumar', phone: '9876543220', status: 'Available' },
  { id: 'DRV-002', name: 'Salim Ahmed', phone: '9876543221', status: 'Available' },
  { id: 'DRV-003', name: 'Ganesh Rao', phone: '9876543222', status: 'On Delivery' },
  { id: 'DRV-004', name: 'Prakash Reddy', phone: '9876543223', status: 'Available' },
];

// Mock cleaners
const mockCleaners = [
  { id: 'CLN-001', name: 'Suresh', phone: '9876543230', status: 'Available' },
  { id: 'CLN-002', name: 'Ravi', phone: '9876543231', status: 'Available' },
  { id: 'CLN-003', name: 'Kiran', phone: '9876543232', status: 'On Duty' },
  { id: 'CLN-004', name: 'Mohan', phone: '9876543233', status: 'Available' },
  { id: 'CLN-005', name: 'Srinivas', phone: '9876543234', status: 'Available' },
];

// Mock vehicles
const mockVehicles = [
  { id: 'VEH-001', number: 'KA-01-AB-1234', type: 'Mahindra Bolero', capacity: '500 kg', status: 'Available' },
  { id: 'VEH-002', number: 'KA-01-CD-5678', type: 'Tata Ace', capacity: '300 kg', status: 'Available' },
  { id: 'VEH-003', number: 'KA-01-EF-9012', type: 'Ashok Leyland Dost', capacity: '400 kg', status: 'On Delivery' },
  { id: 'VEH-004', number: 'KA-01-GH-3456', type: 'Mahindra Bolero', capacity: '500 kg', status: 'Available' },
];

const Deliveries = () => {
  const [deliveries] = useState(mockDeliveries);
  const [inProgressDeliveries] = useState(mockInProgressDeliveries);
  const [drivers] = useState(mockDrivers);
  const [cleaners] = useState(mockCleaners);
  const [vehicles] = useState(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);

  // Get unassigned deliveries
  const unassignedDeliveries = deliveries.filter(d => !d.assigned);

  const filteredUnassigned = unassignedDeliveries.filter(d =>
    d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle order selection for trip
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle assign delivery
  const handleAssignDelivery = () => {
    if (!selectedDriver || !selectedVehicle) {
      alert('Please select a driver and vehicle');
      return;
    }

    if (selectedOrders.length === 0) {
      alert('Please select at least one order');
      return;
    }

    console.log('Assigning trip:', {
      orders: selectedOrders,
      driver: selectedDriver,
      vehicle: selectedVehicle,
      cleaners: selectedCleaners,
    });

    setIsAssignModalOpen(false);
    resetAssignment();
    alert(`Trip assigned successfully with ${selectedOrders.length} order(s)!`);
  };

  // Reset assignment form
  const resetAssignment = () => {
    setSelectedOrders([]);
    setSelectedDriver('');
    setSelectedVehicle('');
    setSelectedCleaners([]);
    setIsCleanerDropdownOpen(false);
    setIsDriverDropdownOpen(false);
    setIsVehicleDropdownOpen(false);
  };

  // Open assign modal
  const openAssignModal = () => {
    setIsAssignModalOpen(true);
  };

  // Toggle cleaner selection
  const toggleCleaner = (cleanerId) => {
    setSelectedCleaners(prev =>
      prev.includes(cleanerId)
        ? prev.filter(id => id !== cleanerId)
        : [...prev, cleanerId]
    );
  };

  // Get available drivers
  const availableDrivers = drivers.filter(d => d.status === 'Available');
  
  // Get available vehicles
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  // Get driver name by ID
  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : id;
  };

  // Get vehicle number by ID
  const getVehicleNumber = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.number : id;
  };

  // Get cleaner name by ID
  const getCleanerName = (id) => {
    const cleaner = cleaners.find(c => c.id === id);
    return cleaner ? cleaner.name : id;
  };

  // Count total KG and amount for selected orders
  const getSelectedOrdersSummary = () => {
    const selected = deliveries.filter(d => selectedOrders.includes(d.id));
    const totalKg = selected.reduce((sum, d) => sum + d.kg, 0);
    const totalAmount = selected.reduce((sum, d) => sum + d.amount, 0);
    return { totalKg, totalAmount, count: selected.length };
  };

  const summary = getSelectedOrdersSummary();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Deliveries</h1>
          <p className="text-sm text-[#6B716D] mt-1">Assign drivers and vehicles to pending orders</p>
        </div>
        <Button onClick={openAssignModal}>
          <FiPlus className="w-4 h-4 mr-2" />
          Assign Delivery
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer or order ID..."
          className="max-w-md"
        />
      </div>

      {/* Unassigned Deliveries */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[#151A17]">Unassigned</h2>
          <Badge variant="warning">{filteredUnassigned.length}</Badge>
        </div>

        {filteredUnassigned.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnassigned.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-xl border border-[#E5E8E6] p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#151A17]">{delivery.customer}</h3>
                    <p className="text-sm text-[#6B716D]">{delivery.id} • {delivery.kg} kg • ₹{delivery.amount.toLocaleString()}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B716D]">
                  <FiMapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{delivery.address}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-8 text-center">
            <FiCheck className="w-12 h-12 mx-auto text-[#16834B] mb-3" />
            <p className="text-[#6B716D]">All deliveries have been assigned</p>
          </div>
        )}
      </div>

      {/* In Progress Deliveries */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-[#151A17]">In Progress</h2>
          <Badge variant="info">{inProgressDeliveries.length}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inProgressDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-xl border border-[#E5E8E6] p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#151A17]">{delivery.customer}</h3>
                  <p className="text-sm text-[#6B716D]">{delivery.id} • {delivery.kg} kg</p>
                </div>
                <Badge variant={delivery.deliveryStatus === 'En route' ? 'info' : 'primary'}>
                  {delivery.deliveryStatus || 'Assigned'}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-[#6B716D]">
                  <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{delivery.address}</span>
                </div>
                <div className="flex items-center gap-2 text-[#151A17]">
                  <FiUser className="w-4 h-4 text-[#6B716D]" />
                  <span className="font-medium">Driver:</span>
                  <span>{delivery.driver}</span>
                </div>
                <div className="flex items-center gap-2 text-[#151A17]">
                  <FiTruck className="w-4 h-4 text-[#6B716D]" />
                  <span className="font-medium">Vehicle:</span>
                  <span>{delivery.vehicle}</span>
                </div>
                <div className="flex items-center gap-2 text-[#151A17]">
                  <FiPackage className="w-4 h-4 text-[#6B716D]" />
                  <span className="font-medium">Weight:</span>
                  <span>{delivery.kg} kg</span>
                </div>
                {delivery.cleaners && delivery.cleaners.length > 0 && (
                  <div className="flex items-center gap-2 text-[#151A17]">
                    <FiUsers className="w-4 h-4 text-[#6B716D]" />
                    <span className="font-medium">Cleaners:</span>
                    <span>{delivery.cleaners.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Delivery Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          resetAssignment();
        }}
        title="Assign Order to Driver"
        description={`Select orders, driver, vehicle, and cleaners for this trip`}
        size="lg"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignModalOpen(false);
                resetAssignment();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignDelivery}>
              <FiTruck className="w-4 h-4 mr-2" />
              Assign & Notify
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Orders Selection */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-2">
              Select Orders for Trip <span className="text-[#D14343]">*</span>
            </label>
            <div className="border border-[#E5E8E6] rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {unassignedDeliveries.map((delivery) => (
                <button
                  key={delivery.id}
                  onClick={() => toggleOrderSelection(delivery.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition ${
                    selectedOrders.includes(delivery.id)
                      ? 'bg-[#111714] text-white'
                      : 'bg-[#F6F7F6] text-[#151A17] hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{delivery.id}</span>
                    <span>{delivery.customer}</span>
                    <span className="text-xs opacity-70">{delivery.kg} kg</span>
                  </div>
                  {selectedOrders.includes(delivery.id) && (
                    <FiCheck className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
            {selectedOrders.length > 0 && (
              <div className="mt-2 text-sm text-[#6B716D]">
                Selected: {summary.count} order(s) • {summary.totalKg} kg • ₹{summary.totalAmount.toLocaleString()}
              </div>
            )}
          </div>

          {/* Driver Selection */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-2">
              Driver <span className="text-[#D14343]">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#E5E8E6] rounded-lg bg-white hover:bg-gray-50 transition"
              >
                <span className={selectedDriver ? 'text-[#151A17]' : 'text-[#6B716D]'}>
                  {selectedDriver ? getDriverName(selectedDriver) : 'Select a driver...'}
                </span>
                {isDriverDropdownOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {isDriverDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E8E6] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {availableDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => {
                        setSelectedDriver(driver.id);
                        setIsDriverDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#F6F7F6] transition ${
                        selectedDriver === driver.id ? 'bg-[#F6F7F6]' : ''
                      }`}
                    >
                      <span className="text-sm">{driver.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-2">
              Vehicle <span className="text-[#D14343]">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#E5E8E6] rounded-lg bg-white hover:bg-gray-50 transition"
              >
                <span className={selectedVehicle ? 'text-[#151A17]' : 'text-[#6B716D]'}>
                  {selectedVehicle ? getVehicleNumber(selectedVehicle) : 'Select a vehicle...'}
                </span>
                {isVehicleDropdownOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {isVehicleDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E8E6] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {availableVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setIsVehicleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#F6F7F6] transition ${
                        selectedVehicle === vehicle.id ? 'bg-[#F6F7F6]' : ''
                      }`}
                    >
                      <div>
                        <span className="text-sm">{vehicle.number}</span>
                        <span className="text-xs text-[#6B716D] ml-2">({vehicle.type})</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cleaners Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-2">
              Cleaners <span className="text-xs text-[#6B716D] font-normal">(Optional - Select multiple)</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsCleanerDropdownOpen(!isCleanerDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#E5E8E6] rounded-lg bg-white hover:bg-gray-50 transition"
              >
                <span className={selectedCleaners.length > 0 ? 'text-[#151A17]' : 'text-[#6B716D]'}>
                  {selectedCleaners.length > 0 
                    ? `${selectedCleaners.length} cleaner${selectedCleaners.length > 1 ? 's' : ''} selected`
                    : 'Select cleaners...'}
                </span>
                {isCleanerDropdownOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {isCleanerDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E8E6] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {cleaners.map((cleaner) => (
                    <button
                      key={cleaner.id}
                      onClick={() => toggleCleaner(cleaner.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#F6F7F6] transition ${
                        selectedCleaners.includes(cleaner.id) ? 'bg-[#F6F7F6]' : ''
                      }`}
                    >
                      <span className="text-sm">{cleaner.name}</span>
                      {selectedCleaners.includes(cleaner.id) && (
                        <FiCheck className="w-4 h-4 text-[#16834B]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Deliveries;