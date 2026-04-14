import Link from "next/link";

export default function DashboardLayout({
  children,
}) {
  return (
    <section className="min-h-screen bg-primary text-white">
      {/* Navigasi atau Sidebar bisa diletakkan di sini nanti.
          Untuk sekarang, kita buat pembungkus sederhana dulu. 
      */}

      <header className="p-6 border-b border-white/10 flex">
        <h1 className="text-xl font-bold">
          Dashboard System
        </h1>
        <Link
          href="/"
          className="text-putih hover:text-putih/70 ml-auto">
          Kembali
        </Link>
      </header>

      <main className="p-6">{children}</main>

      {/* Footer atau elemen global dashboard lainnya */}
    </section>
  );
}
