"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import { TableRow, TableCell } from "@/components/ui/table";
import DataTable from "@/components/table";
import PageHeader from "@/components/ui/page-header";
import RoleGuard from "@/components/auth/roleguard";
import FilterBar from "@/components/filterBar";
import PillTabs from "@/components/ui/pill-tabs";
import ExportButton from "@/components/exportButton";
import PaginationControls from "@/components/common/PaginationControls";
import { getResults, getPageMeta, type PaginatedResponse } from "@/lib/pagination";
import type { Attendance, StudentActivity } from "@/types/attandance";

const COLUMNS = [
  { key: "no", label: "Bil.", className: "w-10" },
  { key: "id", label: "ID Pelajar" },
  { key: "name", label: "Nama" },
  { key: "faculty", label: "Fakulti", align: "center" as const },
  { key: "checkin", label: "Waktu Check In", align: "center" as const },
  { key: "activity", label: "Aktiviti" },
];

function activityLabel(activity?: StudentActivity) {
  if (!activity) return "Not recorded";
  const parts: string[] = [];
  if (activity.took_rice) parts.push("Mengambil Nasi");
  if (activity.took_dish) parts.push("Mengambil Lauk");
  if (activity.used_kitchen) parts.push("Menggunakan Dapur");
  if (activity.took_foodbank) {
    parts.push(`Foodbank: ${activity.foodbank_items.map((f) => `${f.item_name} x${f.quantity}`).join(", ")}`);
  }
  return parts.length ? parts.join(" | ") : "Tiada Aktiviti";
}

