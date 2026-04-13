"use client";

import React, {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import createClient from "@/utils/supabase/client"; // Pastikan path ini benar

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  const [user, setUser] = useState(null);
  const [isSiswa, setIsSiswa] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Cek apakah ada kode kelas di localStorage (penanda siswa sudah pernah masuk)
      const savedClassCode =
        localStorage.getItem("classCode");
      if (savedClassCode) {
        setIsSiswa(true);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();
    if (error) {
      alert("Gagal Logout: " + error.message);
    } else {
      // Hapus classCode dari localStorage untuk siswa
      localStorage.removeItem("classCode");
      // Refresh halaman atau arahkan ke home agar UI terupdate
      window.location.reload();
    }
  };

  return (
    <motion.section
      id="hero"
      className="min-h-[80vh] flex flex-col md:flex-row items-center justify-between px-6 py-12 md:px-20 gap-12 bg-midnight-dark pt-24"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}>
      {/* Sisi Kiri: Headline */}
      <motion.div
        className="flex-1 space-y-6"
        variants={itemVariants}>
        <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight text-putih">
          Ubah Absensi <br /> Konvensional <br />{" "}
          Menjadi Digital.
        </h1>
        <p className="font-poppins text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
          Sistem rekap otomatis untuk sekretaris
          dan dashboard analisis mendalam untuk
          guru.
        </p>
      </motion.div>

      {/* Sisi Kanan: Kondisi Tombol */}
      <motion.div
        className="flex-1 w-full max-w-md space-y-4"
        variants={itemVariants}>
        {/* JIKA GURU SUDAH LOGIN */}
        {user ?
          <div className="space-y-4 w-full">
            <Link href="/walikelas">
              <motion.div className="bg-amethyst/20 border border-amethyst p-10 rounded-4xl flex flex-col items-center justify-center text-center group cursor-pointer shadow-lg shadow-amethyst/10 backdrop-blur-md">
                <span className="text-5xl mb-4">
                  🚀
                </span>
                <h2 className="font-playfair text-2xl font-bold text-white">
                  Masuk ke Dashboard
                </h2>
                <p className="text-amethyst text-sm mt-2">
                  Halo,{" "}
                  {
                    user.user_metadata
                      ?.nama_lengkap
                  }
                </p>
              </motion.div>
            </Link>

            {/* TOMBOL LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full py-3 text-gray-400 hover:text-red-400 text-sm font-poppins transition-colors underline decoration-dotted">
              Logout
            </button>
          </div>
        : isSiswa ?
          /* JIKA SISWA SUDAH PERNAH MASUK (Ada ClassCode di Storage) */
          <div className="space-y-4 w-full">
            <Link href="/siswa">
              <motion.div className="bg-green-500/20 border border-green-500 p-10 rounded-4xl flex flex-col items-center justify-center text-center group cursor-pointer shadow-lg shadow-green-500/10 backdrop-blur-md">
                <span className="text-5xl mb-4">
                  📝
                </span>
                <h2 className="font-playfair text-2xl font-bold text-white">
                  Kirim Laporan Absen
                </h2>
                <p className="text-green-400 text-sm mt-2">
                  Lanjutkan pengisian kelasmu
                </p>
              </motion.div>
            </Link>

            {/* TOMBOL LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full py-3 text-gray-400 hover:text-red-400 text-sm font-poppins transition-colors underline decoration-dotted">
              Logout
            </button>
          </div>
        : /* JIKA BELUM LOGIN SAMA SEKALI (Tampilan Awal Kamu) */
          <>
            <Link href="/login-walas">
              <div className="bg-midnight-2 border border-midnight-1 p-8 rounded-4xl flex flex-col items-center justify-center text-center group hover:border-amethyst transition-all shadow-lg glass-button mb-4">
                <span className="text-4xl mb-2">
                  🧚
                </span>
                <h2 className="font-serif text-2xl font-bold text-putih">
                  Wali Kelas
                </h2>
              </div>
            </Link>

            <Link href="/login-siswa">
              <div className="bg-midnight-2 border border-midnight-1 p-8 rounded-4xl flex flex-col items-center justify-center text-center group hover:border-amethyst transition-all shadow-lg glass-button">
                <span className="text-4xl mb-2">
                  🐔
                </span>
                <h2 className="font-serif text-2xl font-bold text-putih">
                  Siswa
                </h2>
              </div>
            </Link>
          </>
        }
      </motion.div>
    </motion.section>
  );
}
