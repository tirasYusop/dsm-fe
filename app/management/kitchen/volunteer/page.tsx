"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableRow, TableCell } from "@/components/ui/table";
import { UserPlus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Kitchen, VolunteerProfile } from "@/types/kitchen";

const COLUMNS = [
  { key: "bil", label: "Bil" },
  { key: "name", label: "Nama" },
  { key: "matrik", label: "Matrik no" },
  { key: "phone", label: "Phone" },
  { key: "faculty", label: "Fakulti" },
  { key: "kolej", label: "Kolej" },
  { key: "actions", label: "Tindakan", align: "right" as const },
];


export default function ManagementVolunteersPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVolunteers, setTotalVolunteers] = useState(0);

  // Add volunteer form
  const [name, setName] = useState("");
  const [matrikNo, setMatrikNo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faculty, setFaculty] = useState("");
  const [kolej, setKolej] = useState("");
  const [saving, setSaving] = useState(false);

  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  // Fetch kitchens
  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");

      const kitchenData = Array.isArray(res.data)
        ? res.data
        : res.data.results;

      setKitchens(kitchenData);

      if (kitchenData.length > 0) {
        setSelectedKitchen(String(kitchenData[0].id));
      }
    } catch (err) {
      console.log(err);
    }
};

  const fetchVolunteers = async (
  kitchenId:string,
  currentPage=1
)=>{

setLoading(true);

try{

const res = await API.get(
    `/volunteer-profiles/?kitchen=${kitchenId}&page=${currentPage}`
    );
    setPageSize(res.data.page_size);


    setVolunteers(
      res.data.results
    );


    setTotalVolunteers(
      res.data.count
    );


    setNextPage(
      res.data.next
    );


    setPreviousPage(
      res.data.previous
    );


    }catch(err){

    console.log(err);

    }
    finally{

    setLoading(false);

    }

    };

  // Initial kitchen fetch
  useEffect(() => {
    fetchKitchens();
  }, []);

  // Fetch volunteers whenever kitchen or page changes
  useEffect(() => {
    if (selectedKitchen) {
      fetchVolunteers(selectedKitchen, page);
    }
  }, [selectedKitchen, page]);

  // Add volunteer
  const handleAdd = async () => {
    if (!name.trim()) {
      alert("Sila masukkan nama");
      return;
    }

    if (!selectedKitchen) {
      alert("Sila pilih dapur");
      return;
    }

    setSaving(true);

    try {
      await API.post("/volunteer-profiles/", {
        name,
        matrik_no: matrikNo,
        phone_number: phoneNumber,
        faculty,
        kolej,
        kitchen: selectedKitchen,
      });

      // Clear form
      setName("");
      setMatrikNo("");
      setPhoneNumber("");
      setFaculty("");
      setKolej("");

      // Refresh current page
      fetchVolunteers(selectedKitchen, page);
    } catch (err: any) {
      alert(
        err?.response?.data?.error ??
          "Failed to add volunteer"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete volunteer
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Keluarkan sukarelawan ini daripada senarai?"
      )
    ) {
      return;
    }

    try {
      await API.delete(`/volunteer-profiles/${id}/`);

      // If deleting the last item on the current page,
      // move back one page when necessary.
      if (volunteers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchVolunteers(selectedKitchen, page);
      }
    } catch (err: any) {
      alert(
        err?.response?.data?.error ??
          "Failed to remove volunteer"
      );
    }
  };

  // Change kitchen
  const handleKitchenChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedKitchen(e.target.value);

    // Always start from page 1 for a new kitchen
    setPage(1);
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-5">
        <PageHeader
          title="Pengurusan Sukarelawan" subtitle="Urus senarai sukarelawan mengikut dapur."
        />

        {/* Kitchen selection */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Dapur
          </label>

          <select
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-fit"
            value={selectedKitchen}
            onChange={handleKitchenChange}
          >
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add volunteer */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <UserPlus className="h-4 w-4 text-gray-400" />
              Tambah Sukarelawan
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Matrik no"
                value={matrikNo}
                onChange={(e) => setMatrikNo(e.target.value)}
              />

              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="No Telefon"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value)
                }
              />

              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Fakulti"
                value={faculty}
                onChange={(e) =>
                  setFaculty(e.target.value)
                }
              />

              <input
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Kolej"
                value={kolej}
                onChange={(e) =>
                  setKolej(e.target.value)
                }
              />
            </div>

            <Button
              className="mt-3 w-full sm:w-auto"
              onClick={handleAdd}
              disabled={saving}
            >
              {saving ? "Adding..." : "Add to roster"}
            </Button>
          </CardContent>
        </Card>

        {/* Volunteer table */}
        <DataTable
          columns={COLUMNS}
          data={volunteers}
          loading={loading}
          emptyMessage="Tiada sukarelawan yang mendaftar untuk dapur ini lagi."
          renderRow={(v, index) => (
            <TableRow key={v.id} className="border-t">
              <TableCell className="w-10 p-2">
                {(page - 1) * pageSize + index + 1}
              </TableCell>

              <TableCell className="p-2 font-medium">
                {v.name}
              </TableCell>

              <TableCell className="p-2">
                {v.matrik_no || "—"}
              </TableCell>

              <TableCell className="p-2">
                {v.phone_number || "—"}
              </TableCell>

              <TableCell className="p-2">
                {v.faculty || "—"}
              </TableCell>

              <TableCell className="p-2">
                {v.kolej || "—"}
              </TableCell>

              <TableCell className="p-2 text-right">
                <button
                  onClick={() => handleDelete(v.id)}
                  aria-label={`Remove ${v.name}`}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          )}
        />

        {/* Pagination */}
        {totalVolunteers > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {(page - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-700">
                {Math.min(page * pageSize, totalVolunteers)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {totalVolunteers}
              </span>{" "}
              volunteers
            </div>

            <div className="flex items-center gap-2">
             <Button
                variant="outline"
                size="sm"
                disabled={!previousPage || loading}
                onClick={() =>
                  setPage(prev => prev - 1)
                }
                >
                <ChevronLeft className="mr-1 h-4 w-4"/>
                Previous
                </Button>

              <span className="min-w-[100px] text-center text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <Button
              variant="outline"
              size="sm"
              disabled={!nextPage || loading}
              onClick={() =>
                setPage(prev => prev + 1)
              }
              >
              <ChevronRight className="ml-1 h-4 w-4"/>
              Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}