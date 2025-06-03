import { Activity, Users, MapPin, AlertOctagon } from 'lucide-react';
import SeismicMap from './SeismicMap';
import AlertSystem from './AlertSystem';
import HistoricalData from './HistoricalData';

export default function Dashboard() {
  const stats = [
    { label: 'Active Alerts', value: '3', icon: AlertOctagon, color: 'text-red-500' },
    { label: 'Monitored Regions', value: '12', icon: MapPin, color: 'text-blue-500' },
    { label: 'Population Coverage', value: '2.8M', icon: Users, color: 'text-green-500' },
    { label: 'System Status', value: 'Optimal', icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Live Seismic Activity</h2>
          <SeismicMap />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
          <AlertSystem />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Historical Data Analysis</h2>
        <HistoricalData />
      </div>
    </div>
  );
}