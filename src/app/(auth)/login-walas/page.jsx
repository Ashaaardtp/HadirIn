"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import createClient from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginWali() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State untuk loading
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // LOGIC UTAMA: Login ke Supabase
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (error) {
      alert("Gagal login: " + error.message);
      setLoading(false);
    } else {
      // Jika berhasil, arahkan ke dashboard wali kelas
      router.refresh();
      router.push("/walikelas");
    }
  };

  return (
    <main className="min-h-screen bg-midnight-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amethyst/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-midnight-2/50 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-amethyst font-poppins font-bold text-sm hover:underline mb-4 inline-block">
            ← Kembali
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">
            Wali Kelas
          </h1>
          <p className="font-poppins text-muted text-sm">
            Masuk untuk memantau kehadiran kelas
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amethyst transition-all font-poppins"
              placeholder="nama@sekolah.sch.id"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white focus:outline-none focus:border-amethyst transition-all font-poppins"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <p className="text-center font-poppins text-sm text-gray-400 mt-4">
            Belum punya akun?{" "}
            <Link
              href="/signup-walas"
              className="text-amethyst hover:underline font-bold">
              Daftar
            </Link>
          </p>
          <button
            className="w-full bg-amethyst hover:scale-[1.02] active:scale-[0.98] text-white font-poppins font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amethyst/20 glass-button mt-4 disabled={loading}"
            disabled={loading}>
            {loading ?
              "Sedang Masuk..."
            : "Masuk Sekarang"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
