import { AlertProvider } from './context/AlertContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <Dashboard />
          <AdminPanel />
        </main>
      </div>
    </AlertProvider>
  );
}