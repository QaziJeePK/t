"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Search, X } from "lucide-react"
import { useTenants, addTenant, updateTenant, deleteTenant } from "@/lib/hooks/use-data"

interface TenantForm {
  name: string
  cnic: string
  phone: string
  email: string
  premises: string
  effective_date: string
  monthly_rent: string
  security_deposit: string
  deposit_account_no: string
  utility_no: string
}

const emptyForm: TenantForm = {
  name: "",
  cnic: "",
  phone: "",
  email: "",
  premises: "",
  effective_date: "",
  monthly_rent: "",
  security_deposit: "0",
  deposit_account_no: "",
  utility_no: "",
}

export default function TenantsPage() {
  const { data: tenants = [] } = useTenants()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TenantForm>(emptyForm)
  const [filter, setFilter] = useState<"all" | "active" | "vacated">("all")
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)

  const filtered = tenants.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.premises.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openNew() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(tenant: (typeof tenants)[0]) {
    setEditingId(tenant.id)
    setForm({
      name: tenant.name,
      cnic: tenant.cnic || "",
      phone: tenant.phone || "",
      email: tenant.email || "",
      premises: tenant.premises,
      effective_date: tenant.effective_date || "",
      monthly_rent: String(tenant.monthly_rent),
      security_deposit: String(tenant.security_deposit || 0),
      deposit_account_no: tenant.deposit_account_no || "",
      utility_no: tenant.utility_no || "",
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: form.name,
        cnic: form.cnic,
        phone: form.phone,
        email: form.email,
        premises: form.premises,
        effective_date: form.effective_date,
        monthly_rent: parseInt(form.monthly_rent) || 0,
        security_deposit: parseInt(form.security_deposit) || 0,
        deposit_account_no: form.deposit_account_no,
        utility_no: form.utility_no,
      }
      if (editingId) {
        await updateTenant(editingId, data)
      } else {
        await addTenant(data)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving tenant")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this tenant?")) return
    try {
      await deleteTenant(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting tenant")
    }
  }

  async function handleVacate(id: string) {
    if (!confirm("Mark this tenant as vacated?")) return
    await updateTenant(id, { status: "vacated" })
  }

  const activeCount = tenants.filter((t) => t.status === "active").length
  const vacatedCount = tenants.filter((t) => t.status === "vacated").length

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-card-foreground">{tenants.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-accent">{activeCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Vacated</p>
          <p className="text-2xl font-bold text-destructive">{vacatedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenants..."
            className="w-full pl-9 pr-4 py-2 border border-input rounded-lg bg-card text-card-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "vacated"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Premises</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Rent</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium text-card-foreground">{t.name}</td>
                    <td className="p-3 text-card-foreground">{t.premises}</td>
                    <td className="p-3 text-card-foreground">{t.phone || "-"}</td>
                    <td className="p-3 text-right text-card-foreground">Rs {(t.monthly_rent || 0).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          t.status === "active"
                            ? "bg-accent/10 text-accent"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(t)} className="text-primary hover:text-primary/80" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {t.status === "active" && (
                          <button onClick={() => handleVacate(t.id)} className="text-amber-600 hover:text-amber-700 text-xs font-medium" title="Mark Vacated">
                            Vacate
                          </button>
                        )}
                        <button onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive/80" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-card-foreground">
                {editingId ? "Edit Tenant" : "Add New Tenant"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-muted-foreground hover:text-card-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-card-foreground mb-1">Name *</label>
                  <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Premises *</label>
                  <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.premises} onChange={(e) => setForm({ ...form, premises: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Monthly Rent *</label>
                  <input type="number" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Phone</label>
                  <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Email</label>
                  <input type="email" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">CNIC</label>
                  <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Effective Date</label>
                  <input type="date" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Security Deposit</label>
                  <input type="number" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Deposit Account #</label>
                  <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.deposit_account_no} onChange={(e) => setForm({ ...form, deposit_account_no: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Utility No</label>
                  <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.utility_no} onChange={(e) => setForm({ ...form, utility_no: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:bg-secondary/80 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
