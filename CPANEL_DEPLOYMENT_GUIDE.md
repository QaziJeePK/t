import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { settings, updateSettings } = useApp();
  
  const [plazaName, setPlazaName] = useState(settings?.plazaName || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [headerText, setHeaderText] = useState(settings?.headerText || '');
  const [footerText, setFooterText] = useState(settings?.footerText || '');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    updateSettings({
      plazaName: plazaName,
      address: address,
      phone: phone,
      email: email,
      headerText: headerText,
      footerText: footerText,
      logo: settings?.logo || '',
      whatsappTemplate: settings?.whatsappTemplate || '',
    });
    
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 3000);
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h1>

        {saved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">🏢 Plaza / Property Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plaza / Property Name *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={plazaName}
                  onChange={function(e) { setPlazaName(e.target.value); }}
                  placeholder="e.g., ABC Commercial Plaza"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={phone}
                  onChange={function(e) { setPhone(e.target.value); }}
                  placeholder="e.g., 0300-1234567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={address}
                  onChange={function(e) { setAddress(e.target.value); }}
                  placeholder="e.g., Main Boulevard, Gulberg, Lahore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value); }}
                  placeholder="e.g., info@plaza.com"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">📄 Invoice / Receipt Templates</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Header Text (appears on invoices)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={headerText}
                  onChange={function(e) { setHeaderText(e.target.value); }}
                  placeholder="e.g., Trusted Property Management Since 2010"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text (appears on receipts)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={footerText}
                  onChange={function(e) { setFooterText(e.target.value); }}
                  placeholder="e.g., Thank you for your payment! For queries contact management."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">📱 Preview</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="text-xl font-bold text-blue-600">{plazaName || 'Plaza Name'}</h3>
              <p className="text-gray-600">{address || 'Address'}</p>
              <p className="text-gray-600">Phone: {phone || 'N/A'} | Email: {email || 'N/A'}</p>
              {headerText && <p className="text-gray-500 text-sm mt-2">{headerText}</p>}
              <hr className="my-4" />
              <p className="text-gray-500 text-sm">{footerText || 'Footer text will appear here'}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            💾 Save Settings
          </button>
        </form>
      </div>
    </Layout>
  );
}