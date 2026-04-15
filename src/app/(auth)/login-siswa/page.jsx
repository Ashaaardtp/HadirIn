"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/client";

export default function LoginSiswa() {
  const [namaSekretaris, setNamaSekretaris] = useState("");
  const [kodeSekretaris, setKodeSekretaris] = useState("");
  const [kodeKelas, setKodeKelas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("sekretaris")
      .select("nama_sekretaris, kode_sekretaris, nama_kelas, kode_kelas")
      .eq("kode_sekretaris", kodeSekretaris.toUpperCase())
      .eq("kode_kelas", kodeKelas.toUpperCase())
      .single();

    if (fetchError || !data) {
      setError("Data sekretaris tidak ditemukan. Periksa kode sekretaris dan kode kelas Anda.");
      setLoading(false);
      return;
    }

    if (data.nama_sekretaris.toLowerCase() !== namaSekretaris.toLowerCase().trim()) {
      setError("Nama sekretaris tidak cocok dengan kode yang entered.");
      setLoading(false);
      return;
    }

    localStorage.setItem("sekretaris_profile", JSON.stringify({
      nama_sekretaris: data.nama_sekretaris,
      kode_sekretaris: data.kode_sekretaris,
      nama_kelas: data.nama_kelas,
      kode_kelas: data.kode_kelas,
    }));

    router.push("/siswa");
  };

  return (
    <main className="min-h-screen bg-midnight-dark flex items-center justify-center p-6 relative overflow-hidden">
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
            Login Sekretaris
          </h1>
          <p className="font-poppins text-muted text-sm">
            Masuk dengan data yang diberikan guru
          </p>
        </div>

        <form onSubmit={handleAccess} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300 ml-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={namaSekretaris}
              onChange={(e) => setNamaSekretaris(e.target.value)}
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-base focus:outline-none focus:border-primary transition-all font-poppins"
              placeholder="Nama Anda"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300 ml-1">
              Kode Sekretaris
            </label>
            <input
              type="text"
              required
              value={kodeSekretaris}
              onChange={(e) => setKodeSekretaris(e.target.value.toUpperCase())}
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-base font-bold tracking-widest focus:outline-none focus:border-primary transition-all font-poppins uppercase"
              placeholder="KODE SEKRETARIS"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300 ml-1">
              Kode Kelas
            </label>
            <input
              type="text"
              required
              value={kodeKelas}
              onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-base font-bold tracking-widest focus:outline-none focus:border-primary transition-all font-poppins uppercase"
              placeholder="KODE KELAS"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-poppins font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 glass-button">
            {loading ? "Memuat..." : "Masuk"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
