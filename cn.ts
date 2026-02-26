import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Payments() {
  const { tenants, payments, addPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('cash');
  const [transactionNo, setTransactionNo] = useState('');
  const [depositAccount, setDepositAccount] = useState('');

  // Get active tenants
  var activeTenants: typeof tenants = [];
  for (var i = 0; i < tenants.length; i++) {
    if (tenants[i].status === 'active') {
      activeTenants.push(tenants[i]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    addPayment({
      tenantId: tenantId,
      amount: parseInt(amount),
      paymentDate: paymentDate,
      paymentMethod: method as 'cash' | 'bank' | 'online',
      transactionNo: transactionNo,
      depositedAccount: depositAccount,
      monthYear: paymentMonth,
    });
    
    setShowForm(false);
    setTenantId('');
    setAmount('');
    setPaymentMonth(new Date().toISOString().slice(0, 7));
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setMethod('cash');
    setTransactionNo('');
    setDepositAccount('');
    
    alert('Payment saved successfully!');
  }

  function printReceipt(paymentId: string) {
    var payment = null;
    var tenant = null;
    
    for (var i = 0; i < payments.length; i++) {
      if (payments[i].id === paymentId) {
        payment = payments[i];
        break;
      }
    }
    
    if (!payment) return;
    
    for (var j = 0; j < tenants.length; j++) {
      if (tenants[j].id === payment.tenantId) {
        tenant = tenants[j];
        break;
      }
    }

    var tenantName = tenant ? tenant.name : 'Unknown';
    var premises = tenant ? tenant.premises : '';
    var pMonth = (payment as any).monthYear || 'N/A';

    var printWindow = window.open('', '_blank');
    if (!printWindow) return;

    var html = '<!DOCTYPE html>';
    html += '<html><head><title>Receipt</title>';
    html += '<style>';
    html += 'body { font-family: Arial; padding: 40px; max-width: 400px; margin: 0 auto; }';
    html += '.box { border: 2px solid #000; padding: 20px; }';
    html += '.center { text-align: center; }';
    html += '.title { background: #000; color: #fff; padding: 10px; text-align: center; font-size: 18px; margin: 10px 0; }';
    html += '.row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }';
    html += '.big { font-size: 28px; text-align: center; margin: 20px 0; padding: 20px; background: #f0f0f0; color: green; }';
    html += '</style></head><body>';
    html += '<div class="box">';
    html += '<div class="center"><h1>PLAZA RENT</h1><p>Payment Receipt</p></div>';
    html += '<div class="title">RECEIPT</div>';
    html += '<div class="row"><span>Receipt No:</span><span><strong>' + payment.id + '</strong></span></div>';
    html += '<div class="row"><span>Payment Month:</span><span><strong>' + pMonth + '</strong></span></div>';
    html += '<div class="row"><span>Payment Date:</span><span><strong>' + payment.paymentDate + '</strong></span></div>';
    html += '<div class="row"><span>Tenant:</span><span><strong>' + tenantName + '</strong></span></div>';
    html += '<div class="row"><span>Shop:</span><span><strong>' + premises + '</strong></span></div>';
    html += '<div class="row"><span>Method:</span><span><strong>' + (payment.paymentMethod || 'cash').toUpperCase() + '</strong></span></div>';
    if (payment.transactionNo) {
      html += '<div class="row"><span>Transaction #:</span><span><strong>' + payment.transactionNo + '</strong></span></div>';
    }
    if (payment.depositedAccount) {
      html += '<div class="row"><span>Deposited To:</span><span><strong>' + payment.depositedAccount + '</strong></span></div>';
    }
    html += '<div class="big"><strong>Rs ' + payment.amount.toLocaleString() + '</strong></div>';
    html += '<div class="center" style="border-top: 2px dashed #000; padding-top: 15px;">';
    html += '<p>Thank you for your payment!</p>';
    html += '<p style="font-size: 11px; color: #666;">This is a computer generated receipt.</p>';
    html += '</div>';
    html += '</div>';
    html += '<script>window.onload = function() { window.print(); };<\/script>';
    html += '</body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
  }

  function getTenantName(id: string) {
    for (var i = 0; i < tenants.length; i++) {
      if (tenants[i].id === id) {
        return tenants[i].name;
      }
    }
    return 'Unknown';
  }

  function getTenantPremises(id: string) {
    for (var i = 0; i < tenants.length; i++) {
      if (tenants[i].id === id) {
        return tenants[i].premises;
      }
    }
    return '';
  }

  function getMethodBadge(m: string) {
    if (!m) m = 'cash';
    var bgColor = 'bg-gray-100 text-gray-700';
    if (m === 'cash') bgColor = 'bg-green-100 text-green-700';
    if (m === 'bank') bgColor = 'bg-blue-100 text-blue-700';
    if (m === 'online') bgColor = 'bg-purple-100 text-purple-700';
    return <span className={'px-2 py-1 rounded text-xs ' + bgColor}>{m.toUpperCase()}</span>;
  }

  var sortedPayments = payments.slice().sort(function(a, b) {
    return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
  });

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <button
            onClick={function() { setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Payment
          </button>
        </div>

        {/* Add Payment Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Payment</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tenant *</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={tenantId}
                    onChange={function(e) { setTenantId(e.target.value); }}
                    required
                  >
                    <option value="">-- Select Tenant --</option>
                    {activeTenants.map(function(t) {
                      return <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>;
                    })}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Payment Month *</label>
                  <input
                    type="month"
                    className="w-full border rounded px-3 py-2"
                    value={paymentMonth}
                    onChange={function(e) { setPaymentMonth(e.target.value); }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Amount (Rs) *</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={amount}
                    onChange={function(e) { setAmount(e.target.value); }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Payment Date *</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={paymentDate}
                    onChange={function(e) { setPaymentDate(e.target.value); }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={method}
                    onChange={function(e) { setMethod(e.target.value); }}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Transaction No</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={transactionNo}
                    onChange={function(e) { setTransactionNo(e.target.value); }}
                    placeholder="Optional"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Deposited Account</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={depositAccount}
                    onChange={function(e) { setDepositAccount(e.target.value); }}
                    placeholder="Account number (optional)"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Save Payment
                  </button>
                  <button
                    type="button"
                    onClick={function() { setShowForm(false); }}
                    className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Payment Month</th>
                  <th className="p-3 text-left">Payment Date</th>
                  <th className="p-3 text-left">Tenant</th>
                  <th className="p-3 text-left">Shop</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Method</th>
                  <th className="p-3 text-left">Transaction #</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.length > 0 ? (
                  sortedPayments.map(function(p) {
                    var pMonth = (p as any).monthYear || 'N/A';
                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{pMonth}</td>
                        <td className="p-3">{p.paymentDate}</td>
                        <td className="p-3">{getTenantName(p.tenantId)}</td>
                        <td className="p-3">{getTenantPremises(p.tenantId)}</td>
                        <td className="p-3 text-right text-green-600 font-bold">Rs {p.amount.toLocaleString()}</td>
                        <td className="p-3">{getMethodBadge(p.paymentMethod || 'cash')}</td>
                        <td className="p-3">{p.transactionNo || '-'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={function() { printReceipt(p.id); }}
                            className="text-blue-600 hover:underline"
                          >
                            🖨️ Print
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No payments recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
