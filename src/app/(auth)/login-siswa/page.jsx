"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/client"; // Pastikan path ini sesuai

export default function LoginSiswa() {
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAccess = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Cari apakah ada Wali Kelas yang memiliki kode ini di tabel profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("nama_lengkap, kode_kelas")
      .eq("kode_kelas", classCode.toUpperCase())
      .single();

    if (error || !data) {
      alert(
        "Kode kelas tidak ditemukan. Silakan hubungi Wali Kelas Anda.",
      );
      setLoading(false);
    } else {
      // 2. Simpan kode kelas di localStorage sebagai "session" siswa
      localStorage.setItem(
        "classCode",
        data.kode_kelas,
      );

      // 3. Berhasil masuk, arahkan ke dashboard siswa
      router.push("/siswa");
    }
  };

  return (
    <main className="min-h-screen bg-midnight-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-midnight-2/50 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-primary font-poppins font-bold text-sm hover:underline mb-4 inline-block">
            ← Kembali
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">
            Halo Sekretaris!
          </h1>
          <p className="font-poppins text-muted text-sm">
            Masukkan kode unik kelas untuk mulai
            mengisi laporan absensi
          </p>
        </div>

        <form
          onSubmit={handleAccess}
          className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300 ml-1 text-center block">
              Kode Kelas
            </label>
            <input
              type="text"
              required
              value={classCode}
              onChange={(e) =>
                setClassCode(
                  e.target.value.toUpperCase(),
                )
              }
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-6 text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-primary transition-all font-poppins uppercase"
              placeholder="CONTOH: X-PPLG"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-poppins font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 glass-button">
            {loading ?
              "Mengecek Kode..."
            : "Masuk ke Dashboard"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
