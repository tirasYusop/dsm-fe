"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/lib/api1";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UtensilsCrossed, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      const res = await API.post("users/login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "management") {
        router.push("/management/dashboard");
      } else if (res.data.user.role === "volunteer") {
        router.push("/volunteer/dashboard");
      } else if (res.data.user.role === "student") {
        router.push("/student/dashboard");
      } else {
        setError("Unknown role — please contact an administrator.");
      }
    } catch (err: any) {
      console.log(err);
      const message =
        err?.response?.data?.detail ?? "Log masuk gagal. Sila cuba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ backgroundColor: "#001951" }}>
      {/* Ambient glow background, matching hero */}
      <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-300/20 blur-[120px]" />

      {/* Back to home link */}
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <Card className="relative w-full max-w-sm border-0 bg-white/95 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-xl">Dapur Siswa Madani @ UMS</CardTitle>
          <CardDescription>Log masuk untuk teruskan</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                className="rounded-lg border border-gray-300 p-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Kata Laluan
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-300 p-2.5 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                  placeholder="Masukkan kata laluan"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan kata laluan" : "Papar kata laluan"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="mt-2 rounded-lg bg-[#001951] text-white hover:bg-[#001951]/90"
            >
              {loading ? "Sedang log masuk..." : "Log Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}