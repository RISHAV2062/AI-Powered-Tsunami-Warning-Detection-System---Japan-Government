import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoricalData() {
  const data = [
    { date: '2024-01-01', events: 3, magnitude: 4.2 },
    { date: '2024-01-02', events: 2, magnitude: 3.8 },
    { date: '2024-01-03', events: 5, magnitude: 4.5 },
    { date: '2024-01-04', events: 4, magnitude: 4.0 },
    { date: '2024-01-05', events: 6, magnitude: 4.8 },
    { date: '2024-01-06', events: 3, magnitude: 3.9 },
    { date: '2024-01-07', events: 4, magnitude: 4.3 },
  ];

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="magnitude"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-700">Average Magnitude</h4>
          <p className="text-2xl font-bold text-purple-900 mt-1">4.2</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Total Events</h4>
          <p className="text-2xl font-bold text-blue-900 mt-1">27</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-700">Alert Accuracy</h4>
          <p className="text-2xl font-bold text-green-900 mt-1">99.8%</p>
        </div>
      </div>
    </div>
  );
}