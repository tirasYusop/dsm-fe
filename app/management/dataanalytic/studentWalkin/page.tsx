"use client";

import { useEffect, useState } from "react";

import API from "@/lib/api1";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell
} from "@/components/ui/table";
import RoleGuard from "@/components/auth/roleguard";

type Student = {
  student_id: string;
  name: string;
  faculty: string;
};

type Kitchen = {
  id: number;
  name: string;
  code: string;
};

type Attendance = {
  id: number;
  student: Student;
  kitchen?: Kitchen;
  attendance_type: string;
  check_in_time: string;
};

type FoodbankTakenItem = {
  id: number;
  item: number;
  item_name: string;
  quantity: number;
};

type StudentActivity = {
  id: number;
  attendance: number;
  took_rice: boolean;
  took_dish: boolean;
  took_foodbank: boolean;
  used_kitchen: boolean;
  foodbank_items: FoodbankTakenItem[];
};

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
    if (!acc[kitchenId]) {
      acc[kitchenId] = [];
    }
    acc[kitchenId].push(item);
    return acc;
  }, {});

  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold"> Student Walk-In Attendance</h1>
        {Object.keys(groupedKitchen).map((kitchenId) => {
          const kitchenRecords = groupedKitchen[kitchenId];
          const kitchen = kitchenRecords[0].kitchen;
          return (
            <div key={kitchenId} className="space-y-3">
              <h2 className="text-xl font-bold">{kitchen?.name}</h2>
              <div className="border rounded bg-white overflow-hidden ">
                <Table className="w-full">
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-bold w-10">No.</TableHead>
                      <TableHead className="font-bold">Student ID</TableHead>
                      <TableHead className="font-bold">Name </TableHead>
                      <TableHead className="font-bold text-center">Faculty</TableHead>
                      <TableHead className="font-bold text-center"> Check In Time </TableHead>
                      <TableHead className="font-bold text-center">Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kitchenRecords.map((item,index) => {
                      const activity = activities[item.id];
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="border-r p-2">{index+1}</TableCell>
                          <TableCell className="border-r p-2">{item.student.student_id}</TableCell>
                          <TableCell className="border-r p-2">{item.student.name} </TableCell>
                          <TableCell className="border-r text-center">{item.student.faculty} </TableCell>
                          <TableCell className="border-r text-center">
                            {new Date(item.check_in_time).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-left p-2">
                            {!activity ? (
                              <span className="text-xs text-muted-foreground">
                                Not recorded
                              </span>
                            ) : (
                              <ul className="text-xs space-y-0.5">
                                {activity.took_rice && <li>Took rice</li>}
                                {activity.took_dish && <li>Took dish</li>}
                                {activity.used_kitchen && <li>Used kitchen</li>}
                                {activity.took_foodbank && (
                                  <li>
                                    Foodbank:{" "}
                                    {activity.foodbank_items
                                      .map((f) => `${f.item_name} x${f.quantity}`)
                                      .join(", ")}
                                  </li>
                                )}
                                {!activity.took_rice &&
                                  !activity.took_dish &&
                                  !activity.used_kitchen &&
                                  !activity.took_foodbank && (
                                    <li className="text-muted-foreground">No activity ticked</li>
                                  )}
                              </ul>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </RoleGuard>
  );
}