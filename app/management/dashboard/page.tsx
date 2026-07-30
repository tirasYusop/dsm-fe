"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/auth/roleguard";
import API from "@/lib/api1";
import {
  Package,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  TrendingUp,
  ChefHat,
  GraduationCap,
  CalendarCheck,
  Footprints,
} from "lucide-react";
import DashboardCard from "@/components/dashboard/chart/DashboardCard";
import InventoryBySourceChart, { SourceBreakdown } from "@/components/dashboard/chart/InventoryBySourceChart";
import FacultyAttendanceChart, { FacultyAttendance } from "@/components/dashboard/chart/FacultyAttendanceChart";

type DashboardSummary = {
  totalItems: number;
  pendingRequests: number;
  inventoryInToday: number;
  inventoryOutToday: number;
  attendanceToday: number;
  totalKitchens: number;
  totalStudents: number;
  totalWalkin: number;
  totalBooking: number;
};

type BookingStatusBreakdown = {
  pending: number;
  approved: number;
  cancelled: number;
  rejected: number;
};

type SourceSummary = {
  source: string;
  total_quantity: number;
  item_count: number;
  total_amount: number;
};

const SOURCES = [
  { value: "donation", label: "Donation", color: "#D9A441" },
  { value: "purchase", label: "Purchase", color: "#114B44" },
  { value: "sponsor", label: "Sponsor", color: "#C4694F" },
  { value: "supplier", label: "Supplier", color: "#5B7B87" },
  { value: "other", label: "Other", color: "#9CA3AF" },
];

const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function SkeletonCard() {
  return (
    <div className="border rounded-2xl bg-white p-5 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-7 w-16 bg-gray-200 rounded" />
    </div>
  );
}

