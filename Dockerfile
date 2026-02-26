import { useState } from 'react';
import { format } from 'date-fns';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

type MessageType = 'rent' | 'overdue' | 'lease';

export function WhatsApp() {
  const { tenants, rentRecords, getWhatsAppMessage } = useApp();
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('rent');
  const [customMessage, setCustomMessage] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const activeTenants = tenants.filter(t => t.status === 'active');
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  const currentMonthYear = format(new Date(), 'yyyy-MM');
  const rentRecord = rentRecords.find(
    r => r.tenantId === selectedTenantId && r.monthYear === currentMonthYear
  );

  function getGeneratedMessage(): string {
    if (!selectedTenantId) return '';
    try {
      return getWhatsAppMessage(selectedTenantId, messageType);
    } catch {
      // Fallback message if getWhatsAppMessage fails
      if (!selectedTenant) return '';
      const balance = rentRecord?.balance || 0;
      switch (messageType) {
        case 'rent':
          return `Dear ${selectedTenant.name}, your rent for ${currentMonthYear} is Rs ${selectedTenant.monthlyRent.toLocaleString()}. Outstanding balance: Rs ${balance.toLocaleString()}. Kindly pay at your earliest convenience.`;
        case 'overdue':
          return `Dear ${selectedTenant.name}, your payment is overdue. Outstanding balance: Rs ${balance.toLocaleString()}. Please clear your dues immediately.`;
        case 'lease':
          return `Dear ${selectedTenant.name}, this is a reminder regarding your lease agreement for premises ${selectedTenant.premises}. Please contact management for details.`;
        default:
          return '';
      }
    }
  }

  const message = useCustom ? customMessage : getGeneratedMessage();

  function sendWhatsApp() {
    if (!selectedTenant?.phone || !message) return;
    const phone = selectedTenant.phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  }

  function sendBulkReminders() {
    const defaulters = rentRecords
      .filter(r => r.monthYear === currentMonthYear && r.balance > 0)
      .map(r => {
        const tenant = tenants.find(t => t.id === r.tenantId);
        return { record: r, tenant };
      })
      .filter(d => d.tenant && d.tenant.phone);

    if (defaulters.length === 0) {
      alert('No defaulters found for this month.');
      return;
    }

    const confirmed = confirm(
      `Send WhatsApp reminders to ${defaulters.length} defaulters?`
    );
    if (!confirmed) return;

    defaulters.forEach((d, idx) => {
      setTimeout(() => {
        if (!d.tenant?.phone) return;
        const phone = d.tenant.phone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(
          `Dear ${d.tenant.name}, your rent is overdue. Outstanding balance: Rs ${d.record.balance.toLocaleString()}. Kindly pay at your earliest convenience.`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }, idx * 1500);
    });
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">WhatsApp Messaging</h1>
            <p className="text-gray-500 mt-1">Send rent reminders via WhatsApp</p>
          </div>
          <button onClick={sendBulkReminders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Send to All Defaulters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Builder */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Compose Message</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tenant</label>
              <select className="w-full border rounded-lg px-3 py-2" value={selectedTenantId}
                onChange={e => setSelectedTenantId(e.target.value)}>
                <option value="">-- Select Tenant --</option>
                {activeTenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
              <div className="flex gap-2">
                {[
                  { value: 'rent', label: 'Rent Reminder' },
                  { value: 'overdue', label: 'Overdue Notice' },
                  { value: 'lease', label: 'Lease Reminder' },
                ].map(opt => (
                  <button key={opt.value}
                    onClick={() => { setMessageType(opt.value as MessageType); setUseCustom(false); }}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      !useCustom && messageType === opt.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="useCustom" checked={useCustom}
                onChange={e => setUseCustom(e.target.checked)} />
              <label htmlFor="useCustom" className="text-sm text-gray-700">Use custom message</label>
            </div>

            {useCustom && (
              <textarea className="w-full border rounded-lg px-3 py-2" rows={5} value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Type your custom message..." />
            )}

            <button onClick={sendWhatsApp}
              disabled={!selectedTenantId || !message}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
              Send via WhatsApp
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Message Preview</h2>

            {selectedTenant ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">To:</span>
                    <span className="font-medium">{selectedTenant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span>{selectedTenant.phone || 'No phone'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Premises:</span>
                    <span>{selectedTenant.premises}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Monthly Rent:</span>
                    <span>Rs {selectedTenant.monthlyRent.toLocaleString()}</span>
                  </div>
                  {rentRecord && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Balance:</span>
                      <span className="font-bold text-red-600">Rs {rentRecord.balance.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 whitespace-pre-wrap">
                    {message || 'Select a message type to preview'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-4xl mb-2">{'💬'}</p>
                <p>Select a tenant to preview the message</p>
              </div>
            )}
          </div>
        </div>

        {/* Defaulters Quick List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Current Month Defaulters</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Tenant</th>
                  <th className="p-3 text-left">Premises</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rentRecords
                  .filter(r => r.monthYear === currentMonthYear && r.balance > 0)
                  .map(r => {
                    const tenant = tenants.find(t => t.id === r.tenantId);
                    if (!tenant) return null;
                    return (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{tenant.name}</td>
                        <td className="p-3">{tenant.premises}</td>
                        <td className="p-3">{tenant.phone || '-'}</td>
                        <td className="p-3 text-right font-bold text-red-600">Rs {r.balance.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedTenantId(tenant.id);
                              setMessageType('overdue');
                              setUseCustom(false);
                            }}
                            className="text-green-600 hover:underline text-sm"
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
