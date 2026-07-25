import { useState } from 'react';
import Button from '../../components/common/Button';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('business');

  const tabs = [
    { id: 'business', label: 'Business' },
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#151A17] mb-6">Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="border-b border-[#E5E8E6]">
          <div className="flex gap-1 px-6 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-[#111714] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'business' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Business Name</label>
                <input
                  type="text"
                  defaultValue="Bismillah Chicken Center"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Phone</label>
                <input
                  type="text"
                  defaultValue="+91 9876543210"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="info@bismillahchicken.com"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Address</label>
                <textarea
                  rows="3"
                  defaultValue="12 Market Road, Hyderabad"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <Button>Save Changes</Button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Admin Name</label>
                <input
                  type="text"
                  defaultValue="Mohammed Admin"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Phone</label>
                <input
                  type="text"
                  defaultValue="9999999999"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <Button>Update Account</Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#151A17] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent"
                />
              </div>
              <Button>Change Password</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#151A17]">Order Notifications</p>
                  <p className="text-sm text-[#6B716D]">Receive alerts when new orders are placed</p>
                </div>
                <button className="relative w-12 h-6 bg-[#111714] rounded-full">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#151A17]">Payment Notifications</p>
                  <p className="text-sm text-[#6B716D]">Receive alerts for payment receipts</p>
                </div>
                <button className="relative w-12 h-6 bg-[#111714] rounded-full">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#151A17]">Delivery Notifications</p>
                  <p className="text-sm text-[#6B716D]">Receive updates on delivery status</p>
                </div>
                <button className="relative w-12 h-6 bg-gray-300 rounded-full">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;