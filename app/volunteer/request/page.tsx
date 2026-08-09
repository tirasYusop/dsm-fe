"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import RoleGuard from "@/components/auth/roleguard";
import RequestFormDrawer from "@/components/inventory/requestdrawer";
import type {RequestItem} from "@/types/kitchen"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function getBadgeStyle(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "pending":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    case "rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "cancelled":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    default:
      return "";
  }
}

export default function RequestListPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const name = (req.item_name ?? req.new_item_name ?? "").toLowerCase();
      const matchesSearch = name.includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get("/requests/");
      setRequests(res.data.results ?? res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const cancelRequest = async (id: number) => {
    try {
      await API.post(`/requests/${id}/cancel/`);
      fetchRequests();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteRequest = async (id: number) => {
    try {
      await API.delete(`/requests/${id}/`);
      fetchRequests();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <RoleGuard allowedRoles={["volunteer"]}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">Request History</h1>
            <p className="text-sm text-gray-500">Manage your ingredient requests</p>
          </div>
          <Button onClick={() => setDrawerOpen(true)} className="shrink-0">
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* FILTERS */}
        <div className="space-y-2 sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <input
            type="text"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-xs"
          />

          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500">No requests found</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-500">No requests match this filter</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req, index) => (
                    <TableRow key={req.id}>
                      <TableCell className="text-gray-400">{index + 1}</TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {req.item_name ?? req.new_item_name}
                      </TableCell>
                      <TableCell className="text-center">{req.quantity}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-gray-600">
                        {req.reason}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-500">
                        {formatDate(req.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getBadgeStyle(req.status)}>
                          {req.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {req.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelRequest(req.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRequest(req.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="space-y-3 sm:hidden">
              {filteredRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-base font-semibold">
                        {req.item_name ?? req.new_item_name}
                      </p>
                      <Badge className={`shrink-0 ${getBadgeStyle(req.status)}`}>
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Reason: {req.reason}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Qty: <span className="font-medium text-gray-700">{req.quantity}</span>
                        </span>
                        <span className="text-gray-400">{formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                      {req.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => cancelRequest(req.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => deleteRequest(req.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <RequestFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDone={() => {
          setDrawerOpen(false);
          fetchRequests();
        }}
      />
    </RoleGuard>
  );
}