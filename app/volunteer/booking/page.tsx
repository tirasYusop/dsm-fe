"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import RoleGuard from "@/components/auth/roleguard";
import { ChevronDown, Users } from "lucide-react";

type Participant = {
  id: number;
  name: string;
  student_id: string;
  faculty: string;
  is_owner: boolean;
};

type Booking = {
  id: number;
  student: number;
  student_name: string;
  slot: number;
  slot_detail: {
    id: number;
    kitchen: number;
    kitchen_name: string;
    date: string;
    start_time: string;
    end_time: string;
    max_capacity: number;
    current_booking: number;
    available_capacity: number;
    status: string;
  };
  slot_date: string;
  start_time: string;
  end_time: string;
  kitchen_name: string;
  number_of_people: number;
  purpose: string;
  status: string;
  attended: boolean;
  created_at: string;
  participants: Participant[];
  is_passed: boolean;
  display_status: string;
};

function todayISO() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  attended: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  expired: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

export default function VolunteerKitchenRosterPage() {
  const [date, setDate] = useState(todayISO());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRoster(date);
  }, [date]);

  const fetchRoster = async (forDate: string) => {
    setLoading(true);
    setError(null);
    try {
      // No `kitchen` param here on purpose -- a volunteer's kitchen comes
      // from their own account (request.user.kitchen) on the backend, not
      // from anything the client sends.
      const res = await API.get("/kitchen-bookings/roster/", {
        params: { date: forDate },
      });
      setBookings(res.data);
    } catch (err: any) {
      console.error("Failed to load kitchen roster", err);
      setError(
        err?.response?.data?.error ?? "Failed to load roster. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (bookingId: number) => {
    setExpandedBookingId((prev) => (prev === bookingId ? null : bookingId));
  };

  // slot -> bookings (single kitchen, so no kitchen-level grouping needed)
  const slotGroups = useMemo(() => {
    const bySlot: Record<string, { slot: Booking["slot_detail"]; bookings: Booking[] }> = {};

    for (const b of bookings) {
      const slotId = b.slot_detail.id.toString();
      if (!bySlot[slotId]) {
        bySlot[slotId] = { slot: b.slot_detail, bookings: [] };
      }
      bySlot[slotId].bookings.push(b);
    }

    return Object.values(bySlot).sort((a, b) =>
      a.slot.start_time.localeCompare(b.slot.start_time)
    );
  }, [bookings]);

  const kitchenName = bookings[0]?.kitchen_name;

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between md:flex-row ">
          <h1 className="text-xl font-bold sm:text-2xl">
            Students Booking
          </h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border mt-10 border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        {loading && <div className="text-sm text-gray-500">Loading...</div>}

        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && slotGroups.length === 0 && (
          <p className="text-sm text-gray-500">No bookings for this date.</p>
        )}

        {!loading &&
          !error &&
          slotGroups.map(({ slot, bookings: slotBookings }) => {
            const totalPeople = slotBookings.reduce(
              (sum, b) => sum + b.number_of_people,
              0
            );

            return (
              <div key={slot.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {/* Slot header -- same on every screen size */}
                <div className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-gray-900">
                    {slot.start_time} - {slot.end_time}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                    <Users className="h-3.5 w-3.5" />
                    {totalPeople} people · {slotBookings.length} booking
                    {slotBookings.length !== 1 ? "s" : ""} · {slot.current_booking}/
                    {slot.max_capacity} capacity
                  </span>
                </div>

                {/* Desktop / tablet: table */}
                <div className="hidden sm:block">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold w-10">No.</TableHead>
                        <TableHead className="font-bold">Booked By</TableHead>
                        <TableHead className="font-bold">Student ID</TableHead>
                        <TableHead className="font-bold text-center">Faculty</TableHead>
                        <TableHead className="font-bold text-center">People</TableHead>
                        <TableHead className="font-bold">Purpose</TableHead>
                        <TableHead className="font-bold text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slotBookings.map((b, index) => {
                        const owner = b.participants.find((p) => p.is_owner);
                        const friends = b.participants.filter((p) => !p.is_owner);
                        const isExpanded = expandedBookingId === b.id;

                        return (
                          <Fragment key={b.id}>
                            <TableRow
                              onClick={() => toggleExpand(b.id)}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              <TableCell className="border-r p-2">{index + 1}</TableCell>
                              <TableCell className="border-r p-2">
                                {owner?.name ?? b.student_name}
                              </TableCell>
                              <TableCell className="border-r p-2">
                                {owner?.student_id ?? "-"}
                              </TableCell>
                              <TableCell className="text-center border-r p-2">
                                {owner?.faculty ?? "-"}
                              </TableCell>
                              <TableCell className="text-center border-r p-2">
                                {b.number_of_people}
                              </TableCell>
                              <TableCell className="border-r p-2">{b.purpose || "-"}</TableCell>
                              <TableCell className="text-center border-r p-2 capitalize">
                                {b.display_status}
                              </TableCell>
                            </TableRow>

                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-gray-50">
                                  {friends.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-2">
                                      No one else on this booking.
                                    </p>
                                  ) : (
                                    <div className="py-2 space-y-1">
                                      <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Coming with
                                      </p>
                                      {friends.map((f) => (
                                        <p key={f.id} className="text-sm">
                                          {f.name} - {f.student_id.toUpperCase()} -{" "}
                                          {f.faculty.toUpperCase()}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile: stacked cards, one per booking */}
                <div className="divide-y divide-gray-100 sm:hidden">
                  {slotBookings.map((b, index) => {
                    const owner = b.participants.find((p) => p.is_owner);
                    const friends = b.participants.filter((p) => !p.is_owner);
                    const isExpanded = expandedBookingId === b.id;
                    const badgeClass =
                      STATUS_BADGE[b.display_status] ??
                      "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200";

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleExpand(b.id)}
                        className="flex w-full flex-col gap-2 px-4 py-3 text-left active:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {index + 1}. {owner?.name ?? b.student_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {owner?.student_id ?? "-"} · {owner?.faculty ?? "-"}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badgeClass}`}
                          >
                            {b.display_status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {b.number_of_people} people
                            {friends.length > 0 && ` (+${friends.length})`}
                          </span>
                          {b.purpose && (
                            <span className="truncate text-gray-500">{b.purpose}</span>
                          )}
                        </div>

                        {friends.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                            {isExpanded ? "Hide" : "Show"} who's coming with them
                          </div>
                        )}

                        {isExpanded && friends.length > 0 && (
                          <div className="mt-1 space-y-1 rounded-lg bg-gray-50 p-2">
                            {friends.map((f) => (
                              <p key={f.id} className="text-xs text-gray-700">
                                {f.name} - {f.student_id.toUpperCase()} -{" "}
                                {f.faculty.toUpperCase()}
                              </p>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </RoleGuard>
  );
}