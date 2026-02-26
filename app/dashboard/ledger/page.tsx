"use client"

import { useState } from "react"
import { Printer, Download } from "lucide-react"
import { useTenants, useRentRecords, usePayments } from "@/lib/hooks/use-data"

export default function LedgerPage() {
  const { data: tenants = [] } = useTenants()
  const { data: rentRecords = [] } = useRentRecords()
  const { data: payments = [] } = usePayments()
  const [selectedTenant, setSelectedTenant] = useState("")

  const activeTenants = tenants.filter((t) => t.status === "active")
  const tenant = tenants.find((t) => t.id === selectedTenant)

  const tenantRecords = rentRecords
    .filter((r) => r.tenant_id === selectedTenant)
    .sort((a, b) => a.month_year.localeCompare(b.month_year))

  const tenantPayments = payments
    .filter((p) => p.tenant_id === selectedTenant)
    .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())

  function handlePrint() {
    window.print()
  }

  function handleExport() {
    if (!tenant) return
    let csv = "Month,Rent,Outstanding,Paid,Balance\n"
    tenantRecords.forEach((r) => {
      csv += `${r.month_year},${r.rent},${r.outstanding_previous},${r.paid},${r.balance}\n`
    })
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ledger-${tenant.name}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Tenant Ledger</h1>

      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-card-foreground mb-1">Select Tenant</label>
            <select
              className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
            >
              <option value="">-- Select Tenant --</option>
              {activeTenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name} - {t.premises}</option>
              ))}
            </select>
          </div>
          {selectedTenant && (
            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {tenant ? (
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-4 border-b border-border bg-muted rounded-t-lg">
            <h2 className="text-xl font-bold text-card-foreground">{tenant.name}</h2>
            <p className="text-muted-foreground">Shop: {tenant.premises} | Phone: {tenant.phone || "-"}</p>
            <p className="text-muted-foreground">Monthly Rent: Rs {(tenant.monthly_rent || 0).toLocaleString()}</p>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-card-foreground mb-3">Month-wise Statement</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Month</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">Rent</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">Outstanding</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">Paid</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantRecords.length > 0 ? tenantRecords.map((r) => (
                    <tr key={r.id} className="border-b border-border">
                      <td className="p-3 font-medium text-card-foreground">{r.month_year}</td>
                      <td className="p-3 text-right text-card-foreground">{(r.rent || 0).toLocaleString()}</td>
                      <td className="p-3 text-right text-amber-600">{(r.outstanding_previous || 0).toLocaleString()}</td>
                      <td className="p-3 text-right text-accent">{(r.paid || 0).toLocaleString()}</td>
                      <td className={`p-3 text-right font-bold ${r.balance > 0 ? "text-destructive" : "text-accent"}`}>
                        {(r.balance || 0).toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <h3 className="font-bold text-card-foreground mb-3">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Method</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">Transaction #</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantPayments.length > 0 ? tenantPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border">
                      <td className="p-3 text-card-foreground">{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td className="p-3 text-right font-bold text-accent">Rs {p.amount.toLocaleString()}</td>
                      <td className="p-3 text-card-foreground capitalize">{p.payment_method}</td>
                      <td className="p-3 text-card-foreground">{p.transaction_no || "-"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No payments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>Select a tenant to view their ledger</p>
        </div>
      )}
    </div>
  )
}

function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
