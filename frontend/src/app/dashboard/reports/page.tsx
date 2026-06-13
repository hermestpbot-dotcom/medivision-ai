"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart, FileText, Download, Eye, Calendar, Brain,
  Settings, LogOut, Menu, X, Bell, Search, Filter,
  ChevronRight, AlertTriangle, CheckCircle, Clock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { reportsAPI, analysisAPI } from "@/lib/api";
import type { MedicalReport, AnalysisResult } from "@/types";

export default function ReportsPage() {
  const { user, logout } = useAuthStore();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reports" | "history">("reports");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, aRes] = await Promise.all([
          reportsAPI.getMyReports(),
          analysisAPI.getResults(0, 50),
        ]);
        setReports(rRes.data || []);
        setAnalyses(aRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (reportId: string) => {
    try {
      const res = await reportsAPI.download(reportId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download report");
    }
  };

  const handleGenerate = async (analysisId: string) => {
    try {
      await reportsAPI.generate(analysisId);
      window.location.reload();
    } catch {
      alert("Failed to generate report");
    }
  };

  const navItems = [
    { icon: Heart, label: "Dashboard", href: "/dashboard/patient" },
    { icon: Brain, label: "New Analysis", href: "/dashboard/analysis" },
    { icon: FileText, label: "Reports", href: "/dashboard/reports", active: true },
    { icon: Settings, label: "Settings", href: "/dashboard/patient#settings" },
  ];

  const filteredReports = reports.filter((r) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.report_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediVision AI</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100">
          <button onClick={() => { logout(); window.location.href = "/"; }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 w-full transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">Medical Reports</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.full_name}</div>
                <div className="text-xs text-slate-500">Patient</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
            <button onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "reports" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <FileText className="w-4 h-4 inline mr-1.5" />My Reports
            </button>
            <button onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <Clock className="w-4 h-4 inline mr-1.5" />Analysis History
            </button>
          </div>

          {activeTab === "reports" && (
            <>
              {/* Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search reports..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <span className="text-sm text-slate-500">{filteredReports.length} reports</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No reports yet</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Complete an AI analysis and generate your first medical report.
                  </p>
                  <Link href="/dashboard/analysis"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl text-sm">
                    <Brain className="w-4 h-4" /> Start Analysis
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredReports.map((report, i) => (
                    <motion.div key={report.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.pdf_generated ? "bg-green-100" : "bg-yellow-100"}`}>
                            {report.pdf_generated ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-yellow-600" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{report.title || `Report #${report.report_number}`}</div>
                            <div className="text-sm text-slate-500">
                              {report.image_type?.toUpperCase()} • {report.risk_level?.toUpperCase()} Risk • {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{(report.confidence_score * 100).toFixed(1)}% confidence</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.pdf_generated && (
                            <button onClick={() => handleDownload(report.id)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                              <Download className="w-4 h-4" /> PDF
                            </button>
                          )}
                          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Analysis History</h2>
              {analyses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No analyses yet</h3>
                  <Link href="/dashboard/analysis"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl text-sm">
                    Upload First Image
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {analyses.map((a, i) => (
                      <div key={a.id || i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                          a.risk_level === "low" ? "bg-green-500" : a.risk_level === "moderate" ? "bg-yellow-500" : a.risk_level === "high" ? "bg-orange-500" : "bg-red-500"
                        }`}>
                          {a.image_type?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{a.original_filename}</div>
                          <div className="text-xs text-slate-500">{a.image_type?.toUpperCase()} • {new Date(a.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          a.risk_level === "low" ? "bg-green-100 text-green-700" :
                          a.risk_level === "moderate" ? "bg-yellow-100 text-yellow-700" :
                          a.risk_level === "high" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                        }`}>{a.risk_level?.toUpperCase()}</span>
                        {!a.report_generated && (
                          <button onClick={() => handleGenerate(a.id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700">
                            Generate Report
                          </button>
                        )}
                        {a.report_generated && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
