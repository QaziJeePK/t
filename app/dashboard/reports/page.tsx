"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { useTenants, useRentRecords, usePayments, useLeases } from "@/lib/hooks/use-data"

export default function ReportsPage() {
  const { data: tenants = [] } = useTenants()
  const { data: rentRecords = [] } = useRentRecords()
  const { data: payments = [] } = usePayments()
  const { data: leases = [] } = useLeases()
  const [reportType, setReportType] = useState<"collection" | "defaulters" | "lease">("collection")
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))

  const collectionReport = useMemo(() => {
    const monthRecords = rentRecords.filter((r) => r.month_year === selectedMonth)
    return monthRecords.map((r) => {
      const tenant = tenants.find((t) => t.id === r.tenant_id)
      return {
        ...r,
        tenantName: tenant?.name || "Unknown",
        premises: tenant?.premises || "-",
      }
    }).sort((a, b) => a.premises.localeCompare(b.premises))
  }, [rentRecords, tenants, selectedMonth])

  const collectionTotals = useMemo(() => {
    return collectionReport.reduce(
      (acc, r) => ({
        rent: acc.rent + (r.rent || 0),
        outstanding: acc.outstanding + (r.outstanding_previous || 0),
        paid: acc.paid + (r.paid || 0),
        balance: acc.balance + (r.balance || 0),
      }),
      { rent: 0, outstanding: 0, paid: 0, balance: 0 }
    )
  }, [collectionReport])

  const defaultersReport = useMemo(() => {
    return collectionReport
      .filter((r) => r.balance > 0)
      .sort((a, b) => b.balance - a.balance)
  }, [collectionReport])

  const leaseReport = useMemo(() => {
    return leases.map((l) => {
      const tenant = tenants.find((t) => t.id === l.tenant_id)
      const endDate = new Date(l.end_date)
      const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        ...l,
        tenantName: tenant?.name || "Unknown",
        premises: tenant?.premises || "-",
        daysLeft,
        statusLabel: daysLeft < 0 ? "Expired" : daysLeft <= 90 ? "Expiring Soon" : "Running",
      }
    }).sort((a, b) => a.daysLeft - b.daysLeft)
  }, [leases, tenants])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Reports</h1>

      {/* Report type selector */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {([
            { key: "collection", label: "Collection Report" },
            { key: "defaulters", label: "Defaulters" },
            { key: "lease", label: "Lease Status" },
          ] as const).map((r) => (
            <button
              key={r.key}
              onClick={() => setReportType(r.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                reportType === r.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {(reportType === "collection" || reportType === "defaulters") && (
          <input
            type="month"
            className="border border-input rounded-lg px-3 py-2 bg-card text-card-foreground"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        )}
      </div>

      {/* Collection Report */}
      {reportType === "collection" && (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted">
            <h2 className="font-bold text-card-foreground">Collection Report - {selectedMonth}</h2>
            <p className="text-sm text-muted-foreground">
              Collected: Rs {collectionTotals.paid.toLocaleString()} / Rs {(collectionTotals.rent + collectionTotals.outstanding).toLocaleString()} ({collectionTotals.rent + collectionTotals.outstanding > 0 ? Math.round((collectionTotals.paid / (collectionTotals.rent + collectionTotals.outstanding)) * 100) : 0}%)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Premises</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Rent</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Outstanding</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Paid</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Balance</th>
                </tr>
              </thead>
              <tbody>
                {collectionReport.map((r) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="p-3 font-medium text-card-foreground">{r.tenantName}</td>
                    <td className="p-3 text-card-foreground">{r.premises}</td>
                    <td className="p-3 text-right text-card-foreground">{(r.rent || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-amber-600">{(r.outstanding_previous || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-accent">{(r.paid || 0).toLocaleString()}</td>
                    <td className={`p-3 text-right font-bold ${r.balance > 0 ? "text-destructive" : "text-accent"}`}>{(r.balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-muted font-bold">
                  <td className="p-3" colSpan={2}>TOTAL</td>
                  <td className="p-3 text-right">{collectionTotals.rent.toLocaleString()}</td>
                  <td className="p-3 text-right text-amber-600">{collectionTotals.outstanding.toLocaleString()}</td>
                  <td className="p-3 text-right text-accent">{collectionTotals.paid.toLocaleString()}</td>
                  <td className="p-3 text-right text-destructive">{collectionTotals.balance.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Defaulters Report */}
      {reportType === "defaulters" && (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted">
            <h2 className="font-bold text-card-foreground">Defaulters - {selectedMonth}</h2>
            <p className="text-sm text-muted-foreground">{defaultersReport.length} tenants with pending balance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Premises</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Rent</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Paid</th>
                  <th className="p-3 text-right text-sm font-medium text-muted-foreground">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {defaultersReport.map((r, idx) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="p-3 text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 font-medium text-card-foreground">{r.tenantName}</td>
                    <td className="p-3 text-card-foreground">{r.premises}</td>
                    <td className="p-3 text-right text-card-foreground">{(r.rent || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-accent">{(r.paid || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-destructive">{(r.balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {defaultersReport.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No defaulters this month</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lease Report */}
      {reportType === "lease" && (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted">
            <h2 className="font-bold text-card-foreground">Lease Status Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Premises</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Start</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">End</th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">Days Left</th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaseReport.map((l) => (
                  <tr key={l.id} className="border-b border-border">
                    <td className="p-3 font-medium text-card-foreground">{l.tenantName}</td>
                    <td className="p-3 text-card-foreground">{l.premises}</td>
                    <td className="p-3 text-card-foreground">{new Date(l.start_date).toLocaleDateString()}</td>
                    <td className="p-3 text-card-foreground">{new Date(l.end_date).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      {l.daysLeft < 0 ? (
                        <span className="text-destructive font-medium">Expired</span>
                      ) : (
                        <span className={l.daysLeft <= 90 ? "text-amber-600" : "text-accent"}>{l.daysLeft}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        l.statusLabel === "Expired" ? "bg-destructive/10 text-destructive" :
                        l.statusLabel === "Expiring Soon" ? "bg-amber-100 text-amber-700" :
                        "bg-accent/10 text-accent"
                      }`}>{l.statusLabel}</span>
                    </td>
                  </tr>
                ))}
                {leaseReport.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No leases found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
