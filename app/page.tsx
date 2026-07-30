"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AOSInit from "@/components/landing/aos-init"
//import ParticleBackground from "@/components/landing/particle-bg"
import InventorySummary from "@/components/landing/inventory-summary"
import Image from "next/image"
import { FaFacebook,FaTiktok, FaYoutube ,FaGlobe} from "react-icons/fa"
import PosterCarousel from "@/components/landing/poster-carousel"
import {
  UtensilsCrossed,
  Users,
  ClipboardList,
  QrCode,
  Package,
  CalendarCheck,
  ArrowRight,
  ChefHat,
  Handshake,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Menu,
  X,
} from "lucide-react"

const features = [
  {
    title: "Untuk Pelajar",
    role: "Student",
    description: "Tempah sesi dapur, scan QR untuk kehadiran, dan lihat sejarah aktiviti dengan mudah.",
    icon: Users,
    href: "/student/dashboard",
    gradient: "from-blue-500 to-cyan-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    highlights: [
      { text: "Tempah slot dapur", icon: CalendarCheck },
      { text: "Scan QR kehadiran", icon: QrCode },
      { text: "Sejarah aktiviti", icon: ClipboardList },
    ],
  },
  {
    title: "Untuk Sukarelawan",
    role: "Volunteer",
    description: "Catat penggunaan bahan, buat permintaan stok, dan pantau inventori dalam masa nyata.",
    icon: Handshake,
    href: "/volunteer/dashboard",
    gradient: "from-blue-700 to-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    highlights: [
      { text: "Guna bahan masak", icon: ChefHat },
      { text: "Request stok baharu", icon: Package },
      { text: "Lihat ringkasan", icon: BarChart3 },
    ],
  },
  {
    title: "Untuk Pengurusan",
    role: "Management",
    description: "Urus inventori sepenuhnya, restok dengan bukti foto, dan luluskan permintaan sukarelawan.",
    icon: BarChart3,
    href: "/management/dashboard",
    gradient: "from-blue-500 to-cyan-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    highlights: [
      { text: "Kawal inventori", icon: ShieldCheck },
      { text: "Restok dengan foto", icon: BadgeCheck },
      { text: "Luluskan request", icon: ClipboardList },
    ],
  },
]

const stats = [
  { icon: CalendarCheck, value: "Tempahan", label: "Sesi Dapur", color: "text-blue-500" },
  { icon: QrCode, value: "QR Pintar", label: "Scan & Cepat", color: "text-blue-400" },
  { icon: Package, value: "Inventori", label: "Stok Terkawal", color: "text-blue-600" },
  { icon: Clock, value: "Laporan", label: "Sistematik", color: "text-blue-700" },
]

