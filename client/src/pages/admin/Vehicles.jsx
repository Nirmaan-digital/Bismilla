import { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const Vehicles = () => {
  const [vehicles] = useState([
    { id: 1, number: 'AP 09 AB 1234', type: 'Mini Truck', capacity: '500 kg', driver: 'Sameer Khan', status: 'Active' },
    { id: 2, number: 'AP 09 CD 5678', type: 'Van', capacity: '300 kg', driver: 'Rahul Singh', status: 'Active' },
    { id: 3, number: 'AP 09 EF 9012', type: 'Pickup', capacity: '250 kg', driver: 'Unassigned', status: 'Maintenance' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Vehicles</h1>
          <p className="text-sm text-[#6B716D]">Manage delivery vehicles</p>
        </div>
        <Button>+ Add Vehicle</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8E6]">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{vehicle.number}</td>
                  <td className="px-6 py-4 text-sm text-[#151A17]">{vehicle.type}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{vehicle.capacity}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{vehicle.driver}</td>
                  <td className="px-6 py-4">
                    <Badge variant={vehicle.status === 'Active' ? 'success' : 'danger'}>
                      {vehicle.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;