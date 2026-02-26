import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/tenants', label: 'Tenants', icon: '👥' },
  { path: '/leases', label: 'Leases', icon: '📄' },
  { path: '/rent-sheet', label: 'Rent Sheet', icon: '📋' },
  { path: '/payments', label: 'Payments', icon: '💰' },
  { path: '/ledger', label: 'Ledger', icon: '📒' },
  { path: '/invoice', label: 'Invoice', icon: '🧾' },
  { path: '/import', label: 'Import Data', icon: '📥' },
  { path: '/whatsapp', label: 'WhatsApp', icon: '💬' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-600 text-white p-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl">
          ☰
        </button>
        <h1 className="font-bold">{settings.plazaName}</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-blue-800 text-white min-h-screen
            transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo */}
          <div className="p-4 border-b border-blue-700">
            <h1 className="text-xl font-bold">{settings.plazaName}</h1>
            <p className="text-blue-300 text-sm">Rent Management</p>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-blue-700 bg-blue-900">
            <p className="font-medium">{user?.name}</p>
            <p className="text-blue-300 text-sm capitalize">{user?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                  transition-colors duration-200
                  ${location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-blue-700 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}