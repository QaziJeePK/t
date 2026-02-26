import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

interface LeaseDoc {
  name: string;
  type: string;
  data: string;
}

interface LeaseForm {
  tenantId: string;
  startDate: string;
  endDate: string;
  incrementPercent: string;
  reminderDays: string;
  documents: LeaseDoc[];
}

export function Leases() {
  const { tenants, leases, addLease, updateLease } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showDocs, setShowDocs] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeaseForm>({
    tenantId: '',
    startDate: '',
    endDate: '',
    incrementPercent: '10',
    reminderDays: '30',
    documents: [],
  });

  const activeTenants = tenants.filter(function(t) { 
    return t.status === 'active'; 
  });

  const resetForm = function() {
    setFormData({
      tenantId: '',
      startDate: '',
      endDate: '',
      incrementPercent: '10',
      reminderDays: '30',
      documents: [],
    });
    setEditingId(null);
  };

  const handleFileUpload = function(e: React.ChangeEvent<HTMLInputElement>, docType: string) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function() {
        const newDoc: LeaseDoc = {
          name: file.name,
          type: docType,
          data: reader.result as string,
        };
        setFormData({
          ...formData,
          documents: [...formData.documents, newDoc]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = function(index: number) {
    const newDocs = formData.documents.slice();
    newDocs.splice(index, 1);
    setFormData({...formData, documents: newDocs});
  };

  const handleSubmit = function(e: React.FormEvent) {
    e.preventDefault();
    
    const leaseData = {
      id: editingId || 'L' + Date.now(),
      tenantId: formData.tenantId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      incrementPercent: parseInt(formData.incrementPercent),
      reminderDays: parseInt(formData.reminderDays),
      status: 'running' as const,
      documents: formData.documents,
    };

    if (editingId) {
      updateLease(leaseData);
    } else {
      addLease(leaseData);
    }

    setShowForm(false);
    resetForm();
  };

  const handleEdit = function(lease: any) {
    setEditingId(lease.id);
    setFormData({
      tenantId: lease.tenantId,
      startDate: lease.startDate,
      endDate: lease.endDate,
      incrementPercent: String(lease.incrementPercent),
      reminderDays: String(lease.reminderDays),
      documents: lease.documents || [],
    });
    setShowForm(true);
  };

  const getLeaseStatus = function(lease: any) {
    const endDate = new Date(lease.endDate);
    const today = new Date();
    const diff = endDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { label: 'Expired', color: 'bg-red-100 text-red-700', days: days };
    }
    if (days <= lease.reminderDays) {
      return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700', days: days };
    }
    return { label: 'Running', color: 'bg-green-100 text-green-700', days: days };
  };

  const expiredCount = leases.filter(function(l) { return getLeaseStatus(l).days < 0; }).length;
  const expiringCount = leases.filter(function(l) { 
    const s = getLeaseStatus(l); 
    return s.days >= 0 && s.days <= l.reminderDays; 
  }).length;
  const runningCount = leases.filter(function(l) { return getLeaseStatus(l).days > 30; }).length;

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lease Management</h1>
          <button
            onClick={function() { resetForm(); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Lease
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-medium">Running</h3>
            <p className="text-2xl font-bold text-green-600">{runningCount}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-medium">Expiring Soon</h3>
            <p className="text-2xl font-bold text-yellow-600">{expiringCount}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Expired</h3>
            <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Lease' : 'Add New Lease'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenant *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={formData.tenantId}
                      onChange={function(e) { setFormData({...formData, tenantId: e.target.value}); }}
                      required
                    >
                      <option value="">-- Select Tenant --</option>
                      {activeTenants.map(function(t) {
                        return <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>;
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.startDate}
                        onChange={function(e) { setFormData({...formData, startDate: e.target.value}); }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.endDate}
                        onChange={function(e) { setFormData({...formData, endDate: e.target.value}); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Increment %</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.incrementPercent}
                        onChange={function(e) { setFormData({...formData, incrementPercent: e.target.value}); }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.reminderDays}
                        onChange={function(e) { setFormData({...formData, reminderDays: e.target.value}); }}
                      >
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Upload Documents</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Lease Agreement (PDF)</label>
                        <input
                          type="file"
                          accept=".pdf"
                          className="w-full border rounded px-3 py-2 text-sm"
                          onChange={function(e) { handleFileUpload(e, 'Lease Agreement'); }}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">CNIC Copy</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="w-full border rounded px-3 py-2 text-sm"
                          onChange={function(e) { handleFileUpload(e, 'CNIC'); }}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Other Document</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="w-full border rounded px-3 py-2 text-sm"
                          onChange={function(e) { handleFileUpload(e, 'Other'); }}
                        />
                      </div>
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Uploaded Files:</p>
                        {formData.documents.map(function(doc, idx) {
                          return (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-1">
                              <span className="text-sm">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-2">{doc.type}</span>
                                {doc.name}
                              </span>
                              <button
                                type="button"
                                onClick={function() { removeDocument(idx); }}
                                className="text-red-500"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    {editingId ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={function() { setShowForm(false); resetForm(); }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Documents Modal */}
        {showDocs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Lease Documents</h2>
              {(function() {
                const lease = leases.find(function(l) { return l.id === showDocs; });
                const docs = (lease && lease.documents) || [];
                if (docs.length === 0) {
                  return <p className="text-gray-500 text-center py-4">No documents</p>;
                }
                return (
                  <div className="space-y-2">
                    {docs.map(function(doc: LeaseDoc, idx: number) {
                      return (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-2">{doc.type}</span>
                            {doc.name}
                          </span>
                          <a href={doc.data} download={doc.name} className="text-blue-600 hover:underline text-sm">
                            Download
                          </a>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <button
                onClick={function() { setShowDocs(null); }}
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Tenant</th>
                  <th className="p-3 text-left">Shop</th>
                  <th className="p-3 text-left">Start</th>
                  <th className="p-3 text-left">End</th>
                  <th className="p-3 text-center">Increment</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Days Left</th>
                  <th className="p-3 text-center">Docs</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leases.length > 0 ? leases.map(function(lease) {
                  const tenant = tenants.find(function(t) { return t.id === lease.tenantId; });
                  const status = getLeaseStatus(lease);
                  const docs = lease.documents || [];
                  
                  return (
                    <tr key={lease.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{tenant ? tenant.name : 'Unknown'}</td>
                      <td className="p-3">{tenant ? tenant.premises : ''}</td>
                      <td className="p-3">{new Date(lease.startDate).toLocaleDateString()}</td>
                      <td className="p-3">{new Date(lease.endDate).toLocaleDateString()}</td>
                      <td className="p-3 text-center">{lease.incrementPercent}%</td>
                      <td className="p-3 text-center">
                        <span className={'px-2 py-1 rounded text-xs ' + status.color}>{status.label}</span>
                      </td>
                      <td className="p-3 text-center">
                        {status.days < 0 ? (
                          <span className="text-red-600">Expired</span>
                        ) : (
                          <span className={status.days <= 30 ? 'text-yellow-600' : 'text-green-600'}>
                            {status.days} days
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={function() { setShowDocs(lease.id); }}
                          className="text-blue-600 hover:underline"
                        >
                          📄 {docs.length}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={function() { handleEdit(lease); }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">No leases found</td>
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