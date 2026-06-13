"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart, Users, Brain, FileText, Calendar, TrendingUp,
  Activity, Shield, Settings, LogOut, Menu, X, Bell,
  CheckCircle, AlertTriangle, BarChart3, UserPlus,
  Stethoscope, Eye, Clock, Search, Filter, Download,
  ChevronDown, RefreshCw, MoreVertical
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { adminAPI, analyticsAPI, doctorsAPI } from "@/lib/api";
import type { User, DashboardAnalytics } from "@/types";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "doctors" | "analyses" | "settings">("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, uRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          adminAPI.getUsers({ limit: "20" }),
        ]);
        setAnalytics(aRes.data);
        setUsers(uRes.data?.users || uRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navItems = [
    { icon: BarChart3, label: "Overview", id: "overview" as const },
    { icon: Users, label: "Users", id: "users" as const },
    { icon: Stethoscope, label: "Doctors", id: "doctors" as const },
    { icon: Brain, label: "Analyses", id: "analyses" as const },
    { icon: Settings, label: "Settings", id: "settings" as const },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold">MediVision AI</span>
              <p className="text-[10px] text-slate-400 -mt-0.5">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
          <button
            onClick={() => { logout(); window.location.href = "/"; }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 w-full transition-all"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.full_name}</div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : activeTab === "overview" ? (
            <>
              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: analytics?.users.total || 0, icon: Users, color: "blue", change: "+12%" },
                  { label: "Total Analyses", value: analytics?.analyses.total || 0, icon: Brain, color: "purple", change: "+28%" },
                  { label: "Reports Generated", value: analytics?.reports.total || 0, icon: FileText, color: "emerald", change: "+15%" },
                  { label: "Uptime", value: "99.9%", icon: Activity, color: "green", change: "Stable" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stat.color === "blue" ? "bg-blue-100" : stat.color === "purple" ? "bg-purple-100" : stat.color === "emerald" ? "bg-emerald-100" : "bg-green-100"
                      }`}>
                        <stat.icon className={`w-5 h-5 ${
                          stat.color === "blue" ? "text-blue-600" : stat.color === "purple" ? "text-purple-600" : stat.color === "emerald" ? "text-emerald-600" : "text-green-600"
                        }`} />
                      </div>
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Analyses */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Monthly Analyses</h3>
                  <div className="space-y-3">
                    {(analytics?.monthly_analyses || Array.from({ length: 6 }, (_, i) => ({
                      date: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
                      count: [120, 180, 250, 310, 420, 580][i]
                    }))).map((m: { date: string; count: number }, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-10">{m.date}</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(m.count / 600) * 100}%` }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-10 text-right">{m.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Risk Distribution</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { level: "Low", count: analytics?.risk_distribution?.low || 45, color: "bg-green-500" },
                      { level: "Moderate", count: analytics?.risk_distribution?.moderate || 30, color: "bg-yellow-500" },
                      { level: "High", count: analytics?.risk_distribution?.high || 18, color: "bg-orange-500" },
                      { level: "Critical", count: analytics?.risk_distribution?.critical || 7, color: "bg-red-500" },
                    ].map((risk) => (
                      <div key={risk.level} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                          <span className="text-sm font-medium text-slate-700">{risk.level}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{risk.count}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Recent Users</h3>
                  <button onClick={() => setActiveTab("users")} className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {(users || []).slice(0, 5).map((u, i) => (
                    <div key={u.id || i} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {(u.full_name || "U").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{u.full_name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === "doctor" ? "bg-emerald-100 text-emerald-700" :
                        u.role === "admin" ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{u.role}</span>
                      <span className={`text-xs font-medium ${u.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {u.status === "active" ? "● Active" : "● Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === "users" ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900 text-lg">All Users ({users.length})</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(users || []).map((u, i) => (
                      <tr key={u.id || i} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                              {(u.full_name || "U").charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{u.full_name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            u.role === "doctor" ? "bg-emerald-100 text-emerald-700" :
                            u.role === "admin" ? "bg-purple-100 text-purple-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium ${u.status === "active" ? "text-green-600" : "text-red-600"}`}>
                            {u.status === "active" ? "● Active" : "● Suspended"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "doctors" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Doctor Management</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl text-sm">
                  <UserPlus className="w-4 h-4" /> Add Doctor
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Dr. Rajesh Kumar", spec: "Cardiology", rating: 4.9, patients: 120, status: "active" },
                  { name: "Dr. Ananya Reddy", spec: "Radiology", rating: 4.8, patients: 95, status: "active" },
                  { name: "Dr. Suresh Patel", spec: "Neurology", rating: 4.7, patients: 78, status: "pending" },
                ].map((doc, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {doc.name.charAt(4)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{doc.name}</div>
                        <div className="text-xs text-slate-500">{doc.spec}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-slate-900">⭐ {doc.rating}</div>
                        <div className="text-[10px] text-slate-500">Rating</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-slate-900">{doc.patients}</div>
                        <div className="text-[10px] text-slate-500">Patients</div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      doc.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>{doc.status === "active" ? "Verified" : "Pending"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "analyses" ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">AI Analysis Overview</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Completed", value: "2,340", color: "bg-green-100 text-green-700" },
                  { label: "Pending", value: "45", color: "bg-yellow-100 text-yellow-700" },
                  { label: "Failed", value: "12", color: "bg-red-100 text-red-700" },
                  { label: "Avg. Time", value: "3.2s", color: "bg-blue-100 text-blue-700" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mb-3 ${s.color}`}>{s.label}</div>
                    <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Image Type Distribution</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { type: "ECG", count: "1,200", pct: 48 },
                    { type: "MRI", count: "580", pct: 23 },
                    { type: "CT Scan", count: "420", pct: 17 },
                    { type: "X-Ray", count: "300", pct: 12 },
                  ].map((img) => (
                    <div key={img.type} className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3b82f6" strokeWidth="3"
                            strokeDasharray={`${img.pct} ${100 - img.pct}`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">{img.pct}%</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{img.type}</div>
                      <div className="text-xs text-slate-500">{img.count} analyses</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">System Settings</h2>
              {[
                { title: "Platform Configuration", items: ["Site name", "Support email", "Max upload size", "API rate limit"] },
                { title: "AI Configuration", items: ["Model selection", "Confidence threshold", "Max processing time", "GPU allocation"] },
                { title: "Security", items: ["JWT expiry", "OTP settings", "IP whitelist", "Audit logs"] },
                { title: "Notifications", items: ["Email SMTP", "SMS gateway", "Push notifications", "Alert thresholds"] },
              ].map((section) => (
                <div key={section.title} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">{section.title}</h3>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-700">{item}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
