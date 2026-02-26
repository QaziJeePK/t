"use client"

import { useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Users,
  Banknote,
  CheckCircle,
  AlertTriangle,
  Home,
  FileText,
  ClipboardList,
  CreditCard,
  MessageCircle,
} from "lucide-react"
import { useTenants, useRentRecords, usePayments, useLeases } from "@/lib/hooks/use-data"

export default function DashboardPage() {
  const { data: tenants = [] } = useTenants()
  const { data: rentRecords = [] } = useRentRecords()
  const { data: payments = [] } = usePayments()
  const { data: leases = [] } = useLeases()

  const currentMonthYear = format(new Date(), "yyyy-MM")

  const stats = useMemo(() => {
    const activeTenants = tenants.filter((t) => t.status === "active")
    const vacatedTenants = tenants.filter((t) => t.status === "vacated")
    const totalMonthlyRent = activeTenants.reduce((sum, t) => sum + (t.monthly_rent || 0), 0)
    const currentRecords = rentRecords.filter((r) => r.month_year === currentMonthYear)
    const totalPaidThisMonth = currentRecords.reduce((sum, r) => sum + (r.paid || 0), 0)
    const totalOutstanding = currentRecords.reduce((sum, r) => sum + (r.balance || 0), 0)
    const expiringLeases = leases.filter((l) => {
      if (l.status === "expired") return false
      const daysLeft = Math.ceil((new Date(l.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysLeft >= 0 && daysLeft <= 90
    })

    return {
      activeTenantsCount: activeTenants.length,
      vacatedShopsCount: vacatedTenants.length,
      totalMonthlyRent,
      totalPaidThisMonth,
      totalOutstanding,
      leaseExpiringSoon: expiringLeases.length,
    }
  }, [tenants, rentRecords, leases, currentMonthYear])

  const recentPayments = useMemo(() => {
    return payments
      .slice()
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 5)
  }, [payments])

  const defaulters = useMemo(() => {
    return rentRecords
      .filter((r) => r.month_year === currentMonthYear && r.balance > 0)
      .map((r) => {
        const tenant = tenants.find((t) => t.id === r.tenant_id)
        return {
          id: r.id,
          tenantName: tenant?.name || "Unknown",
          premises: tenant?.premises || "-",
          balance: r.balance,
        }
      })
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)
  }, [rentRecords, tenants, currentMonthYear])

  function formatCurrency(amount: number) {
    return "Rs " + amount.toLocaleString()
  }

  const statCards = [
    { label: "Active Tenants", value: stats.activeTenantsCount, color: "bg-primary", icon: Users },
    { label: "Monthly Rent", value: formatCurrency(stats.totalMonthlyRent), color: "bg-accent", icon: Banknote },
    { label: "Paid This Month", value: formatCurrency(stats.totalPaidThisMonth), color: "bg-accent", icon: CheckCircle },
    { label: "Outstanding", value: formatCurrency(stats.totalOutstanding), color: "bg-destructive", icon: AlertTriangle },
    { label: "Vacated Shops", value: stats.vacatedShopsCount, color: "bg-muted-foreground", icon: Home },
    { label: "Leases Expiring", value: stats.leaseExpiringSoon, color: "bg-amber-500", icon: FileText },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">{format(new Date(), "MMMM yyyy")} Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-card rounded-xl shadow-sm border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-5 h-5 text-muted-foreground" />
              <div className={`w-2 h-2 rounded-full ${card.color}`} />
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-xl font-bold text-card-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPayments.length > 0 ? (
              recentPayments.map((p) => {
                const tenant = tenants.find((t) => t.id === p.tenant_id)
                return (
                  <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">{tenant?.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant?.premises} - {new Date(p.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-accent">{formatCurrency(p.amount)}</span>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">No payments yet</div>
            )}
          </div>
        </div>

        {/* Top Defaulters */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Top Defaulters</h2>
            <Link href="/dashboard/reports" className="text-sm text-primary hover:underline">
              View Report
            </Link>
          </div>
          <div className="divide-y divide-border">
            {defaulters.length > 0 ? (
              defaulters.map((d) => (
                <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{d.tenantName}</p>
                    <p className="text-sm text-muted-foreground">{d.premises}</p>
                  </div>
                  <span className="font-bold text-destructive">{formatCurrency(d.balance)}</span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">No defaulters this month</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/dashboard/rent-sheet"
            className="p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors text-center"
          >
            <ClipboardList className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium text-primary">Rent Sheet</span>
          </Link>
          <Link
            href="/dashboard/payments"
            className="p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors text-center"
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-accent" />
            <span className="text-sm font-medium text-accent">Add Payment</span>
          </Link>
          <Link
            href="/dashboard/tenants"
            className="p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium text-primary">Tenants</span>
          </Link>
          <Link
            href="/dashboard/whatsapp"
            className="p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors text-center"
          >
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-accent" />
            <span className="text-sm font-medium text-accent">WhatsApp</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
