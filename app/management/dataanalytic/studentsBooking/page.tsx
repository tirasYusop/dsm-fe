"use client";

import { Fragment, useEffect, useState } from "react";
import API from "@/lib/api1";
import {Table,TableHeader,TableHead,TableRow,TableCell,TableBody} from "@/components/ui/table";
import RoleGuard from "@/components/auth/roleguard";
import type {Attendance, Participant} from "@/types/attandance"

export default function StudentBookingPage(){
  const [records,setRecords] =useState<Attendance[]>([]);
  const [loading,setLoading] =useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [participantsCache, setParticipantsCache] = useState<Record<number, Participant[]>>({});
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(()=>{fetchBooking(); },[]);

  const fetchBooking = async()=>{
    try{
      const res = await API.get("/attendance/management/booking/");
      setRecords(res.data);
    }catch(error){
      console.error("Failed load booking attendance",error);
    }finally{
      setLoading(false);
    }
  };

  const toggleFriends = async (bookingId: number) => {if (expandedBookingId === bookingId) {setExpandedBookingId(null);return;}
    setExpandedBookingId(bookingId);
    if (participantsCache[bookingId]) {return;}

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

  const groupedKitchen =
    records.reduce(
      (
        acc:Record<string,Attendance[]>,
        item
      )=>{
        const kitchenId =
          item.kitchen?.id?.toString()
          ??
          "unknown";
        if(!acc[kitchenId]){
          acc[kitchenId] = [];
        }
        acc[kitchenId].push(item);
        return acc;
      },
      {}
    );

  if(loading){
    return (
      <div>Loading...</div>
    );
  }

  return (
    <RoleGuard allowedRoles={["management" ]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Kehadiran Pelajar (Tempahan)</h1>
        {
          Object.keys(groupedKitchen).map((kitchenId)=>{
              const kitchenRecords =groupedKitchen[kitchenId];
              const kitchen =kitchenRecords[0].kitchen;

              return (
                <div key={kitchenId} className="space-y-3">
                  <h2 className="text-xl font-bold">{kitchen?.name}</h2>
                  <div className="border rounded bg-white overflow-hidden">
                    <Table
                      className="w-full"
                    >
                      <TableHeader
                        className="bg-gray-100"
                      >
                        <TableRow>
                          <TableHead className="font-bold w-10">No.</TableHead>
                          <TableHead className="font-bold">ID Pelajar</TableHead>
                          <TableHead className="font-bold">Nama</TableHead>
                          <TableHead className="font-bold text-center">Fakulti</TableHead>
                          <TableHead className="font-bold text-center">Tarikh</TableHead>
                          <TableHead className="font-bold text-center">Slot</TableHead>
                          <TableHead className="font-bold text-center">Jumlah Pelajar</TableHead>
                          <TableHead className="font-bold text-center">Jenis</TableHead>
                          <TableHead className="font-bold text-center">Check In</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {
                        kitchenRecords.map((item,index)=>{
                            const bookingId = item.booking?.id;
                            const isExpanded = bookingId !== undefined && expandedBookingId === bookingId;
                            const friends = bookingId !== undefined
                              ? (participantsCache[bookingId] ?? []).filter((p) => !p.is_owner)
                              : [];
                            return (
                            <Fragment key={item.id}>
                            <TableRow
                              onClick={() => {
                                if (bookingId !== undefined) {
                                  toggleFriends(bookingId);
                                }
                              }}
                              className={
                                bookingId !== undefined
                                  ? "cursor-pointer hover:bg-gray-50"
                                  : ""
                              }
                            >
                              <TableCell className="border-r p-2">{index + 1}</TableCell>
                              <TableCell className="border-r p-2">{item.student.student_id}</TableCell>
                              <TableCell className="border-r p-2">{item.student.name}</TableCell>
                              <TableCell className="text-center border-r p-2">{item.student.faculty}</TableCell>
                              <TableCell className="text-center border-r p-2">{item.booking?.slot.date}</TableCell>
                              <TableCell className="text-center border-r p-2">{item.booking?.slot.start_time}{" - "}{item.booking?.slot.end_time}</TableCell>
                              <TableCell className="text-center border-r p-2">{item.booking?.number_of_people??"-"}</TableCell>
                              <TableCell className="text-center border-r p-2">{item.attendance_type } </TableCell>
                              <TableCell className="text-center border-r p-2">{new Date( item.check_in_time).toLocaleString()}</TableCell>
                            </TableRow>

                            {isExpanded && bookingId !== undefined && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-gray-50">
                                  {loadingParticipants && !participantsCache[bookingId] ? (
                                    <p className="text-sm text-gray-500 py-2"> Loading friends...</p>
                                  ) : friends.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-2">No friends on this booking.</p>
                                  ) : (
                                    <div className="py-2 space-y-1">
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Friends</p>
                                      {friends.map((f) => (
                                        <p key={f.id} className="text-sm">
                                          {f.name?.charAt(0).toLocaleUpperCase()}{f.name?.slice(1)} - {f.student_id.toUpperCase()} - {f.faculty.toUpperCase()}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                            </Fragment>
                            );
                          }
                        )
                      }
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            }
          )
        }
      </div>
    </RoleGuard>
  );
}