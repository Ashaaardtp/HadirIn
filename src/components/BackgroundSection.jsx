"use client";

import Image from "next/image";
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

export default function BackgroundSection() {
  return (
    <motion.section
      className="relative py-32 px-4 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}>
      <motion.div
        className="absolute inset-0 z-0"
        variants={itemVariants}>
        <Image
          src="/bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <motion.div
          className="absolute inset-0 bg-midnight-dark/80"
          variants={itemVariants}
        />
      </motion.div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={itemVariants}>
        <h2 className="text-4xl md:text-5xl font-serif text-putih mb-6">
          Siap Mengubah Cara Sekolah?
        </h2>
        <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
          HadirIn memberikan solusi digital yang
          mudah dan efisien untuk pengelolaan
          absensi sekolah Anda.
        </p>
        <motion.a
          href="#bantuan"
          className="inline-block px-8 py-3 bg-primary text-midnight-dark font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          variants={itemVariants}>
          Mulai Sekarang
        </motion.a>
      </motion.div>
    </motion.section>
  );
}
