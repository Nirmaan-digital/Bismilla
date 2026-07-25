import { useState } from 'react';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import { FiFileText, FiDownload, FiPrinter } from 'react-icons/fi';

const Reports = () => {
  const [dateRange, setDateRange] = useState('today');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Reports</h1>
          <p className="text-sm text-[#6B716D]">Generate and view business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={FiDownload}>Export</Button>
          <Button variant="outline" icon={FiPrinter}>Print</Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['today', 'yesterday', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                dateRange === range
                  ? 'bg-[#111714] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
          <button className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
            Custom Range
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <p className="text-sm text-[#6B716D]">Total Sales</p>
          <p className="text-2xl font-semibold text-[#151A17]">₹4,86,450</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <p className="text-sm text-[#6B716D]">Total Orders</p>
          <p className="text-2xl font-semibold text-[#151A17]">42</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <p className="text-sm text-[#6B716D]">Avg. Order Value</p>
          <p className="text-2xl font-semibold text-[#151A17]">₹11,582</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <p className="text-sm text-[#6B716D]">Outstanding</p>
          <p className="text-2xl font-semibold text-[#151A17]">₹1,24,800</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Sales Report', description: 'View daily/weekly/monthly sales', icon: FiFileText },
          { title: 'Orders Report', description: 'Track order trends and patterns', icon: FiFileText },
          { title: 'Retailer Report', description: 'Analyze retailer performance', icon: FiFileText },
        ].map((report) => (
          <div key={report.title} className="bg-white rounded-xl border border-[#E5E8E6] p-6 hover:shadow-lg transition">
            <report.icon className="w-8 h-8 text-[#111714] mb-4" />
            <h3 className="font-semibold text-[#151A17]">{report.title}</h3>
            <p className="text-sm text-[#6B716D] mt-1">{report.description}</p>
            <Button variant="outline" size="sm" className="mt-4">Generate</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;