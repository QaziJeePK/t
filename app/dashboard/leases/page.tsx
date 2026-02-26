"use client"

import { useState } from "react"
import { Plus, Edit2, X } from "lucide-react"
import { useTenants, useLeases, addLease, updateLease } from "@/lib/hooks/use-data"

interface LeaseForm {
  tenant_id: string
  start_date: string
  end_date: string
  increment_percent: string
  reminder_days: string
}

const emptyForm: LeaseForm = {
  tenant_id: "",
  start_date: "",
  end_date: "",
  increment_percent: "10",
  reminder_days: "30",
}

export default function LeasesPage() {
  const { data: tenants = [] } = useTenants()
  const { data: leases = [] } = useLeases()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<LeaseForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const activeTenants = tenants.filter((t) => t.status === "active")

  function getLeaseStatus(lease: (typeof leases)[0]) {
    const endDate = new Date(lease.end_date)
    const today = new Date()
    const diff = endDate.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: "Expired", color: "bg-destructive/10 text-destructive", days }
    if (days <= lease.reminder_days) return { label: "Expiring Soon", color: "bg-amber-100 text-amber-700", days }
    return { label: "Running", color: "bg-accent/10 text-accent", days }
  }

  const expiredCount = leases.filter((l) => getLeaseStatus(l).days < 0).length
  const expiringCount = leases.filter((l) => { const s = getLeaseStatus(l); return s.days >= 0 && s.days <= l.reminder_days }).length
  const runningCount = leases.filter((l) => getLeaseStatus(l).days > 30).length

  function openEdit(lease: (typeof leases)[0]) {
    setEditingId(lease.id)
    setForm({
      tenant_id: lease.tenant_id,
      start_date: lease.start_date,
      end_date: lease.end_date,
      increment_percent: String(lease.increment_percent),
      reminder_days: String(lease.reminder_days),
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        tenant_id: form.tenant_id,
        start_date: form.start_date,
        end_date: form.end_date,
        increment_percent: parseInt(form.increment_percent) || 10,
        reminder_days: parseInt(form.reminder_days) || 30,
      }
      if (editingId) {
        await updateLease(editingId, data)
      } else {
        await addLease(data)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving lease")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Lease Management</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Lease
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Running</p>
          <p className="text-2xl font-bold text-accent">{runningCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Expiring Soon</p>
          <p className="text-2xl font-bold text-amber-600">{expiringCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Shop</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Start</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">End</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Increment</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Days Left</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leases.length > 0 ? leases.map((lease) => {
                const tenant = tenants.find((t) => t.id === lease.tenant_id)
                const status = getLeaseStatus(lease)
                return (
                  <tr key={lease.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium text-card-foreground">{tenant?.name || "Unknown"}</td>
                    <td className="p-3 text-card-foreground">{tenant?.premises || ""}</td>
                    <td className="p-3 text-card-foreground">{new Date(lease.start_date).toLocaleDateString()}</td>
                    <td className="p-3 text-card-foreground">{new Date(lease.end_date).toLocaleDateString()}</td>
                    <td className="p-3 text-center text-card-foreground">{lease.increment_percent}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="p-3 text-center">
                      {status.days < 0 ? (
                        <span className="text-destructive font-medium">Expired</span>
                      ) : (
                        <span className={status.days <= 30 ? "text-amber-600" : "text-accent"}>{status.days} days</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => openEdit(lease)} className="text-primary hover:text-primary/80">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No leases found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-lg p-6 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-card-foreground">{editingId ? "Edit Lease" : "Add New Lease"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-card-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Tenant *</label>
                <select className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} required>
                  <option value="">-- Select Tenant --</option>
                  {activeTenants.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Start Date *</label>
                  <input type="date" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">End Date *</label>
                  <input type="date" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Increment %</label>
                  <input type="number" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.increment_percent} onChange={(e) => setForm({ ...form, increment_percent: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Reminder Days</label>
                  <select className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.reminder_days} onChange={(e) => setForm({ ...form, reminder_days: e.target.value })}>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
