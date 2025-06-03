import { Shield, Users, Settings, Database } from 'lucide-react';

export default function AdminPanel() {
  const controls = [
    {
      title: 'System Configuration',
      icon: Settings,
      items: ['Alert Thresholds', 'Notification Settings', 'API Endpoints'],
    },
    {
      title: 'User Management',
      icon: Users,
      items: ['Emergency Services', 'Local Authorities', 'System Operators'],
    },
    {
      title: 'Security Settings',
      icon: Shield,
      items: ['Access Control', 'Audit Logs', 'Authentication'],
    },
    {
      title: 'Data Management',
      icon: Database,
      items: ['Backup Settings', 'Data Retention', 'Archive Access'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">Administration Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {controls.map((control) => (
          <div key={control.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <control.icon className="h-6 w-6 text-indigo-500" />
              <h3 className="text-lg font-semibold">{control.title}</h3>
            </div>
            <ul className="space-y-2">
              {control.items.map((item) => (
                <li key={item} className="flex items-center space-x-2">
                  <button className="text-gray-600 hover:text-indigo-500 text-sm">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}