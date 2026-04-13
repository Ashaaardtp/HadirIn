"use client";

import {
  FolderInput,
  Monitor,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
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

const alurSteps = [
  {
    icon: FolderInput,
    title: "Input Data",
    description:
      "Sekretaris mengisi daftar hadir via HP.",
    color: "#8b5cf6",
  },
  {
    icon: Monitor,
    title: "Proses Data",
    description:
      "Sistem mengolah data secara real-time ke database.",
    color: "#06b6d4",
  },
  {
    icon: Cpu,
    title: "Laporan",
    description:
      "Guru melihat laporan lengkap di dashboard.",
    color: "#10b981",
  },
];

export default function Alur() {
  return (
    <motion.section
      id="alur"
      className="py-20 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}>
      <motion.div
        className="max-w-6xl mx-auto"
        variants={itemVariants}>
        <h2 className="text-4xl font-serif text-center mb-4 text-putih">
          Cara Kerja
        </h2>
        <p className="text-muted text-center mb-12 max-w-2xl mx-auto">
          Tiga langkah mudah untuk mengelola
          kehadiran siswa dengan efisien
        </p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={itemVariants}>
          {alurSteps.map((step, index) => (
            <motion.div
              key={index}
              className="group relative bg-linear-to-br from-midnight-1 to-midnight-2 rounded-2xl p-8 border border-white/5 overflow-hidden"
              variants={itemVariants}>
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${step.color}20 0%, transparent 70%)`,
                }}
              />

              <motion.div
                className="relative z-10"
                variants={itemVariants}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}40, ${step.color}20)`,
                    border: `1px solid ${step.color}30`,
                  }}>
                  <step.icon
                    className="w-8 h-8"
                    style={{ color: step.color }}
                  />
                </div>

                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted text-sm font-medium">
                  {index + 1}
                </div>

                <h3 className="text-xl font-serif text-putih mb-3 group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: step.color }}
                variants={itemVariants}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
