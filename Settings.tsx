import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Invoice() {
  const { tenants, rentRecords, payments, settings } = useApp();
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const printRef = useRef<HTMLDivElement>(null);

  const activeTenants = tenants.filter(t => t.status === 'active');
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  const rentRecord = rentRecords.find(
    r => r.tenantId === selectedTenantId && r.monthYear === selectedMonth
  );

  const monthPayments = payments.filter(
    p => p.tenantId === selectedTenantId && p.monthYear === selectedMonth
  );

  const totalPaid = monthPayments.reduce((sum, p) => sum + p.amount, 0);

  function handlePrint() {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html><head><title>Invoice - ${selectedTenant?.name}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
  .header h1 { margin: 0; font-size: 24px; }
  .header p { margin: 4px 0; color: #666; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .info-item { padding: 8px; background: #f5f5f5; border-radius: 4px; }
  .info-label { font-size: 12px; color: #666; }
  .info-value { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
  th { background: #333; color: white; }
  .total-row { font-weight: bold; background: #f5f5f5; }
  .balance { font-size: 20px; text-align: center; padding: 15px; margin: 20px 0; border: 2px solid #333; }
  .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>${settings.plazaName}</h1>
  <p>${settings.address}</p>
  <p>Phone: ${settings.phone}</p>
  ${settings.headerText ? `<p>${settings.headerText}</p>` : ''}
</div>
<h2 style="text-align:center;margin:20px 0;">RENT INVOICE</h2>
<div class="info-grid">
  <div class="info-item"><div class="info-label">Tenant</div><div class="info-value">${selectedTenant?.name || ''}</div></div>
  <div class="info-item"><div class="info-label">Premises</div><div class="info-value">${selectedTenant?.premises || ''}</div></div>
  <div class="info-item"><div class="info-label">Invoice Month</div><div class="info-value">${selectedMonth}</div></div>
  <div class="info-item"><div class="info-label">Invoice Date</div><div class="info-value">${format(new Date(), 'dd MMM yyyy')}</div></div>
</div>
<table>
  <tr><th>Description</th><th style="text-align:right;">Amount (Rs)</th></tr>
  <tr><td>Monthly Rent</td><td style="text-align:right;">${(rentRecord?.rent || selectedTenant?.monthlyRent || 0).toLocaleString()}</td></tr>
  <tr><td>Outstanding (Previous Months)</td><td style="text-align:right;">${(rentRecord?.outstandingPrevious || 0).toLocaleString()}</td></tr>
  <tr class="total-row"><td>Total Due</td><td style="text-align:right;">${((rentRecord?.rent || selectedTenant?.monthlyRent || 0) + (rentRecord?.outstandingPrevious || 0)).toLocaleString()}</td></tr>
  <tr><td>Paid</td><td style="text-align:right;color:green;">${totalPaid.toLocaleString()}</td></tr>
</table>
<div class="balance">
  Balance Due: <strong>Rs ${(rentRecord?.balance || ((rentRecord?.rent || selectedTenant?.monthlyRent || 0) + (rentRecord?.outstandingPrevious || 0) - totalPaid)).toLocaleString()}</strong>
</div>
${monthPayments.length > 0 ? `
<h3>Payment Details</h3>
<table>
  <tr><th>Date</th><th>Amount</th><th>Method</th><th>Transaction #</th></tr>
  ${monthPayments.map(p => `<tr><td>${new Date(p.paymentDate).toLocaleDateString()}</td><td>Rs ${p.amount.toLocaleString()}</td><td>${p.paymentMethod}</td><td>${p.transactionNo || '-'}</td></tr>`).join('')}
</table>` : ''}
<div class="footer">
  <p>${settings.footerText}</p>
  <p>Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
</div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }

  function getMonthOptions() {
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      });
    }
    return months;
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>
            <p className="text-gray-500 mt-1">Generate and print rent invoices</p>
          </div>
          {selectedTenantId && (
            <button onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Print Invoice
            </button>
          )}
        </div>

        {/* Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Tenant</label>
            <select className="w-full border rounded-lg px-3 py-2" value={selectedTenantId}
              onChange={e => setSelectedTenantId(e.target.value)}>
              <option value="">-- Select Tenant --</option>
              {activeTenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select className="w-full border rounded-lg px-3 py-2" value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}>
              {getMonthOptions().map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice Preview */}
        {selectedTenant ? (
          <div ref={printRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">{settings.plazaName}</h2>
              <p className="text-gray-500">{settings.address}</p>
              <p className="text-gray-500">Phone: {settings.phone}</p>
            </div>
            <h3 className="text-center text-lg font-bold mb-6">RENT INVOICE</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Tenant</p>
                <p className="font-bold">{selectedTenant.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Premises</p>
                <p className="font-bold">{selectedTenant.premises}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Invoice Month</p>
                <p className="font-bold">{selectedMonth}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Invoice Date</p>
                <p className="font-bold">{format(new Date(), 'dd MMM yyyy')}</p>
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Monthly Rent</td>
                  <td className="p-3 text-right">{(rentRecord?.rent || selectedTenant.monthlyRent).toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Outstanding (Previous Months)</td>
                  <td className="p-3 text-right text-orange-600">{(rentRecord?.outstandingPrevious || 0).toLocaleString()}</td>
                </tr>
                <tr className="border-b bg-gray-50 font-bold">
                  <td className="p-3">Total Due</td>
                  <td className="p-3 text-right">
                    {((rentRecord?.rent || selectedTenant.monthlyRent) + (rentRecord?.outstandingPrevious || 0)).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Paid</td>
                  <td className="p-3 text-right text-green-600">{totalPaid.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-center p-4 border-2 border-gray-800 rounded-lg mb-6">
              <p className="text-sm text-gray-500">Balance Due</p>
              <p className="text-2xl font-bold text-red-600">
                Rs {(rentRecord?.balance != null ? rentRecord.balance : ((rentRecord?.rent || selectedTenant.monthlyRent) + (rentRecord?.outstandingPrevious || 0) - totalPaid)).toLocaleString()}
              </p>
            </div>

            {monthPayments.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Payment Details</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 text-left">Method</th>
                      <th className="p-2 text-left">Transaction #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthPayments.map(p => (
                      <tr key={p.id} className="border-b">
                        <td className="p-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="p-2 text-right text-green-600">Rs {p.amount.toLocaleString()}</td>
                        <td className="p-2 capitalize">{p.paymentMethod}</td>
                        <td className="p-2">{p.transactionNo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-center mt-6 pt-4 border-t text-sm text-gray-500">
              <p>{settings.footerText}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
            <p className="text-4xl mb-4">{'🧾'}</p>
            <p>Select a tenant and month to generate an invoice</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
