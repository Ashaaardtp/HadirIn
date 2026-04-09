"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
  exit: { opacity: 0 },
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
  exit: { opacity: 0, y: 50 },
};

export default function Hero() {
  return (
    <motion.section
      id="hero"
      className="min-h-[80vh] flex flex-col md:flex-row items-center justify-between px-6 py-12 md:px-20 gap-12 bg-midnight-dark pt-24"
      initial="hidden"
      whileInView="visible"
      exit="hidden"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}>
      {/* Sisi Kiri: Headline & Deskripsi */}
      <motion.div
        className="flex-1 space-y-6"
        variants={itemVariants}>
        <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight text-white">
          Ubah Absensi <br />
          Konvensional <br />
          Menjadi Digital <br />
          yang Profesional.
        </h1>
        <p className="font-sans text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
          Sistem rekap otomatis untuk sekretaris
          dan dashboard analisis mendalam untuk
          guru. Semua dalam satu genggaman.
        </p>
      </motion.div>

      {/* Sisi Kanan: Bento Card Roles */}
      <motion.div
        className="flex-1 w-full max-w-md space-y-4"
        variants={itemVariants}>
        {/* Card Wali Kelas */}
        <Link href="/walikelas">
          <motion.div
            className="bg-midnight-2 border border-midnight-1 p-8 rounded-4xl flex flex-col items-center justify-center text-center group hover:border-amethyst transition-all duration-300 cursor-pointer shadow-lg glass-button mb-8"
            variants={itemVariants}>
            <div className="w-20 h-20 mb-4 flex items-center justify-center bg-amethyst/10 rounded-full group-hover:scale-110 transition-transform">
              {/* Placeholder untuk Ikon Naga */}
              <span className="text-4xl">🐉</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Wali Kelas
            </h2>
          </motion.div>
        </Link>

        {/* Card Siswa */}
        <Link href="/siswa">
          <motion.div
            className="bg-midnight-2 border border-midnight-1 p-8 rounded-4xl flex flex-col items-center justify-center text-center group hover:border-amethyst transition-all duration-300 cursor-pointer shadow-lg glass-button"
            variants={itemVariants}>
            <div className="w-20 h-20 mb-4 flex items-center justify-center bg-amethyst/10 rounded-full group-hover:scale-110 transition-transform">
              {/* Placeholder untuk Ikon Ayam */}
              <span className="text-4xl">🐔</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Siswa
            </h2>
          </motion.div>
        </Link>
      </motion.div>
    </motion.section>
  );
}
