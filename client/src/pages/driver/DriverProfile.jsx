import { useState } from 'react';
import { 
  FiUser, 
  FiPhone, 
  FiTruck,
  FiCalendar,
  FiCheckCircle
} from 'react-icons/fi';
import Badge from '../../components/common/Badge';

const DriverProfile = () => {
  const [profile] = useState({
    name: 'Sameer Khan',
    phone: '9876543220',
    vehicleNumber: 'KA-01-AB-1234',
    vehicleType: 'Mahindra Bolero',
    status: 'Available',
    joined: '01 Jan 2024',
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#151A17]">Profile</h1>
        <p className="text-sm text-[#6B716D] mt-1">View your profile information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        {/* Header with status */}
        <div className="px-6 py-4 border-b border-[#E5E8E6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-[#111714] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{profile.name[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#151A17]">{profile.name}</h2>
              <p className="text-sm text-[#6B716D]">{profile.vehicleType}</p>
            </div>
          </div>
          <Badge variant="success">{profile.status}</Badge>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-[#6B716D] uppercase tracking-wider mb-4">
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiPhone className="w-4 h-4 text-[#6B716D]" />
              <span className="text-sm text-[#151A17]">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <FiTruck className="w-4 h-4 text-[#6B716D]" />
              <span className="text-sm text-[#151A17]">{profile.vehicleNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <FiCalendar className="w-4 h-4 text-[#6B716D]" />
              <span className="text-sm text-[#151A17]">Joined: {profile.joined}</span>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 pt-6 border-t border-[#E5E8E6]">
            <p className="text-xs text-[#6B716D] text-center">
              <FiUser className="inline w-3 h-3 mr-1" />
              Contact your administrator to update your profile information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;