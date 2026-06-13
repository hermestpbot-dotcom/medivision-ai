"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart, Users, Brain, FileText, Calendar, Bell,
  Activity, Settings, LogOut, Menu, X, CheckCircle,
  AlertTriangle, Clock, Star, MessageSquare, Upload,
  ChevronRight, Eye, Stethoscope, Search, Filter
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { doctorsAPI, patientsAPI, appointmentsAPI } from "@/lib/api";

interface DoctorPatient {
  id: string;
  full_name: string;
  email: string;
  age?: number;
  gender?: string;
  last_analysis?: string;
  risk_level?: string;
  unread?: boolean;
}

export default function DoctorDashboard() {
  const { user, logout } = useAuthStore();
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"patients" | "reviews" | "appointments" | "profile">("patients");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await patientsAPI.getProfile();
        setPatients(res.data?.patients || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const navItems = [
    { icon: Users, label: "My Patients", id: "patients" as const },
    { icon: Brain, label: "AI Reviews", id: "reviews" as const },
    { icon: Calendar, label: "Appointments", id: "appointments" as const },
    { icon: Settings, label: "Profile", id: "profile" as const },
  ];

  const mockPatients: DoctorPatient[] = [
    { id: "1", full_name: "Rahul Sharma", email: "rahul@email.com", age: 45, gender: "M", risk_level: "moderate", last_analysis: "2024-06-10", unread: true },
    { id: "2", full_name: "Priya Patel", email: "priya@email.com", age: 32, gender: "F", risk_level: "low", last_analysis: "2024-06-09" },
    { id: "3", full_name: "Amit Kumar", email: "amit@email.com", age: 58, gender: "M", risk_level: "high", last_analysis: "2024-06-08", unread: true },
    { id: "4", full_name: "Sneha Reddy", email: "sneha@email.com", age: 28, gender: "F", risk_level: "low", last_analysis: "2024-06-07" },
    { id: "5", full_name: "Vikram Singh", email: "vikram@email.com", age: 52, gender: "M", risk_level: "moderate", last_analysis: "2024-06-06" },
  ];

  const displayPatients = patients.length > 0 ? patients : mockPatients;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediVision AI</span>
              <p className="text-[10px] text-slate-400 -mt-0.5">Doctor Portal</p>
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
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
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

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">Doctor Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.charAt(0) || "D"}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.full_name}</div>
                <div className="text-xs text-slate-500">Doctor</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Patients", value: displayPatients.length, icon: Users, color: "emerald" },
              { label: "Pending Reviews", value: displayPatients.filter(p => p.unread).length, icon: Brain, color: "blue" },
              { label: "Rating", value: "4.9", icon: Star, color: "yellow" },
              { label: "Today's Appointments", value: "5", icon: Calendar, color: "purple" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  stat.color === "emerald" ? "bg-emerald-100" :
                  stat.color === "blue" ? "bg-blue-100" :
                  stat.color === "yellow" ? "bg-yellow-100" : "bg-purple-100"
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === "emerald" ? "text-emerald-600" :
                    stat.color === "blue" ? "text-blue-600" :
                    stat.color === "yellow" ? "text-yellow-600" : "text-purple-600"
                  }`} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {activeTab === "patients" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">My Patients</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search patients..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {displayPatients.map((patient, i) => (
                    <motion.div key={patient.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {patient.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{patient.full_name}</span>
                            {patient.unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <div className="text-xs text-slate-500">{patient.email} • {patient.age}y • {patient.gender}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            patient.risk_level === "high" ? "bg-red-100 text-red-700" :
                            patient.risk_level === "moderate" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {patient.risk_level?.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 hidden sm:block">Last: {patient.last_analysis}</span>
                          <Link href={`/dashboard/analysis?id=${patient.id}`}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Pending AI Reviews</h2>
              {[
                { patient: "Rahul Sharma", type: "ECG Analysis", risk: "Moderate", time: "2 hours ago" },
                { patient: "Amit Kumar", type: "MRI Analysis", risk: "High", time: "5 hours ago" },
              ].map((review, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{review.patient} — {review.type}</div>
                        <div className="text-xs text-slate-500">{review.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        review.risk === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>{review.risk} Risk</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-xl">
                        Review
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
              {[
                { patient: "Rahul Sharma", time: "10:00 AM", type: "Video Call", date: "Today" },
                { patient: "Priya Patel", time: "11:30 AM", type: "In-Person", date: "Today" },
                { patient: "Vikram Singh", time: "2:00 PM", type: "Video Call", date: "Tomorrow" },
              ].map((apt, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{apt.patient}</div>
                      <div className="text-xs text-slate-500">{apt.date} • {apt.time} • {apt.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                      Reschedule
                    </button>
                    <button className="px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg">
                      Join
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Doctor Profile</h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                    {user?.full_name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{user?.full_name}</div>
                    <div className="text-sm text-slate-500">{user?.email}</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Specialization", value: "Cardiology" },
                    { label: "License Number", value: "MC-2024-001" },
                    { label: "Experience", value: "12 years" },
                    { label: "Consultation Fee", value: "₹1,500" },
                    { label: "Hospital", value: "Apollo Hospitals" },
                    { label: "Rating", value: "⭐ 4.9 (120 reviews)" },
                  ].map((field) => (
                    <div key={field.label} className="bg-slate-50 rounded-xl p-3">
                      <div className="text-xs text-slate-500 mb-1">{field.label}</div>
                      <div className="text-sm font-semibold text-slate-900">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
