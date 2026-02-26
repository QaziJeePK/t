"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
  MessageCircle,
  LogOut,
  Menu,
  X,
  ClipboardList,
} from "lucide-react"
import { signOut } from "@/app/auth/actions"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tenants", label: "Tenants", icon: Users },
  { href: "/dashboard/leases", label: "Leases", icon: FileText },
  { href: "/dashboard/rent-sheet", label: "Rent Sheet", icon: ClipboardList },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/ledger", label: "Ledger", icon: BookOpen },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 p-5 border-b border-sidebar-foreground/10">
          <Building2 className="w-7 h-7 text-primary-foreground" />
          <div>
            <h1 className="font-bold text-primary-foreground text-sm leading-tight">Plaza Rent</h1>
            <p className="text-xs text-sidebar-foreground/60">Management System</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-active text-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-foreground/10">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 lg:hidden bg-card border-b border-border p-4 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-foreground">Plaza Rent</h1>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
