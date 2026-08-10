"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { TableRow, TableCell } from "@/components/ui/table";
import DataTable from "@/components/table";
import PageHeader from "@/components/ui/page-header";
import SectionHeading from "@/components/ui/section-heading";
import RoleGuard from "@/components/auth/roleguard";
import FilterBar from "@/components/filterBar";
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const fetchWalkin = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await API.get<PaginatedResponse<Attendance> | Attendance[]>(
        "/attendance/management/walk-in/",
        { params: { page: currentPage } }
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
  }, []);

  useEffect(() => {
    fetchWalkin(page);
  }, [page]);

  // Search filters within the current page only — see note below.
  const filteredRecords = search.trim()
    ? records.filter(
        (r) =>
          r.student.name.toLowerCase().includes(search.toLowerCase()) ||
          r.student.student_id.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  const groupedKitchen = filteredRecords.reduce((acc: Record<string, Attendance[]>, item) => {
    const kitchenId = item.kitchen?.id?.toString() ?? "unknown";
    if (!acc[kitchenId]) acc[kitchenId] = [];
    acc[kitchenId].push(item);
    return acc;
  }, {});

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Kehadiran Pelajar (Walk In)"
          action={
            <ExportButton
              title="Kehadiran Pelajar (Walk In)"
              filename="student-walkin-attendance"
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
          }
        />

        <FilterBar
          search={{ value: search, onChange: setSearch, placeholder: "Cari nama / ID pelajar..." }}
          hasActiveFilters={!!search}
          onClear={() => setSearch("")}
        />

        {Object.keys(groupedKitchen).map((kitchenId) => {
          const kitchenRecords = groupedKitchen[kitchenId];
          const kitchen = kitchenRecords[0].kitchen;
          return (
            <div key={kitchenId} className="space-y-3">
              <SectionHeading>{kitchen?.name}</SectionHeading>
              <DataTable
                columns={COLUMNS}
                data={kitchenRecords}
                loading={loading}
                emptyMessage="Tiada rekod walk-in."
                renderRow={(item, index) => {
                  const activity = activities[item.id];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="p-2">{index + 1}</TableCell>
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
          );
        })}

        {totalRecords > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasNext={!!nextPage}
            hasPrevious={!!previousPage}
            onNext={() => setPage((p) => p + 1)}
            onPrevious={() => setPage((p) => p - 1)}
            loading={loading}
            totalCount={totalRecords}
            pageSize={pageSize}
            itemLabel="rekod"
          />
        )}
      </div>
    </RoleGuard>
  );
}