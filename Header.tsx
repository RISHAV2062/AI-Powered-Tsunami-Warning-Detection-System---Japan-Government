import { Bell, Settings, AlertTriangle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AlertTriangle size={32} className="text-yellow-300" />
            <h1 className="text-2xl font-bold">Tsunami Warning System</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="p-2 hover:bg-indigo-700 rounded-full relative">
              <Bell size={24} />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-indigo-700 rounded-full">
              <Settings size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center">
                <span className="font-semibold">RA</span>
              </div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}