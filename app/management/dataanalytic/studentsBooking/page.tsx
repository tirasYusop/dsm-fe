"use client";

import { Fragment, useEffect, useState } from "react";
import API from "@/lib/api1";
import { TableRow, TableCell } from "@/components/ui/table";
import DataTable from "@/components/table";
import PageHeader from "@/components/ui/page-header";
import SectionHeading from "@/components/ui/section-heading";
import RoleGuard from "@/components/auth/roleguard";
import type { Attendance, Participant } from "@/types/attandance";

const COLUMNS = [
  { key: "no", label: "No.", className: "w-10" },
  { key: "id", label: "ID Pelajar" },
  { key: "name", label: "Nama" },
  { key: "faculty", label: "Fakulti", align: "center" as const },
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

  useEffect(() => { fetchBooking(); }, []);

  const fetchBooking = async () => {
    try {
      const res = await API.get("/attendance/management/booking/");
      setRecords(res.data);
    } catch (error) {
      console.error("Failed load booking attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriends = async (bookingId: number) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
      return;
    }
    setExpandedBookingId(bookingId);
    if (participantsCache[bookingId]) return;

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

  const groupedKitchen = records.reduce((acc: Record<string, Attendance[]>, item) => {
    const kitchenId = item.kitchen?.id?.toString() ?? "unknown";
    if (!acc[kitchenId]) acc[kitchenId] = [];
    acc[kitchenId].push(item);
    return acc;
  }, {});

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader title="Kehadiran Pelajar (Tempahan)" />

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
                        <TableCell className="p-2 border-r">{index + 1}</TableCell>
                        <TableCell className="p-2 border-r">{item.student.student_id}</TableCell>
                        <TableCell className="p-2 border-r">{item.student.name}</TableCell>
                        <TableCell className="p-2 border-r text-center">{item.student.faculty}</TableCell>
                        <TableCell className="p-2 border-r text-center">{item.booking?.slot.date}</TableCell>
                        <TableCell className="p-2 border-r text-center">
                          {item.booking?.slot.start_time} - {item.booking?.slot.end_time}
                        </TableCell>
                        <TableCell className="p-2 border-r text-center">{item.booking?.number_of_people ?? "-"}</TableCell>
                        <TableCell className="p-2 border-r text-center">{item.attendance_type}</TableCell>
                        <TableCell className="p-2 border-r text-center">
                          {new Date(item.check_in_time).toLocaleString()}
                        </TableCell>
                      </TableRow>

                      {isExpanded && bookingId !== undefined && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-gray-50">
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
          );
        })}
      </div>
    </RoleGuard>
  );
}