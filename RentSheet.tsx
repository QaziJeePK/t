import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function Dashboard() {
  const { tenants, rentRecords, payments, leases } = useApp();
  const navigate = useNavigate();

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const stats = useMemo(() => {
    const activeTenants = tenants.filter(t => t.status === 'active');
    const vacatedTenants = tenants.filter(t => t.status === 'vacated');

    const totalMonthlyRent = activeTenants.reduce((sum, t) => sum + t.monthlyRent, 0);

    const currentRecords = rentRecords.filter(r => r.monthYear === currentMonthYear);
    const totalPaidThisMonth = currentRecords.reduce((sum, r) => sum + r.paid, 0);
    const totalOutstanding = currentRecords.reduce((sum, r) => sum + r.balance, 0);

    const expiringLeases = leases.filter(l => {
      if (l.status === 'expired') return false;
      const daysLeft = Math.ceil(
        (new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft >= 0 && daysLeft <= 90;
    });

    return {
      activeTenantsCount: activeTenants.length,
      vacatedShopsCount: vacatedTenants.length,
      totalMonthlyRent,
      totalPaidThisMonth,
      totalOutstanding,
      leaseExpiringSoon: expiringLeases.length,
    };
  }, [tenants, rentRecords, leases, currentMonthYear]);

  const recentPayments = useMemo(() => {
    return payments
      .slice()
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);
  }, [payments]);

  const defaulters = useMemo(() => {
    return rentRecords
      .filter(r => r.monthYear === currentMonthYear && r.balance > 0)
      .map(r => {
        const tenant = tenants.find(t => t.id === r.tenantId);
        return {
          id: r.id,
          tenantName: tenant?.name || 'Unknown',
          premises: tenant?.premises || '-',
          balance: r.balance,
        };
      })
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
  }, [rentRecords, tenants, currentMonthYear]);

  function formatCurrency(amount: number) {
    return 'Rs ' + amount.toLocaleString();
  }

  const statCards = [
    { label: 'Active Tenants', value: stats.activeTenantsCount, color: 'bg-blue-500', icon: '👥' },
    { label: 'Monthly Rent', value: formatCurrency(stats.totalMonthlyRent), color: 'bg-green-500', icon: '💰' },
    { label: 'Paid This Month', value: formatCurrency(stats.totalPaidThisMonth), color: 'bg-emerald-500', icon: '✅' },
    { label: 'Outstanding', value: formatCurrency(stats.totalOutstanding), color: 'bg-red-500', icon: '⚠️' },
    { label: 'Vacated Shops', value: stats.vacatedShopsCount, color: 'bg-gray-500', icon: '🏠' },
    { label: 'Leases Expiring', value: stats.leaseExpiringSoon, color: 'bg-amber-500', icon: '📄' },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">{format(new Date(), 'MMMM yyyy')} Overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <div className={`w-2 h-2 rounded-full ${card.color}`} />
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {typeof card.value === 'number' ? card.value : card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
              <button
                onClick={() => navigate('/payments')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentPayments.length > 0 ? (
                recentPayments.map(p => {
                  const tenant = tenants.find(t => t.id === p.tenantId);
                  return (
                    <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{tenant?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          {tenant?.premises} - {new Date(p.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-green-600">{formatCurrency(p.amount)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">No payments yet</div>
              )}
            </div>
          </div>

          {/* Top Defaulters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Top Defaulters</h2>
              <button
                onClick={() => navigate('/reports')}
                className="text-sm text-blue-600 hover:underline"
              >
                View Report
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {defaulters.length > 0 ? (
                defaulters.map(d => (
                  <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{d.tenantName}</p>
                      <p className="text-sm text-gray-500">{d.premises}</p>
                    </div>
                    <span className="font-bold text-red-600">{formatCurrency(d.balance)}</span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">No defaulters this month</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/rent-sheet')}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <span className="text-2xl block mb-1">📋</span>
              <span className="text-sm font-medium text-blue-700">Rent Sheet</span>
            </button>
            <button
              onClick={() => navigate('/payments')}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <span className="text-2xl block mb-1">💰</span>
              <span className="text-sm font-medium text-green-700">Add Payment</span>
            </button>
            <button
              onClick={() => navigate('/tenants')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <span className="text-2xl block mb-1">👥</span>
              <span className="text-sm font-medium text-purple-700">Tenants</span>
            </button>
            <button
              onClick={() => navigate('/whatsapp')}
              className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-center"
            >
              <span className="text-2xl block mb-1">💬</span>
              <span className="text-sm font-medium text-emerald-700">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
