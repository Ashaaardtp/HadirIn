"use client";

import {
  BookOpen,
  ArrowRight,
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

export default function Bantuan() {
  return (
    <motion.section
      id="bantuan"
      className="py-20 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}>
      <motion.div
        className="max-w-4xl mx-auto"
        variants={itemVariants}>
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-midnight-1 via-midnight-2 to-midnight-1 border border-white/10"
          variants={itemVariants}>
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(58,1,92,0.3),transparent_50%)]"
            variants={itemVariants}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(79,1,71,0.2),transparent_40%)]"
            variants={itemVariants}
          />

          <motion.div
            className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
            variants={itemVariants}>
            <motion.div
              className="text-center md:text-left"
              variants={itemVariants}>
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amethyst/20 border border-amethyst/30 mb-6"
                variants={itemVariants}>
                <BookOpen className="w-8 h-8 text-amethyst" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-serif text-putih mb-3">
                Klik Untuk Mendapatkan Panduan
              </h2>
              <p className="text-muted max-w-md">
                Pelajari cara menggunakan sistem
                absensi digital dengan mudah
                melalui panduan lengkap.
              </p>
            </motion.div>

            <motion.button
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-amethyst hover:bg-deep-purple text-white font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(58,1,92,0.5)]"
              variants={itemVariants}>
              <span>Buka Panduan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          <motion.div
            className="absolute -bottom-20 -right-20 w-40 h-40 bg-amethyst/20 rounded-full blur-3xl"
            variants={itemVariants}
          />
          <motion.div
            className="absolute -top-20 -left-20 w-40 h-40 bg-deep-purple/20 rounded-full blur-3xl"
            variants={itemVariants}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
