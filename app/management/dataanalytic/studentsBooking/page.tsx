"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
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
import type { Attendance, Participant } from "@/types/attandance";
import { ChevronDown } from "lucide-react";

const COLUMNS = [
  { key: "no", label: "No.", className: "w-10" },
  { key: "id", label: "ID Pelajar" },
  { key: "name", label: "Nama" },
  { key: "faculty", label: "Fakulti", align: "center" as const },
  { key: "kitchen", label: "Dapur", align: "center" as const },
  { key: "date", label: "Tarikh", align: "center" as const },
  { key: "slot", label: "Slot", align: "center" as const },
  { key: "people", label: "Jumlah Pelajar", align: "center" as const },
  { key: "type", label: "Jenis", align: "center" as const },
  { key: "checkin", label: "Check In", align: "center" as const },
];

export default function StudentBookingPage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [participantsCache, setParticipantsCache] = useState<Record<number, Participant[]>>({});
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");

  // Kitchen filter options for the tab list — value stays the kitchen NAME (what the
  // backend expects for ?kitchen=), label prefers the shorter code when available.
  const [kitchenOptions, setKitchenOptions] = useState<{ value: string; label: string }[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Always scoped to a single kitchen — the server does the filtering AND the pagination,
  // so totalRecords/totalPages reflect only that kitchen's students.
  const fetchBooking = async (currentPage: number, kitchen: string) => {
    setLoading(true);
    try {
      const res = await API.get<PaginatedResponse<Attendance> | Attendance[]>(
        "/attendance/management/booking/",
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
      console.error("Failed load booking attendance", error);
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchKitchenNames = async () => {
    try {
      const res = await API.get<PaginatedResponse<Attendance> | Attendance[]>(
        "/attendance/management/booking/",
        { params: { page_size: 1000 } }
      );
      const results = getResults(res.data);

      const map = new Map<string, string>();
      results.forEach((r) => {
        const name = r.kitchen?.name;
        if (name) {
          // filter value MUST stay the kitchen name — code is just a nicer tab label
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

  useEffect(() => {
    fetchKitchenNames();
  }, []);
  useEffect(() => {
    if (!activeTab && kitchenOptions.length > 0) {
      setActiveTab(kitchenOptions[0].value);
    }
  }, [kitchenOptions, activeTab]);
  useEffect(() => {
    if (!activeTab) return;
    fetchBooking(page, activeTab);
  }, [page, activeTab]);
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const toggleFriends = async (bookingId: number) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
      return;
    }
    setExpandedBookingId(bookingId);
    if (participantsCache[bookingId]) return;
    await fetchParticipants(bookingId);
  };

  const fetchParticipants = async (bookingId: number) => {
    setLoadingParticipants(true);
    try {
      const res = await API.get(`/kitchen-bookings/${bookingId}/`);
      setParticipantsCache((prev) => ({
        ...prev,
        [bookingId]: res.data.participants ?? [],
      }));
    } catch (error) {
      console.error("Failed to load booking participants", error);
    } finally {
      setLoadingParticipants(false);
    }
  };

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

  // Ensure every visible booking's participants are loaded so export can include friends,
  // not just whichever rows the user happened to expand.
  useEffect(() => {
    const missingBookingIds = filteredRecords
      .map((r) => r.booking?.id)
      .filter((id): id is number => id !== undefined && !participantsCache[id]);

    if (missingBookingIds.length === 0) return;

    Promise.all(missingBookingIds.map((id) => fetchParticipants(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRecords]);

  const friendsLabel = (bookingId?: number) => {
    if (bookingId === undefined) return "-";
    const friends = (participantsCache[bookingId] ?? []).filter((p) => !p.is_owner);
    if (friends.length === 0) return "-";
    return friends.map((f) => `${f.name} (${f.student_id})`).join(", ");
  };

  const exportRows = filteredRecords.map((item, index) => [
    (page - 1) * pageSize + index + 1,
    item.student.student_id,
    item.student.name,
    item.student.faculty,
    item.kitchen?.name ?? activeTab,
    item.booking?.slot.date ?? "-",
    item.booking ? `${item.booking.slot.start_time} - ${item.booking.slot.end_time}` : "-",
    item.booking?.number_of_people ?? "-",
    item.attendance_type,
    new Date(item.check_in_time).toLocaleString(),
    friendsLabel(item.booking?.id),
  ]);

  const hasActiveFilters = !!search.trim();

  const clearFilters = () => {
    setSearch("");
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Kehadiran Pelajar (Tempahan)"
          action={
            <div className="w-full sm:w-auto">
              <ExportButton
                title={`Kehadiran Pelajar (Tempahan) - ${activeTab}`}
                filename={`student-booking-attendance-${activeTab}`}
                columns={["No", "ID Pelajar", "Nama", "Fakulti", "Dapur", "Tarikh", "Slot", "Jumlah", "Jenis", "Check In", "Rakan"]}
                rows={exportRows}
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
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Desktop / tablet: table */}
        <div className="hidden sm:block">
          <DataTable
            columns={COLUMNS}
            data={filteredRecords}
            loading={loading}
            emptyMessage="Tiada rekod tempahan."
            renderRow={(item, index) => {
              const bookingId = item.booking?.id;
              const isExpanded = bookingId !== undefined && expandedBookingId === bookingId;
              const friends =
                bookingId !== undefined
                  ? (participantsCache[bookingId] ?? []).filter((p) => !p.is_owner)
                  : [];

              return (
                <Fragment key={item.id}>
                  <TableRow
                    onClick={() => bookingId !== undefined && toggleFriends(bookingId)}
                    className={bookingId !== undefined ? "cursor-pointer hover:bg-gray-50" : ""}
                  >
                    <TableCell className="p-2">{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="p-2">{item.student.student_id}</TableCell>
                    <TableCell className="p-2">{item.student.name}</TableCell>
                    <TableCell className="p-2 text-center">{item.student.faculty}</TableCell>
                    <TableCell className="p-2 text-center">{item.kitchen?.code ?? activeTab}</TableCell>
                    <TableCell className="p-2 text-center">{item.booking?.slot.date}</TableCell>
                    <TableCell className="p-2 text-center">
                      {item.booking?.slot.start_time} - {item.booking?.slot.end_time}
                    </TableCell>
                    <TableCell className="p-2 text-center">{item.booking?.number_of_people ?? "-"}</TableCell>
                    <TableCell className="p-2 text-center">{item.attendance_type}</TableCell>
                    <TableCell className="p-2 text-center">
                      {new Date(item.check_in_time).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {isExpanded && bookingId !== undefined && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-gray-50">
                        {loadingParticipants && !participantsCache[bookingId] ? (
                          <p className="text-sm text-gray-500 py-2">Loading friends...</p>
                        ) : friends.length === 0 ? (
                          <p className="text-sm text-gray-500 py-2">No friends on this booking.</p>
                        ) : (
                          <div className="py-2 space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Friends</p>
                            {friends.map((f) => (
                              <p key={f.id} className="text-sm">
                                {f.name?.charAt(0).toLocaleUpperCase()}
                                {f.name?.slice(1)} - {f.student_id.toUpperCase()} - {f.faculty.toUpperCase()}
                              </p>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
              Tiada rekod tempahan.
            </div>
          ) : (
            filteredRecords.map((item, index) => {
              const bookingId = item.booking?.id;
              const isExpanded = bookingId !== undefined && expandedBookingId === bookingId;
              const friends =
                bookingId !== undefined
                  ? (participantsCache[bookingId] ?? []).filter((p) => !p.is_owner)
                  : [];

              return (
                <div key={item.id} className="rounded-lg border bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => bookingId !== undefined && toggleFriends(bookingId)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">#{(page - 1) * pageSize + index + 1}</p>
                        <p className="truncate font-semibold text-gray-900">{item.student.name}</p>
                        <p className="text-sm text-gray-500">{item.student.student_id}</p>
                      </div>
                      {bookingId !== undefined && (
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Fakulti</p>
                        <p className="font-medium text-gray-800">{item.student.faculty || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Dapur</p>
                        <p className="font-medium text-gray-800">{item.kitchen?.name ?? activeTab}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tarikh</p>
                        <p className="font-medium text-gray-800">{item.booking?.slot.date ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Slot</p>
                        <p className="font-medium text-gray-800">
                          {item.booking ? `${item.booking.slot.start_time} - ${item.booking.slot.end_time}` : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Jumlah Pelajar</p>
                        <p className="font-medium text-gray-800">{item.booking?.number_of_people ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Jenis</p>
                        <p className="font-medium text-gray-800">{item.attendance_type}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400">Check In</p>
                        <p className="font-medium text-gray-800">
                          {new Date(item.check_in_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && bookingId !== undefined && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      {loadingParticipants && !participantsCache[bookingId] ? (
                        <p className="text-sm text-gray-500">Loading friends...</p>
                      ) : friends.length === 0 ? (
                        <p className="text-sm text-gray-500">No friends on this booking.</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-gray-500">Friends</p>
                          {friends.map((f) => (
                            <p key={f.id} className="text-sm text-gray-700">
                              {f.name?.charAt(0).toLocaleUpperCase()}
                              {f.name?.slice(1)} - {f.student_id.toUpperCase()} - {f.faculty.toUpperCase()}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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