const navLinks = [
  { href: "#poster", label: "Notis" },
  { href: "#inventori", label: "Inventori" },
  { href: "#features", label: "Features" },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <AOSInit />
      {/*<ParticleBackground />*/}
      {/* ===== HEADER ===== */}
      <header
        className="fixed top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl"
        style={{ backgroundColor: "#001951" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Image src="/DAPUR.png" alt="Dapur Siswa" width={36} height={36} className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
            <span className="font-['Playfair_Display'] text-sm font-semibold text-white sm:text-lg">
              Dapur Siswa Madani
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-white/80 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop-only login button */}
          <Button
            asChild
            size="sm"
            className="hidden rounded-xl bg-white px-6 text-base text-[#001951] hover:bg-white/90 sm:flex sm:h-10"
          >
            <Link href="/login">Log Masuk</Link>
          </Button>

          {/* Mobile menu toggle — only element on the right side on phone */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white sm:hidden"
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown nav — now includes Log Masuk */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 px-4 py-3 sm:hidden" style={{ backgroundColor: "#001951" }}>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                size="sm"
                className="mt-1 w-full rounded-xl bg-white text-[#001951] hover:bg-white/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/login">Log Masuk</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Solid navy background */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: "#001951" }} />
        <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-300/20 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] h-[30%] w-[30%] rounded-full bg-cyan-300/10 blur-[100px]" />

        <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3 sm:gap-6" data-aos="fade-down">
            <Image
              src="/DAPUR.png"
              alt="Logo Dapur Siswa Madani"
              width={96}
              height={96}
              className="h-12 w-12 object-contain sm:h-24 sm:w-24"
              priority
            />
            <Image
              src="/UMS4.png"
              alt="Logo UMS"
              width={90}
              height={90}
              className="h-12 w-12 rounded-full object-contain sm:h-21 sm:w-21"
              priority
            />
            <Image
              src="/PNRF.png"
              alt="Logo PNRF"
              width={96}
              height={96}
              className="h-12 w-12 object-contain sm:h-24 sm:w-24"
              priority
            />
          </div>

          {/* Badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-blue-100 shadow-lg backdrop-blur-xl sm:mb-8 sm:px-5 sm:py-2 sm:text-sm"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            <Sparkles className="h-4 w-4" />
            Sistem Pengurusan Dapur Siswa
          </div>

          {/* Tajuk utama */}
          <div data-aos="fade-up" data-aos-delay="200" className="flex flex-col items-center">
            <h1 className="font-['Playfair_Display'] max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="text-white">Dapur Siswa</span>{" "}
              <span className="relative inline-block bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-sm animate-gradient-x bg-[length:200%_auto]">
                Madani
              </span>
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-blue-300/60 sm:w-8" />
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-blue-200/80 sm:text-sm sm:tracking-[0.3em]">
                @ Universiti Malaysia Sabah
              </p>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-blue-300/60 sm:w-8" />
            </div>
          </div>

          {/* Subtitle */}
          <p
            className="mt-6 max-w-2xl text-base leading-relaxed text-blue-100/70 sm:text-lg md:text-xl"
            data-aos="fade-up"
            data-aos-delay="300"
          />

          {/* CTA Buttons */}
          <div
            className="mt-10 flex w-full flex-col items-center gap-4 px-2 sm:w-auto sm:flex-row sm:px-0"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-2 rounded-xl bg-white px-8 text-base font-semibold text-[#001951] shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:h-13 sm:w-auto sm:px-10"
            >
              <Link href="/login">
                Mulakan Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full gap-2 rounded-xl border-2 border-white/30 bg-transparent px-8 text-white font-medium transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95 sm:h-13 sm:w-auto sm:px-10"
            >
              <Link href="#features">Ketahui Lebih</Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8" data-aos="fade" data-aos-delay="800">
            <div className="flex flex-col items-center gap-2 text-xs text-blue-200/60">
              <span>Scroll</span>
              <div className="flex h-8 w-5 items-start justify-center rounded-full border border-blue-200/30 p-1">
                <div className="h-2 w-1.5 animate-bounce rounded-full bg-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POSTER CAROUSEL ===== */}
      <section id="poster" className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center sm:mb-16" data-aos="fade-up">
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 uppercase dark:from-blue-900/40 dark:to-blue-800/20 dark:text-blue-300">
            Poster
          </span>
          <h2 className="font-['Playfair_Display'] mt-4 text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tatacara Penggunan Dapur
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Ikuti panduan penggunaan dapur dengan betul untuk memastikan kebersihan,
            keselamatan, dan keselesaan bersama sepanjang berada di Dapur Siswa Madani.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0">
            <PosterCarousel
              posters={[
                { id: "1", src: "/rules.jpg", title: "PENGUATKUASAAN PERATURAN DAPUR SISWA" },
                { id: "2", src: "/dapurelektrik.jpg", title: "TATACARA PENGGUNAAN DAPUR ELEKTRONIK" },
                { id: "3", src: "/keselamatan.jpg", title: "PROCEDUR KESELAMATAN" },
                { id: "4", src: "/kebersihan.jpg", title: "PENJAGAAN KEBERSIHAN" },
                { id: "5", src: "/penggunaandapur.jpg", title: "TATACARA PENGGUNAAN DAPUR" },
              ]}
            />
          </div>
          <div className="min-w-0">
            <PosterCarousel
              posters={[
                { id: "6", src: "/pengurusanbahan.jpg", title: "TATACARA PENGURUSAN BAHAN" },
                { id: "7", src: "/peraturanperalatan.jpg", title: "PERATURAN PERALATAN" },
                { id: "8", src: "/petisejuk.jpg", title: "TATACARA PENGGUNAAN PETI SEJUK BEKU" },
                { id: "9", src: "/waktuoperasi.jpg", title: "WAKTU OPERASI" },
                { id: "10", src: "/ketuhar.jpg", title: "TATACARA PENGGUNAAN KETUHAN GELOMBANG MIKRO" },
                { id: "11", src: "/hebahan.jpg", title: "HEBAHAN" },
              ]}
            />
          </div>
        </div>
      </section>

      <section id="inventori" className="relative overflow-hidden px-4 py-1 sm:px-6 sm:py-10">
        <InventorySummary />
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative border-y bg-white/60 backdrop-blur-xl dark:bg-background/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-12 md:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center gap-2 text-center transition-all duration-300 hover:scale-110"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-md shadow-blue-500/5 ring-1 ring-blue-100/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 dark:from-gray-900 dark:to-gray-950 dark:ring-blue-800/30 sm:h-14 sm:w-14">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <span className="font-['Playfair_Display'] text-base font-semibold sm:text-lg">{stat.value}</span>
                <span className="text-[11px] text-muted-foreground sm:text-xs">{stat.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/40 blur-[100px] dark:bg-blue-500/10" />
        <div className="absolute top-1/2 right-0 h-72 w-72 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/30 blur-[100px] dark:bg-blue-500/10" />

        <div className="relative mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-10 text-center sm:mb-16" data-aos="fade-up">
            <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 uppercase dark:from-blue-900/40 dark:to-blue-800/20 dark:text-blue-300">
              Tiga Peranan
            </span>
            <h2 className="font-['Playfair_Display'] mt-4 text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Satu Platform untuk Semua
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Setiap peranan mempunyai antara muka dan alat yang direka khas untuk memudahkan tugasan harian
              di dapur.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={feature.role} data-aos="fade-up" data-aos-delay={i * 150}>
                  <div className="group relative h-full">
                    {/* Hover glow effect */}
                    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 blur-lg transition-all duration-500 group-hover:opacity-20`} />

                    <Card
                      size="sm"
                      className="relative h-full overflow-hidden border-0 bg-white/70 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:shadow-black/10 dark:bg-gray-900/70 dark:shadow-white/5"
                    >
                      {/* Top gradient bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${feature.gradient}`} />

                      <CardHeader>
                        <div
                          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${feature.iconBg} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md`}
                        >
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        <CardTitle className="font-['Playfair_Display'] text-lg sm:text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col gap-6">
                        <ul className="space-y-3">
                          {feature.highlights.map((item) => {
                            const ItemIcon = item.icon
                            return (
                              <li key={item.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${feature.bgLight}`}>
                                  <ItemIcon className="h-3.5 w-3.5" />
                                </span>
                                {item.text}
                              </li>
                            )
                          })}
                        </ul>

                        <Button
                          asChild
                          variant="outline"
                          className={`mt-auto w-full gap-2 border-0 bg-gradient-to-r ${feature.gradient} text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]`}
                        >
                          <Link href={feature.href}>
                            Login
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.12),transparent_50%)]" />

        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 h-24 w-24 rounded-full border border-white/10 sm:h-32 sm:w-32" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full border border-white/10 sm:h-48 sm:w-48" />
        <div className="absolute top-1/2 right-1/4 h-4 w-4 rounded-full bg-white/20" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center" data-aos="fade-up">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm sm:h-16 sm:w-16">
            <UtensilsCrossed className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Sedia untuk Revolusi Dapur?
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-blue-100/80 sm:text-lg">
            Dapur Siswa membantu pelajar, sukarelawan, dan pihak pengurusan bekerjasama
            dalam satu platform yang mudah, pantas, dan sistematik.
          </p>

          <div className="mt-10 flex w-full flex-col items-center gap-4 px-2 sm:w-auto sm:flex-row sm:px-0">
            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-2 rounded-xl bg-white px-8 text-base font-semibold text-blue-700 shadow-lg shadow-black/10 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:h-13 sm:w-auto sm:px-10"
            >
              <Link href="/login">
                Mula Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full gap-2 rounded-xl border-2 border-white/30 bg-transparent px-8 text-white font-medium transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95 sm:h-13 sm:w-auto sm:px-10"
            >
              <Link href="#features">Ketahui Lebih</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t bg-gray-50/80 backdrop-blur-xl dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 sm:py-10">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: "#001951" }}
            >
              <Image
                src="/DAPUR.png"
                alt="Dapur Siswa UMS Logo"
                width={96}
                height={96}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="font-['Playfair_Display'] text-base font-semibold sm:text-lg">Dapur Siswa Madani @ UMS</span>
          </div>


          <div className="flex gap-3">
            <div className="flex items-center gap-4">
              <Link
                href="https://www.facebook.com/DapurSiswaMadaniUMS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white dark:bg-blue-900/40 dark:text-blue-300"
                aria-label="Facebook Dapur Siswa Madani UMS"
              >
                <FaFacebook className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.tiktok.com/@pnrf_ums_official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white dark:bg-blue-900/40 dark:text-blue-300"
                aria-label="Tiktok Dapur Siswa Madani UMS"
              >
                <FaTiktok className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.youtube.com/@pnrfums"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white dark:bg-blue-900/40 dark:text-blue-300"
                aria-label="Youtube Dapur Siswa Madani UMS"
              >
                <FaYoutube className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.ums.edu.my/pnrf/index.php/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white dark:bg-blue-900/40 dark:text-blue-300"
                aria-label="Website Dapur Siswa Madani UMS"
              >
                <FaGlobe className="h-4 w-4" />
              </Link>
            </div>
            
          </div>


          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground sm:flex-row sm:gap-6 sm:text-sm">
            <Link href="/login" className="transition-colors hover:text-blue-600">Log Masuk</Link>
            <span>&copy; {new Date().getFullYear()} Dapur Siswa. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  )
}