import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Ledger() {
  const { tenants, rentRecords, payments } = useApp();
  const [selectedTenant, setSelectedTenant] = useState('');

  const activeTenants = tenants.filter(function(t) { return t.status === 'active'; });
  const tenant = tenants.find(function(t) { return t.id === selectedTenant; });

  const tenantRentRecords = rentRecords
    .filter(function(r) { return r.tenantId === selectedTenant; })
    .sort(function(a, b) { return a.monthYear.localeCompare(b.monthYear); });

  const tenantPayments = payments
    .filter(function(p) { return p.tenantId === selectedTenant; })
    .sort(function(a, b) { return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(); });

  const handlePrint = function() {
    window.print();
  };

  const handleExportExcel = function() {
    if (!tenant) return;
    let csv = 'Month,Rent,Outstanding,Paid,Balance\n';
    tenantRentRecords.forEach(function(r) {
      csv += r.monthYear + ',' + r.rent + ',' + r.outstandingPrevious + ',' + r.paid + ',' + r.balance + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ledger-' + tenant.name + '.csv';
    a.click();
  };

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tenant Ledger</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tenant</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedTenant}
                onChange={function(e) { setSelectedTenant(e.target.value); }}
              >
                <option value="">-- Select Tenant --</option>
                {activeTenants.map(function(t) {
                  return <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>;
                })}
              </select>
            </div>
            {selectedTenant && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Print
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {tenant ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold">{tenant.name}</h2>
              <p className="text-gray-600">Shop: {tenant.premises} | Phone: {tenant.phone}</p>
              <p className="text-gray-600">Monthly Rent: Rs {tenant.monthlyRent.toLocaleString()}</p>
            </div>

            <div className="p-4">
              <h3 className="font-bold mb-3">Month-wise Statement</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Month</th>
                      <th className="p-3 text-right">Rent</th>
                      <th className="p-3 text-right">Outstanding</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantRentRecords.length > 0 ? tenantRentRecords.map(function(r) {
                      return (
                        <tr key={r.id} className="border-b">
                          <td className="p-3 font-medium">{r.monthYear}</td>
                          <td className="p-3 text-right">{r.rent.toLocaleString()}</td>
                          <td className="p-3 text-right text-orange-600">{r.outstandingPrevious.toLocaleString()}</td>
                          <td className="p-3 text-right text-green-600">{r.paid.toLocaleString()}</td>
                          <td className={r.balance > 0 ? 'p-3 text-right font-bold text-red-600' : 'p-3 text-right font-bold text-green-600'}>
                            {r.balance.toLocaleString()}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t">
              <h3 className="font-bold mb-3">Payment History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-left">Method</th>
                      <th className="p-3 text-left">Transaction #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantPayments.length > 0 ? tenantPayments.map(function(p) {
                      return (
                        <tr key={p.id} className="border-b">
                          <td className="p-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="p-3 text-right text-green-600 font-bold">Rs {p.amount.toLocaleString()}</td>
                          <td className="p-3">{p.paymentMethod}</td>
                          <td className="p-3">{p.transactionNo || '-'}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">No payments found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <p className="text-4xl mb-4">📒</p>
            <p>Select a tenant to view their ledger</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
