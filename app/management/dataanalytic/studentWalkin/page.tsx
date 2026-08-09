"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import { TableRow, TableCell } from "@/components/ui/table";
import DataTable from "@/components/table";
import PageHeader from "@/components/ui/page-header";
import SectionHeading from "@/components/ui/section-heading";
import RoleGuard from "@/components/auth/roleguard";
import type { Attendance, StudentActivity } from "@/types/attandance";

const COLUMNS = [
  { key: "no", label: "Bil.", className: "w-10" },
  { key: "id", label: "ID Pelajar" },
  { key: "name", label: "Nama" },
  { key: "faculty", label: "Fakulti", align: "center" as const },
  { key: "checkin", label: "Waktu Check In", align: "center" as const },
  { key: "activity", label: "Aktiviti" },
];

export default function StudentWalkinPage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [activities, setActivities] = useState<Record<number, StudentActivity>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalkin();
    fetchActivities();
  }, []);

  const fetchWalkin = async () => {
    try {
      const res = await API.get("/attendance/management/walk-in/");
      setRecords(res.data);
    } catch (error) {
      console.error("Failed load walk in", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await API.get("/attendance/activity/list/");
      const map: Record<number, StudentActivity> = {};
      res.data.forEach((activity: StudentActivity) => {
        map[activity.attendance] = activity;
      });
      setActivities(map);
    } catch (error) {
      console.error("Failed load activities", error);
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
        <PageHeader title="Kehadiran Pelajar (Walk In)" />

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
      </div>
    </RoleGuard>
  );
}