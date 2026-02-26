"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Plus, X, Printer } from "lucide-react"
import { useTenants, useRentRecords, addRentRecord, updateRentRecord } from "@/lib/hooks/use-data"

export default function RentSheetPage() {
  const { data: tenants = [] } = useTenants()
  const { data: rentRecords = [] } = useRentRecords()
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [showGenerate, setShowGenerate] = useState(false)
  const [generating, setGenerating] = useState(false)

  const activeTenants = tenants.filter((t) => t.status === "active")

  const monthRecords = useMemo(() => {
    return rentRecords
      .filter((r) => r.month_year === selectedMonth)
      .map((r) => {
        const tenant = tenants.find((t) => t.id === r.tenant_id)
        return { ...r, tenant }
      })
      .sort((a, b) => (a.tenant?.premises || "").localeCompare(b.tenant?.premises || ""))
  }, [rentRecords, tenants, selectedMonth])

  const totals = useMemo(() => {
    return monthRecords.reduce(
      (acc, r) => ({
        rent: acc.rent + (r.rent || 0),
        outstanding: acc.outstanding + (r.outstanding_previous || 0),
        paid: acc.paid + (r.paid || 0),
        balance: acc.balance + (r.balance || 0),
      }),
      { rent: 0, outstanding: 0, paid: 0, balance: 0 }
    )
  }, [monthRecords])

  async function generateMonthSheet() {
    setGenerating(true)
    try {
      // Get previous month
      const [year, month] = selectedMonth.split("-").map(Number)
      const prevDate = new Date(year, month - 2, 1)
      const prevMonthYear = format(prevDate, "yyyy-MM")

      for (const tenant of activeTenants) {
        // Check if record already exists for this month
        const exists = rentRecords.find(
          (r) => r.tenant_id === tenant.id && r.month_year === selectedMonth
        )
        if (exists) continue

        // Get previous month record to carry forward balance
        const prevRecord = rentRecords.find(
          (r) => r.tenant_id === tenant.id && r.month_year === prevMonthYear
        )
        const outstandingPrevious = prevRecord?.balance || 0

        await addRentRecord({
          tenant_id: tenant.id,
          month_year: selectedMonth,
          rent: tenant.monthly_rent || 0,
          outstanding_previous: outstandingPrevious,
          paid: 0,
          balance: (tenant.monthly_rent || 0) + outstandingPrevious,
        })
      }
      setShowGenerate(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generating rent sheet")
    } finally {
      setGenerating(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rent Sheet</h1>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => setShowGenerate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Generate Sheet
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-card-foreground mb-1">Select Month</label>
            <input
              type="month"
              className="w-full border border-input rounded-lg px-3 py-2 bg-card text-card-foreground"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Records: </span>
              <span className="font-bold text-card-foreground">{monthRecords.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Rent: </span>
              <span className="font-bold text-card-foreground">Rs {totals.rent.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Collected: </span>
              <span className="font-bold text-accent">Rs {totals.paid.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Outstanding: </span>
              <span className="font-bold text-destructive">Rs {totals.balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rent sheet table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">#</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Premises</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Rent</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Outstanding</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Paid</th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthRecords.length > 0 ? monthRecords.map((r, idx) => (
                <tr key={r.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 text-muted-foreground">{idx + 1}</td>
                  <td className="p-3 font-medium text-card-foreground">{r.tenant?.name || "Unknown"}</td>
                  <td className="p-3 text-card-foreground">{r.tenant?.premises || ""}</td>
                  <td className="p-3 text-right text-card-foreground">{(r.rent || 0).toLocaleString()}</td>
                  <td className="p-3 text-right text-amber-600">{(r.outstanding_previous || 0).toLocaleString()}</td>
                  <td className="p-3 text-right text-accent">{(r.paid || 0).toLocaleString()}</td>
                  <td className={`p-3 text-right font-bold ${r.balance > 0 ? "text-destructive" : "text-accent"}`}>
                    {(r.balance || 0).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No records for this month. Click "Generate Sheet" to create records for active tenants.</td></tr>
              )}
              {monthRecords.length > 0 && (
                <tr className="bg-muted font-bold">
                  <td className="p-3" colSpan={3}>TOTAL</td>
                  <td className="p-3 text-right text-card-foreground">{totals.rent.toLocaleString()}</td>
                  <td className="p-3 text-right text-amber-600">{totals.outstanding.toLocaleString()}</td>
                  <td className="p-3 text-right text-accent">{totals.paid.toLocaleString()}</td>
                  <td className="p-3 text-right text-destructive">{totals.balance.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-md p-6 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-card-foreground">Generate Rent Sheet</h2>
              <button onClick={() => setShowGenerate(false)} className="text-muted-foreground hover:text-card-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-muted-foreground mb-4">
              This will create rent records for all <span className="font-bold text-card-foreground">{activeTenants.length}</span> active tenants for <span className="font-bold text-card-foreground">{selectedMonth}</span>. Outstanding balances will be carried forward from the previous month.
            </p>
            <div className="flex gap-3">
              <button onClick={generateMonthSheet} disabled={generating} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
                {generating ? "Generating..." : "Generate"}
              </button>
              <button onClick={() => setShowGenerate(false)} className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:bg-secondary/80 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