function AttendanceBar({
  label,
  count,
  total,
  color,
  icon,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18`, color }}>
            {icon}
          </span>
          <span className="text-sm font-medium text-[#16211C]">{label}</span>
        </div>
        <span className="text-sm font-bold text-[#16211C]">
          {count} <span className="text-[#9CA8A4] font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#EEF2F1] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex-1 min-w-[120px] border rounded-xl p-3 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-xs text-[#5B7B87]">{label}</p>
      </div>
      <p className="text-xl font-bold text-[#16211C]">{count}</p>
    </div>
  );
}

export default function ManagementDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalItems: 0,
    pendingRequests: 0,
    inventoryInToday: 0,
    inventoryOutToday: 0,
    attendanceToday: 0,
    totalKitchens: 0,
    totalStudents: 0,
    totalWalkin: 0,
    totalBooking: 0,
  });
  const [bookingStatus, setBookingStatus] = useState<BookingStatusBreakdown>({
    pending: 0,
    approved: 0,
    cancelled: 0,
    rejected: 0,
  });
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [facultyData, setFacultyData] = useState<FacultyAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [
          inventoryRes,
          requestRes,
          movementRes,
          walkinRes,
          bookingRes,
          kitchenRes,
          studentRes,
          allBookingsRes,
          sourceSummaryRes,
        ] = await Promise.all([
          API.get("inventory/"),
          API.get("requests/"),
          API.get("stock-movements/"),
          API.get("attendance/management/walk-in/"),
          API.get("attendance/management/booking/"),
          API.get("kitchens/"),
          API.get("students/"),
          API.get("kitchen-bookings/"),
          API.get("source-inventory/summary/"),
        ]);

        const today = new Date().toISOString().split("T")[0];
        const todayMovement = movementRes.data.filter((item: any) => item.created_at?.startsWith(today));
        const inventoryInToday = todayMovement
          .filter((item: any) => item.movement_type === "in" && item.kitchen === null)
          .reduce((sum: number, item: any) => sum + item.quantity, 0);
        const inventoryOutToday = todayMovement
          .filter((item: any) => item.movement_type === "out")
          .reduce((sum: number, item: any) => sum + item.quantity, 0);
        const attendanceToday = [...walkinRes.data, ...bookingRes.data].filter((item: any) =>
          item.check_in_time?.startsWith(today)
        ).length;
      

        setSummary({
          totalItems: inventoryRes.data.length,
          pendingRequests: requestRes.data.filter((item: any) => item.status === "pending").length,
          inventoryInToday,
          inventoryOutToday,
          attendanceToday,
          totalKitchens: kitchenRes.data.length,
          totalStudents: studentRes.data.length,
          totalWalkin: walkinRes.data.length,
          totalBooking: bookingRes.data.length,
        });

        setBookingStatus({
          pending: allBookingsRes.data.filter((b: any) => b.status === "pending").length,
          approved: allBookingsRes.data.filter((b: any) => b.status === "approved").length,
          cancelled: allBookingsRes.data.filter((b: any) => b.status === "cancelled").length,
          rejected: allBookingsRes.data.filter((b: any) => b.status === "rejected").length,
        });

        const summaryMap = new Map<string, SourceSummary>(
          (sourceSummaryRes.data as SourceSummary[]).map((item) => [
            item.source,
            item,
          ])
        );

        setSourceBreakdown(
          SOURCES.map((s) => {
            const data = summaryMap.get(s.value);

            return {
              source: s.value,
              label: s.label,
              color: s.color,

              totalReceived: data?.total_quantity ?? 0,
              itemCount: data?.item_count ?? 0,
              totalAmount: data?.total_amount ?? 0,
            };
          })
        );

        const facultyMap = new Map<string, number>();
        [...walkinRes.data, ...bookingRes.data].forEach((item: any) => {
          const faculty = item.student.faculty ?? "Unknown";
          facultyMap.set(faculty, (facultyMap.get(faculty) || 0) + 1);
        });
        setFacultyData(
          Array.from(facultyMap.entries())
            .map(([faculty, count]) => ({ faculty, count }))
            .sort((a, b) => b.count - a.count)
        );
      } catch (error) {
        console.log("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const netMovementToday =summary.inventoryInToday - summary.inventoryOutToday;
  const totalAttendanceAllTime =summary.totalWalkin + summary.totalBooking;
  const totalDonationAmount =sourceBreakdown.find((s) => s.source === "donation")?.totalAmount ?? 0;
  const totalPurchaseAmount =sourceBreakdown.find((s) => s.source === "purchase")?.totalAmount ?? 0;


  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="min-h-screen bg-[#F3F6F5] px-6 py-8 -m-6 space-y-8">

        {/* HERO / HEADER */}
        <div className="rounded-3xl bg-gradient-to-br from-[#143577] to-[#16211C] px-8 py-7 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute right-24 bottom-0 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-[#9FC5B8] uppercase mb-1">
                {TODAY_LABEL}
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">Management Dashboard</h1>
              <p className="text-sm text-[#C7D9D3] mt-1">
                Inventory, requests, and student attendance — at a glance.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3">
              <TrendingUp size={18} className="text-[#D9A441]" />
              <div>
                <p className="text-[11px] text-[#C7D9D3] leading-none">Net movement today</p>
                <p className="text-lg font-bold text-white leading-tight">
                  {netMovementToday >= 0 ? "+" : ""}
                  {netMovementToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/*attendance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <DashboardCard title="Total Active Kitchens" value={summary.totalKitchens} icon={<ChefHat size={18} />} accent="#114B44" />
              <DashboardCard title="Total Students used" value={summary.totalStudents} icon={<GraduationCap size={18} />} accent="#5B7B87" />
              <DashboardCard title="Total Bookings Made" value={summary.totalBooking} icon={<CalendarCheck size={18} />} accent="#D9A441" />
              <DashboardCard title="Total Walk In" value={summary.totalWalkin} icon={<Footprints size={18} />} accent="#C4694F" />
            </>
          )}
        </div>

        {/* TODAY'S STATS */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5B7B87] uppercase mb-3">Today</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <DashboardCard title="Total Inventory Items" value={summary.totalItems} icon={<Package size={18} />} accent="#114B44" />
                <DashboardCard title="Pending Requests" value={summary.pendingRequests} icon={<Clock size={18} />} accent="#D9A441" />
                <DashboardCard title="Inventory In Today" value={summary.inventoryInToday} icon={<ArrowDownToLine size={18} />} accent="#4C9A70" />
                <DashboardCard title="Inventory Out Today" value={summary.inventoryOutToday} icon={<ArrowUpFromLine size={18} />} accent="#C4694F" />
                <DashboardCard title="Attendance Today" value={summary.attendanceToday} icon={<Users size={18} />} accent="#5B7B87" />
              </>
            )}
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <InventoryBySourceChart data={sourceBreakdown} loading={loading} />
          </div>
          <div className="lg:col-span-2">
            <FacultyAttendanceChart data={facultyData} loading={loading} />
          </div>
        </div>

        {/* ATTENDANCE BREAKDOWN + BOOKING STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 border rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-lg text-[#16211C] mb-1">How students are attending</h2>
            <p className="text-sm text-[#5B7B87] mb-5">Booking vs. walk-in, all time.</p>
            <div className="space-y-5">
              <AttendanceBar
                label="Booked in advance"
                count={summary.totalBooking}
                total={totalAttendanceAllTime}
                color="#114B44"
                icon={<CalendarCheck size={14} />}
              />
              <AttendanceBar
                label="Walked in"
                count={summary.totalWalkin}
                total={totalAttendanceAllTime}
                color="#D9A441"
                icon={<Footprints size={14} />}
              />
            </div>
          </div>
        </div>

        {/* SOURCE SUMMARY */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5B7B87] uppercase mb-3">
            Sources at a glance
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-white p-5 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="text-sm text-[#5B7B87]">Total Donations Received</p>
                <h3 className="text-2xl font-bold text-[#16211C] mt-1">RM {totalDonationAmount.toFixed(2)}</h3>
              </div>
              <span className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D9A44118", color: "#D9A441" }}>
                <Package size={20} />
              </span>
            </div>

            <div className="border rounded-2xl bg-white p-5 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="text-sm text-[#5B7B87]">Total Purchased</p>
                <h3 className="text-2xl font-bold text-[#16211C] mt-1">RM {totalPurchaseAmount.toFixed(2)}</h3>
              </div>
              <span className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#114B4418", color: "#114B44" }}>
                <Package size={20} />
              </span>
            </div>
          </div>
        </div>

        {/* FOOTNOTE */}
        <div className="border-t border-[#E0E6E4] pt-5 flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-[#5B7B87]">
            Figures refresh on page load. For a live breakdown, open Inventory or Attendance directly.
          </p>
          <p className="text-xs text-[#9CA8A4]">Last loaded {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </RoleGuard>
  );
}