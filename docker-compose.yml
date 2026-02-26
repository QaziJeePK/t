import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';
import type { TenantStatus } from '../types';

export function Tenants() {
  const { tenants, addTenant, updateTenant, deleteTenant } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    phone: '',
    email: '',
    premises: '',
    effectiveDate: '',
    monthlyRent: '',
    securityDeposit: '',
    depositAccountNo: '',
    utilityNo: '',
    status: 'active' as TenantStatus,
  });

  function resetForm() {
    setFormData({
      name: '',
      cnic: '',
      phone: '',
      email: '',
      premises: '',
      effectiveDate: '',
      monthlyRent: '',
      securityDeposit: '',
      depositAccountNo: '',
      utilityNo: '',
      status: 'active',
    });
    setEditingId(null);
  }

  function handleEdit(tenantId: string) {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    setFormData({
      name: tenant.name,
      cnic: tenant.cnic,
      phone: tenant.phone,
      email: tenant.email,
      premises: tenant.premises,
      effectiveDate: tenant.effectiveDate,
      monthlyRent: String(tenant.monthlyRent),
      securityDeposit: String(tenant.securityDeposit),
      depositAccountNo: tenant.depositAccountNo,
      utilityNo: tenant.utilityNo,
      status: tenant.status,
    });
    setEditingId(tenantId);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: formData.name,
      cnic: formData.cnic,
      phone: formData.phone,
      email: formData.email,
      premises: formData.premises,
      effectiveDate: formData.effectiveDate,
      monthlyRent: parseInt(formData.monthlyRent) || 0,
      securityDeposit: parseInt(formData.securityDeposit) || 0,
      depositAccountNo: formData.depositAccountNo,
      utilityNo: formData.utilityNo,
      status: formData.status,
    };

    if (editingId) {
      updateTenant(editingId, data);
    } else {
      addTenant(data);
    }

    setShowForm(false);
    resetForm();
  }

  function handleDelete(id: string) {
    deleteTenant(id);
    setConfirmDelete(null);
  }

  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.premises.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTenants = tenants.filter(t => t.status === 'active');
  const totalRent = activeTenants.reduce((sum, t) => sum + t.monthlyRent, 0);

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tenants</h1>
            <p className="text-gray-500 mt-1">
              {activeTenants.length} active tenants | Total rent: Rs {totalRent.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Tenant
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or premises..."
            className="flex-1 border rounded-lg px-3 py-2"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="vacated">Vacated</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Tenant' : 'Add New Tenant'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Premises *</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.premises}
                      onChange={e => setFormData({ ...formData, premises: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.cnic}
                      onChange={e => setFormData({ ...formData, cnic: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border rounded-lg px-3 py-2" value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2" value={formData.monthlyRent}
                      onChange={e => setFormData({ ...formData, monthlyRent: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2" value={formData.securityDeposit}
                      onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2" value={formData.effectiveDate}
                      onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Account No</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.depositAccountNo}
                      onChange={e => setFormData({ ...formData, depositAccountNo: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Utility No (IESCO)</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.utilityNo}
                      onChange={e => setFormData({ ...formData, utilityNo: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full border rounded-lg px-3 py-2" value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as TenantStatus })}>
                      <option value="active">Active</option>
                      <option value="vacated">Vacated</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    {editingId ? 'Update' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to delete this tenant? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">Delete</button>
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Tenants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Premises</th>
                  <th className="p-3 text-left">Tenant Name</th>
                  <th className="p-3 text-right">Monthly Rent</th>
                  <th className="p-3 text-right">Deposit</th>
                  <th className="p-3 text-left">Utility No</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map(t => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{t.premises}</td>
                      <td className="p-3">{t.name}</td>
                      <td className="p-3 text-right font-medium">Rs {t.monthlyRent.toLocaleString()}</td>
                      <td className="p-3 text-right">Rs {t.securityDeposit.toLocaleString()}</td>
                      <td className="p-3">{t.utilityNo || '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          t.status === 'active' ? 'bg-green-100 text-green-700' :
                          t.status === 'vacated' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleEdit(t.id)}
                          className="text-blue-600 hover:underline text-sm mr-3">Edit</button>
                        <button onClick={() => setConfirmDelete(t.id)}
                          className="text-red-600 hover:underline text-sm">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No tenants found</td>
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
