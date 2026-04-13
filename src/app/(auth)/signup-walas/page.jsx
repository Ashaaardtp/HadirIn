"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignupWali() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } =
      await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Data ini yang bakal ditangkap trigger SQL untuk masuk ke tabel profiles
          data: {
            nama_lengkap: formData.nama,
          },
        },
      });

    if (error) {
      alert("Gagal Daftar: " + error.message);
      setLoading(false);
    } else {
      alert("Cek email kamu untuk verifikasi!");
      router.push("/login-walas");
    }
  };

  return (
    <main className="min-h-screen bg-midnight-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amethyst/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-midnight-2/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl z-10">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">
            Daftar Akun
          </h1>
          <p className="font-poppins text-muted text-sm">
            Lengkapi data untuk akses Wali Kelas
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nama: e.target.value,
                })
              }
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-amethyst outline-none font-poppins"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-amethyst outline-none font-poppins"
              placeholder="email@sekolah.sch.id"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-poppins text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="w-full bg-midnight-dark/50 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white focus:border-amethyst outline-none font-poppins"
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

          <button
            disabled={loading}
            className="w-full bg-amethyst text-white font-poppins font-bold py-4 rounded-2xl glass-button mt-2 active:scale-95 transition-all">
            {loading ?
              "Mendaftarkan..."
            : "Daftar Sekarang"}
          </button>

          <p className="text-center font-poppins text-sm text-gray-400 mt-4">
            Sudah punya akun?{" "}
            <Link
              href="/login-walas"
              className="text-amethyst hover:underline font-bold">
              Login
            </Link>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
