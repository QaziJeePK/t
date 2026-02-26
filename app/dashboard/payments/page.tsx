"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, X, Trash2 } from "lucide-react"
import { useTenants, usePayments, useRentRecords, addPayment, updateRentRecord, deletePayment } from "@/lib/hooks/use-data"

interface PaymentForm {
  tenant_id: string
  month_year: string
  amount: string
  payment_date: string
  payment_method: string
  transaction_no: string
  notes: string
}

const emptyForm: PaymentForm = {
  tenant_id: "",
  month_year: format(new Date(), "yyyy-MM"),
  amount: "",
  payment_date: format(new Date(), "yyyy-MM-dd"),
  payment_method: "cash",
  transaction_no: "",
  notes: "",
}

export default function PaymentsPage() {
  const { data: tenants = [] } = useTenants()
  const { data: payments = [] } = usePayments()
  const { data: rentRecords = [] } = useRentRecords()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PaymentForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const activeTenants = tenants.filter((t) => t.status === "active")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const amount = parseInt(form.amount) || 0
      await addPayment({
        tenant_id: form.tenant_id,
        month_year: form.month_year,
        amount,
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        transaction_no: form.transaction_no,
        notes: form.notes,
      })

      // Update rent record
      const existingRecord = rentRecords.find(
        (r) => r.tenant_id === form.tenant_id && r.month_year === form.month_year
      )
      if (existingRecord) {
        const newPaid = (existingRecord.paid || 0) + amount
        const newBalance = (existingRecord.rent || 0) + (existingRecord.outstanding_previous || 0) - newPaid
        await updateRentRecord(existingRecord.id, { paid: newPaid, balance: newBalance })
      }

      setShowForm(false)
      setForm(emptyForm)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving payment")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this payment?")) return
    try {
      await deletePayment(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting payment")
    }
  }

  const sortedPayments = payments.slice().sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  )

  const totalThisMonth = payments
    .filter((p) => p.month_year === format(new Date(), "yyyy-MM"))
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            This month: <span className="font-bold text-accent">Rs {totalThisMonth.toLocaleString()}</span>
          </p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowForm(true) }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Payment list */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Month</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Method</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Transaction #</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.length > 0 ? sortedPayments.map((p) => {
                const tenant = tenants.find((t) => t.id === p.tenant_id)
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium text-card-foreground">{tenant?.name || "Unknown"}</td>
                    <td className="p-3 text-card-foreground">{p.month_year}</td>
                    <td className="p-3 text-right font-bold text-accent">Rs {p.amount.toLocaleString()}</td>
                    <td className="p-3 text-card-foreground">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="p-3 text-card-foreground capitalize">{p.payment_method}</td>
                    <td className="p-3 text-card-foreground">{p.transaction_no || "-"}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No payments found</td></tr>
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
              <h2 className="text-xl font-bold text-card-foreground">Record Payment</h2>
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
                  <label className="block text-sm font-medium text-card-foreground mb-1">Month *</label>
                  <input type="month" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.month_year} onChange={(e) => setForm({ ...form, month_year: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Amount (Rs) *</label>
                  <input type="number" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Payment Date *</label>
                  <input type="date" className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Method</label>
                  <select className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Transaction #</label>
                <input className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" value={form.transaction_no} onChange={(e) => setForm({ ...form, transaction_no: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Notes</label>
                <textarea className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save Payment"}
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
