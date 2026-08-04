"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { UserPlus, Trash2, Users } from "lucide-react";
import type {Kitchen,VolunteerProfile} from "@/types/kitchen"

export default function ManagementVolunteersPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [matrikNo, setMatrikNo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faculty, setFaculty] = useState("");
  const [kolej, setKolej] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      setKitchens(res.data);
      if (res.data.length > 0) setSelectedKitchen(String(res.data[0].id));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchVolunteers = async (kitchenId: string) => {
    setLoading(true);
    try {
      const res = await API.get(`/volunteer-profiles/?kitchen=${kitchenId}`);
      setVolunteers(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    if (selectedKitchen) fetchVolunteers(selectedKitchen);
  }, [selectedKitchen]);

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
      setName("");
      setMatrikNo("");
      setPhoneNumber("");
      setFaculty("");
      setKolej("");
      fetchVolunteers(selectedKitchen);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.error ?? "Failed to add volunteer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Keluarkan sukarelawan ini daripada senarai?")) return;
    try {
      await API.delete(`/volunteer-profiles/${id}/`);
      fetchVolunteers(selectedKitchen);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.error ?? "Failed to remove volunteer");
    }
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="mx-auto space-y-5 p-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Jadual Bertugas sukarelawan</h1>
          <p className="text-sm text-gray-500">
            Daftarkan sukarelawan di sini, mereka akan memilih nama masing-masing untuk merekod waktu masuk/keluar di halaman sukarelawan.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Dapur</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none sm:max-w-fit"
            value={selectedKitchen}
            onChange={(e) => setSelectedKitchen(e.target.value)}
          >
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

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
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Matrik no"
                value={matrikNo}
                onChange={(e) => setMatrikNo(e.target.value)}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="No Telefon"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Fakulti"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Kolej"
                value={kolej}
                onChange={(e) => setKolej(e.target.value)}
              />
            </div>
            <Button className="mt-3 w-full sm:w-auto" onClick={handleAdd} disabled={saving}>
              {saving ? "Adding..." : "Add to roster"}
            </Button>
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded-lg border bg-white">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2 text-left font-bold">Nama</TableHead>
                <TableHead className="p-2 text-left font-bold">Matrik no</TableHead>
                <TableHead className="p-2 text-left font-bold">Phone</TableHead>
                <TableHead className="p-2 text-left font-bold">Fakulti</TableHead>
                <TableHead className="p-2 text-left font-bold">Kolej</TableHead>
                <TableHead className="p-2 text-right font-bold">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>Loading...</TableCell>
                </TableRow>
              ) : volunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-6 w-6 text-gray-300" />
                      Tiada sukarelawan yang mendaftar untuk dapur ini lagi.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                volunteers.map((v) => (
                  <TableRow key={v.id} className="border-t">
                    <TableCell className="p-2 font-medium">{v.name}</TableCell>
                    <TableCell className="p-2">{v.matrik_no || "—"}</TableCell>
                    <TableCell className="p-2">{v.phone_number || "—"}</TableCell>
                    <TableCell className="p-2">{v.faculty || "—"}</TableCell>
                    <TableCell className="p-2">{v.kolej || "—"}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleGuard>
  );
}