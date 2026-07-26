import { useState } from 'react';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiUser
} from 'react-icons/fi';
import Badge from '../../components/common/Badge';

const RetailerProfile = () => {
  const [profile] = useState({
    ownerName: 'Rahul',
    shopName: 'Sharma Chicken Corner',
    phone: '9876543210',
    email: 'rahul@sharmachicken.com',
    address: '12 Market Road, Hyderabad',
    area: 'Charminar',
    city: 'Hyderabad',
    pincode: '500001',
    outstanding: 130000,
    status: 'Active',
    joined: '15 Jan 2024',
  });

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
              <span className="text-2xl font-bold text-white">{profile.ownerName[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#151A17]">{profile.ownerName}</h2>
              <p className="text-sm text-[#6B716D]">{profile.shopName}</p>
            </div>
          </div>
          <Badge variant="success">{profile.status}</Badge>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[#6B716D] uppercase tracking-wider mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiPhone className="w-4 h-4 text-[#6B716D]" />
                  <span className="text-sm text-[#151A17]">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="w-4 h-4 text-[#6B716D]" />
                  <span className="text-sm text-[#151A17]">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="w-4 h-4 text-[#6B716D]" />
                  <span className="text-sm text-[#151A17]">{profile.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-4 h-4 text-[#6B716D]" />
                  <span className="text-sm text-[#151A17]">Joined: {profile.joined}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#6B716D] uppercase tracking-wider mb-4">
                Account Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#FDEEEE] rounded-lg border border-[#D14343]/20">
                  <span className="text-sm font-medium text-[#D14343]">Outstanding</span>
                  <span className="text-sm font-bold text-[#D14343]">
                    {formatCurrency(profile.outstanding)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B716D]">Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
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

export default RetailerProfile;