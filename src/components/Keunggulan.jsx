"use client";

import {
  Zap,
  ShieldCheck,
  Radar,
} from "lucide-react";
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

export default function Keunggulan() {
  const features = [
    {
      desc: "Lupakan rekap manual tiap akhir bulan yang melelahkan.",
      icon: (
        <Zap size={28} className="text-white" />
      ),
    },
    {
      desc: "Minimalisir risiko data hilang atau laporan yang terselip.",
      icon: (
        <ShieldCheck
          size={28}
          className="text-white"
        />
      ),
    },
    {
      desc: "Deteksi masalah kehadiran siswa lebih awal dengan bantuan sistem.",
      icon: (
        <Radar size={28} className="text-white" />
      ),
    },
  ];

  return (
    <motion.section
      id="keunggulan"
      className="py-20 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}>
      <motion.div
        className="max-w-6xl mx-auto"
        variants={itemVariants}>
        <motion.div
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center"
          variants={itemVariants}>
            <motion.div
            className="text-center lg:text-right"
            variants={itemVariants}>
            <h2 className="text-5xl md:text-6xl font-serif font-semibold leading-tight text-white">
              Kenapa Harus <br /> Pindah ke
              Digital?
            </h2>
            <p className="mt-6 max-w-xl mx-auto lg:ml-auto text-lg leading-relaxed text-gray-300">
              Sistem yang lebih dari sekadar
              mencatat nama, tetapi juga
              memberikan data.
            </p>
          </motion.div>
          <motion.div
            className="glass-button border border-white/10 bg-white/5 p-8 rounded-4xl shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
            variants={itemVariants}>
            <motion.div
              className="space-y-6"
              variants={itemVariants}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-5 rounded-3xl border border-white/10 bg-white/5 p-5"
                  variants={itemVariants}>
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15"
                    variants={itemVariants}>
                    {feature.icon}
                  </motion.div>
                  <p className="text-base leading-relaxed text-gray-200">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
