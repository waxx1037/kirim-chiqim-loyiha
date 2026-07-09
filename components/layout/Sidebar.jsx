"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, TrendingDown, Tag, Tags,
  BarChart3, Archive, Settings, Menu, X, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Kirimlar", href: "/kirim", icon: TrendingUp },
  { label: "Chiqimlar", href: "/chiqim", icon: TrendingDown },
  { label: "Kirim kategoriyalar", href: "/kirim-kategoriyalar", icon: Tag },
  { label: "Chiqim kategoriyalar", href: "/chiqim-kategoriyalar", icon: Tags },
  { label: "Hisobotlar", href: "/hisobotlar", icon: BarChart3 },
  { label: "Arxiv", href: "/arxiv", icon: Archive },
  { label: "Sozlamalar", href: "/sozlamalar", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-primary p-2 text-white shadow-lg lg:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col bg-gradient-sidebar text-[hsl(var(--sidebar-foreground))] shadow-2xl transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <DollarSign size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">FinanceApp</p>
                <p className="text-[10px] text-white/50">Moliya tizimi</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <DollarSign size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1 hover:bg-white/10 lg:flex"
          >
            <Menu size={18} className="text-white/70" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-white/10 p-4">
            <p className="text-[10px] text-white/30 text-center">
              © 2024 FinanceApp v1.0
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
