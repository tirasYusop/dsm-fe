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
import StudentUsageSummary, { StudentSummaryData } from "@/components/dashboard/chart/studentUsage";
import type { DashboardSummary, SourceSummary } from "@/types/movement";

const SOURCES = [
  { value: "donation", label: "Sumbangan", color: "#D9A441" },
  { value: "purchase", label: "Pembelian", color: "#114B44" },
  { value: "sponsor", label: "Sponser", color: "#C4694F" },
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

function asArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results; // in case an endpoint is paginated
  return [];
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
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [facultyData, setFacultyData] = useState<FacultyAttendance[]>([]);
  const [studentSummary, setStudentSummary] = useState<StudentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          API.get("/inventory/"),
          API.get("/requests/"),
          API.get("/stock-movements/"), 
          API.get("/attendance/management/walk-in/"),
          API.get("/attendance/management/booking/"),
          API.get("/kitchens/"),
          API.get("/students/"),
          API.get("/source-inventory/summary/"),
          API.get("/attendance/summary/student/"),
        ]);

        const labels = [
          "inventory", "requests", "stock-movements", "walk-in", "booking",
          "kitchens", "students", "source-summary", "student-summary",
        ];

        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.log(
              `Dashboard call [${labels[i]}] failed:`,
              r.reason?.response?.status,
              r.reason?.response?.data
            );
          }
        });

        const [
          inventoryRes,
          requestRes,
          movementRes,
          walkinRes,
          bookingRes,
          kitchenRes,
          studentRes,
          sourceSummaryRes,
          studentSummaryRes,
        ] = results.map((r) => (r.status === "fulfilled" ? r.value : { data: [] }));

        const inventoryData = asArray(inventoryRes.data);
        const requestData = asArray(requestRes.data);
        const movementData = asArray(movementRes.data);
        const walkinData = asArray(walkinRes.data);
        const bookingData = asArray(bookingRes.data);
        const kitchenData = asArray(kitchenRes.data);
        const studentData = asArray(studentRes.data);
        const sourceSummaryData = asArray(sourceSummaryRes.data) as SourceSummary[];

        const today = new Date().toISOString().split("T")[0];
        const todayMovement = movementData.filter((item: any) => item.created_at?.startsWith(today));
        const inventoryInToday = todayMovement
          .filter((item: any) => item.movement_type === "in" && item.kitchen === null)
          .reduce((sum: number, item: any) => sum + item.quantity, 0);
        const inventoryOutToday = todayMovement
          .filter((item: any) => item.movement_type === "out")
          .reduce((sum: number, item: any) => sum + item.quantity, 0);
        const attendanceToday = [...walkinData, ...bookingData].filter((item: any) =>
          item.check_in_time?.startsWith(today)
        ).length;

        setSummary({
          totalItems: inventoryData.length,
          pendingRequests: requestData.filter((item: any) => item.status === "pending").length,
          inventoryInToday,
          inventoryOutToday,
          attendanceToday,
          totalKitchens: kitchenData.length,
          totalStudents: studentData.length,
          totalWalkin: walkinData.length,
          totalBooking: bookingData.length,
        });

        const summaryMap = new Map<string, SourceSummary>(
          sourceSummaryData.map((item) => [item.source, item])
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
        [...walkinData, ...bookingData].forEach((item: any) => {
          const faculty = item?.student?.faculty ?? "Unknown";
          facultyMap.set(faculty, (facultyMap.get(faculty) || 0) + 1);
        });
        setFacultyData(
          Array.from(facultyMap.entries())
            .map(([faculty, count]) => ({ faculty, count }))
            .sort((a, b) => b.count - a.count)
        );

        setStudentSummary(studentSummaryRes.data ?? null);
      } catch (error: any) {
        console.log("Dashboard error:", error?.response?.status, error?.response?.data);
        console.log("Dashboard error (raw):", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const netMovementToday = summary.inventoryInToday - summary.inventoryOutToday;
  const totalAttendanceAllTime = summary.totalWalkin + summary.totalBooking;
  const totalDonationAmount = sourceBreakdown.find((s) => s.source === "donation")?.totalAmount ?? 0;
  const totalPurchaseAmount = sourceBreakdown.find((s) => s.source === "purchase")?.totalAmount ?? 0;

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
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Pengurusan</h1>
              <p className="text-sm text-[#C7D9D3] mt-1">
                Inventori, permintaan, dan kehadiran pelajar kumulatif
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3">
              <TrendingUp size={18} className="text-[#D9A441]" />
              <div>
                <p className="text-[11px] text-[#C7D9D3] leading-none">Net movement Hari ini</p>
                <p className="text-lg font-bold text-white leading-tight">
                  {netMovementToday >= 0 ? "+" : ""}
                  {netMovementToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KITCHEN/STUDENT STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <DashboardCard title="Jumlah Dapur Aktif" value={summary.totalKitchens} icon={<ChefHat size={18} />} accent="#114B44" />
              <DashboardCard title="Jumlah Pengguna" value={summary.totalStudents} icon={<GraduationCap size={18} />} accent="#5B7B87" />
              <DashboardCard title="Jumlah Tempahan Dapur" value={summary.totalBooking} icon={<CalendarCheck size={18} />} accent="#D9A441" />
              <DashboardCard title="Jumlah Walk In Dapur" value={summary.totalWalkin} icon={<Footprints size={18} />} accent="#C4694F" />
            </>
          )}
        </div>

        {/* TODAY'S STATS */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5B7B87] uppercase mb-3">Hari Ini</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <DashboardCard title="Jumlah Inventori Item" value={summary.totalItems} icon={<Package size={18} />} accent="#114B44" />
                <DashboardCard title="Permintaan Tertangguh" value={summary.pendingRequests} icon={<Clock size={18} />} accent="#D9A441" />
                <DashboardCard title="Inventori Masuk Hari Ini" value={summary.inventoryInToday} icon={<ArrowDownToLine size={18} />} accent="#4C9A70" />
                <DashboardCard title="Inventory Keluar Hari Ini" value={summary.inventoryOutToday} icon={<ArrowUpFromLine size={18} />} accent="#C4694F" />
                <DashboardCard title="Kehadiran Hari Ini" value={summary.attendanceToday} icon={<Users size={18} />} accent="#5B7B87" />
              </>
            )}
          </div>
        </div>

        {/* STUDENT USAGE SUMMARY */}
        <StudentUsageSummary data={studentSummary} loading={loading} />

        {/* CHARTS */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5B7B87] uppercase">
            Ringkasan Inventori
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
            <div className="lg:col-span-3">
              <InventoryBySourceChart data={sourceBreakdown} loading={loading} />
            </div>
            <div className="lg:col-span-2">
              <FacultyAttendanceChart data={facultyData} loading={loading} />
            </div>
          </div>

          {/* ATTENDANCE BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-4">
            <div className="lg:col-span-3 border rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-lg text-[#16211C] mb-1">Cara pelajar hadir</h2>
              <p className="text-sm text-[#5B7B87] mb-5">Tempahan vs. Walk-in</p>
              <div className="space-y-5">
                <AttendanceBar
                  label="Ditempah Lebih Awal"
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
        </div>

        {/* SOURCE SUMMARY */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5B7B87] uppercase mb-3">
            Kumulatif Sumber Dalam Ringgit Malaysia (RM)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-2xl bg-white p-5 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="text-sm text-[#5B7B87]">Jumlah Sumbangan Diterima</p>
                <h3 className="text-2xl font-bold text-[#16211C] mt-1">RM {totalDonationAmount.toFixed(2)}</h3>
              </div>
              <span className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D9A44118", color: "#D9A441" }}>
                <Package size={20} />
              </span>
            </div>

            <div className="border rounded-2xl bg-white p-5 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="text-sm text-[#5B7B87]">Jumlah Wang Digunakan Untuk Sumber Pembelian</p>
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