export default function StudentWalkinPage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [activities, setActivities] = useState<Record<number, StudentActivity>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [kitchenNames, setKitchenNames] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const fetchWalkin = async (currentPage: number, kitchen: string) => {
    setLoading(true);
    try {
      const res = await API.get<PaginatedResponse<Attendance> | Attendance[]>(
        "/attendance/management/walk-in/",
        { params: { page: currentPage, kitchen } }
      );
      const results = getResults(res.data);
      const meta = getPageMeta(res.data, pageSize);

      setRecords(results);
      setTotalRecords(meta.count);
      setPageSize(meta.page_size);
      setNextPage(meta.next);
      setPreviousPage(meta.previous);
    } catch (error) {
      console.error("Failed load walk in", error);
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const [kitchenOptions, setKitchenOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchKitchenNames = async () => {
    try {
      const res = await API.get<PaginatedResponse<Attendance> | Attendance[]>(
        "/attendance/management/walk-in/",
        { params: { page_size: 1000 } }
      );
      const results = getResults(res.data);

      const map = new Map<string, string>();
      results.forEach((r) => {
        const name = r.kitchen?.name;
        if (name) {
          map.set(name, r.kitchen?.code || name);
        }
      });

      const options = Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      setKitchenOptions(options);
    } catch (error) {
      console.error("Failed to load kitchen list", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await API.get<StudentActivity[]>("/attendance/activity/list/");
      const map: Record<number, StudentActivity> = {};
      res.data.forEach((activity) => {
        map[activity.attendance] = activity;
      });
      setActivities(map);
    } catch (error) {
      console.error("Failed load activities", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchKitchenNames();
  }, []);

  useEffect(() => {
    if (!activeTab && kitchenOptions.length > 0) {
      setActiveTab(kitchenOptions[0].value);
    }
  }, [kitchenOptions, activeTab]);

  useEffect(() => {
    if (!activeTab) return;
    fetchWalkin(page, activeTab);
   }, [page, activeTab]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const TABS = useMemo(
    () => kitchenOptions.map((k) => ({ value: k.value, label: k.label })),
    [kitchenOptions]
  );


  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.student.name.toLowerCase().includes(q) ||
        r.student.student_id.toLowerCase().includes(q)
    );
  }, [records, search]);

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Kehadiran Pelajar (Walk In)"
          action={
            <div className="w-full sm:w-auto">
              <ExportButton
                title={`Kehadiran Pelajar (Walk In) - ${activeTab}`}
                filename={`student-walkin-attendance-${activeTab}`}
                columns={["Bil", "ID Pelajar", "Nama", "Fakulti", "Check In", "Aktiviti"]}
                rows={filteredRecords.map((item, i) => [
                  (page - 1) * pageSize + i + 1,
                  item.student.student_id,
                  item.student.name,
                  item.student.faculty,
                  new Date(item.check_in_time).toLocaleString(),
                  activityLabel(activities[item.id]),
                ])}
                subtitle="Eksport halaman semasa sahaja"
              />
            </div>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto">
            <PillTabs options={TABS} value={activeTab} onChange={setActiveTab} />
          </div>
           <FilterBar
            search={{ value: search, onChange: setSearch, placeholder: "Cari nama / ID pelajar..." }}
            hasActiveFilters={!!search}
            onClear={() => setSearch("")}
          />
        </div>
        

        {/* Desktop / tablet: table */}
        <div className="hidden sm:block">
          <DataTable
            columns={COLUMNS}
            data={filteredRecords}
            loading={loading}
            emptyMessage="Tiada rekod walk-in."
            renderRow={(item, index) => {
              const activity = activities[item.id];
              return (
                <TableRow key={item.id}>
                  <TableCell className="p-2">{(page - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="p-2">{item.student.student_id}</TableCell>
                  <TableCell className="p-2">{item.student.name}</TableCell>
                  <TableCell className="p-2 text-center">{item.student.faculty}</TableCell>
                  <TableCell className="p-2 text-center">
                    {new Date(item.check_in_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="p-2">
                    {!activity ? (
                      <span className="text-xs text-muted-foreground">Not recorded</span>
                    ) : (
                      <ul className="text-xs space-y-0.5">
                        {activity.took_rice && <li>Mengambil Nasi</li>}
                        {activity.took_dish && <li>Mengambil Lauk</li>}
                        {activity.used_kitchen && <li>Menggunakan Dapur</li>}
                        {activity.took_foodbank && (
                          <li>
                            Foodbank: {activity.foodbank_items.map((f) => `${f.item_name} x${f.quantity}`).join(", ")}
                          </li>
                        )}
                        {!activity.took_rice && !activity.took_dish && !activity.used_kitchen && !activity.took_foodbank && (
                          <li className="text-muted-foreground">Tiada Aktiviti</li>
                        )}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              );
            }}
          />
        </div>

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {loading ? (
            <div className="rounded-lg border bg-white p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
              Tiada rekod walk-in.
            </div>
          ) : (
            filteredRecords.map((item, index) => {
              const activity = activities[item.id];
              return (
                <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">#{(page - 1) * pageSize + index + 1}</p>
                      <p className="truncate font-semibold text-gray-900">{item.student.name}</p>
                      <p className="text-sm text-gray-500">{item.student.student_id}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Fakulti</p>
                      <p className="font-medium text-gray-800">{item.student.faculty || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Check In</p>
                      <p className="font-medium text-gray-800">
                        {new Date(item.check_in_time).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 border-t border-gray-100 pt-2 text-sm">
                    <p className="mb-1 text-xs text-gray-400">Aktiviti</p>
                    {!activity ? (
                      <span className="text-xs text-muted-foreground">Not recorded</span>
                    ) : (
                      <ul className="space-y-0.5 text-xs text-gray-700">
                        {activity.took_rice && <li>• Mengambil Nasi</li>}
                        {activity.took_dish && <li>• Mengambil Lauk</li>}
                        {activity.used_kitchen && <li>• Menggunakan Dapur</li>}
                        {activity.took_foodbank && (
                          <li>
                            • Foodbank: {activity.foodbank_items.map((f) => `${f.item_name} x${f.quantity}`).join(", ")}
                          </li>
                        )}
                        {!activity.took_rice && !activity.took_dish && !activity.used_kitchen && !activity.took_foodbank && (
                          <li className="text-muted-foreground">Tiada Aktiviti</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalRecords > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasNext={!!nextPage}
            hasPrevious={!!previousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => p - 1)}
            loading={loading}
            currentCount={filteredRecords.length}
            totalCount={totalRecords}
            pageSize={pageSize}
            itemLabel="rekod"
          />
        )}
      </div>
    </RoleGuard>
  );
}