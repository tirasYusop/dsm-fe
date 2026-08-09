"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, MessageSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import API from "@/lib/api1";
import RoleGuard from "@/components/auth/roleguard";
import PageHeader from "@/components/ui/page-header";

interface FeedbackItem {
  id: number;
  student_name: string;
  kitchen: number | null;
  kitchen_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

interface Kitchen {
  id: number;
  name: string;
}

interface FeedbackSummary {
  average_rating: number;
  total_feedback: number;
  rating_breakdown: Record<number, number>;
}
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FeedbackManagementPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [summary, setSummary] = useState<FeedbackSummary>({
    average_rating: 0,
    total_feedback: 0,
    rating_breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(1);

  useEffect(() => {
    async function fetchKitchens() {
      try {
        const res = await API.get("/kitchens/");
        setKitchens(res.data.results ?? res.data);
      } catch {
      }
    }
    fetchKitchens();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedKitchen, selectedRating]);

  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true);
      setError(false);
      try {
        const params: Record<string, string | number> = { page };
        if (selectedKitchen) params.kitchen = selectedKitchen;
        if (selectedRating) params.rating = selectedRating;

        const res = await API.get("/feedback/", { params });
        const results = res.data.results ?? res.data;
        setFeedback(results);

        const count = res.data.count ?? results.length ?? 0;
        const size = res.data.page_size ?? results.length ?? 1;
        setPageSize(size);
        setTotalPages(Math.max(1, Math.ceil(count / size)));
      } catch {
        setError(true);
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [page, selectedKitchen, selectedRating]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const params: Record<string, string> = {};
        if (selectedKitchen) params.kitchen = selectedKitchen;

        const res = await API.get("/feedback/summary/", { params });
        setSummary({
          average_rating: Number(res.data.average_rating) || 0,
          total_feedback: Number(res.data.total_feedback) || 0,
          rating_breakdown: res.data.rating_breakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } catch {
        // leave summary at previous values
      }
    }
    fetchSummary();
  }, [selectedKitchen]);

  const hasActiveFilters = !!selectedKitchen || !!selectedRating;

  const clearFilters = () => {
    setSelectedKitchen("");
    setSelectedRating("");
  };

  return (
    <RoleGuard allowedRoles={["management"]}>
      <div className="space-y-6">
        <PageHeader
          title="Maklum Balas Pengguna"
          subtitle="Semua maklum balas yang diterima daripada pelajar mengenai Dapur Siswa."
        />

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white">
                <Star className="h-6 w-6" fill="white" fillOpacity={0.3} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Penilaian Purata
                </p>
                <p className="text-2xl font-bold">{summary.average_rating.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Jumlah Maklum Balas
                </p>
                <p className="text-2xl font-bold">{summary.total_feedback}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-emerald-600 text-white">
                <Star className="h-6 w-6" fill="white" fillOpacity={0.3} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Penilaian 5 Bintang
                </p>
                <p className="text-2xl font-bold">{summary.rating_breakdown[5] ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters — same input styling pattern as HistoryPage */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <select
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Semua Dapur</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Semua Penilaian</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Bintang
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 underline hover:text-gray-700"
                type="button"
              >
                Kosongkan penapis
              </button>
            )}
          </div>
        </div>

        {/* Feedback list */}
        <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Senarai Maklum Balas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <p className="text-center text-sm text-muted-foreground">
                Tidak dapat memuatkan maklum balas.
              </p>
            ) : feedback.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Tiada maklum balas ditemui.
              </p>
            ) : (
              <div className="space-y-4">
                {feedback.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{f.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.kitchen_name || "Umum"} · {formatDate(f.created_at)}
                        </p>
                      </div>
                      <StarRow rating={f.rating} />
                    </div>
                    {f.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination controls — same pattern as HistoryPage / InventoryPage */}
        <div className="flex items-center justify-center gap-4 border-t pt-4">
          <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages || loading} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </RoleGuard>
  );
}