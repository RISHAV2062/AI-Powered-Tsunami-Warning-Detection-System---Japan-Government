import { AlertTriangle, Bell, CheckCircle } from 'lucide-react';

export default function AlertSystem() {
  const alerts = [
    {
      id: 1,
      level: 'high',
      location: 'Ishikawa Prefecture',
      message: 'Strong seismic activity detected. Tsunami warning issued.',
      time: '2 minutes ago',
    },
    {
      id: 2,
      level: 'medium',
      location: 'Toyama Prefecture',
      message: 'Moderate seismic activity. Monitoring situation.',
      time: '5 minutes ago',
    },
    {
      id: 3,
      level: 'low',
      location: 'Niigata Prefecture',
      message: 'Minor seismic activity detected. No immediate risk.',
      time: '10 minutes ago',
    },
  ];

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${
            alert.level === 'high'
              ? 'bg-red-50 border-red-200'
              : alert.level === 'medium'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            {alert.level === 'high' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : alert.level === 'medium' ? (
              <Bell className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <div>
              <h3 className="font-medium">{alert.location}</h3>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}