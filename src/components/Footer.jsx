"use client";

import {
  InstagramLogoIcon,
  LinkedinLogoIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react";
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

export default function Footer() {
  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Alur", href: "#alur" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "Bantuan", href: "#bantuan" },
  ];

  return (
    <motion.footer
      className="relative bg-midnight-dark border-t border-white/5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}>
      <motion.div
        className="max-w-6xl mx-auto py-8 px-4"
        variants={itemVariants}>
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start gap-6"
          variants={itemVariants}>
          <motion.div
            className="flex-1"
            variants={itemVariants}>
            <h2 className="font-poppins text-xl font-bold">
              Hadir
              <span className="text-putih/70">
                In
              </span>
            </h2>
            <h3 className="text-muted text-sm mt-1">
              Solusi presensi digital cerdas untuk
              sekolah masa depan
            </h3>
            <motion.div
              className="flex gap-6 mt-4"
              variants={itemVariants}>
              <a
                href="https://instagram.com/Ashaaardtp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-[#E1306C] transition-colors">
                <InstagramLogoIcon
                  size={32}
                  color="#f2f2f7"
                  weight="fill"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/pasha-raditya-putra-8221093a2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-[#0077B5] transition-colors">
                <LinkedinLogoIcon
                  size={32}
                  color="#f2f2f7"
                  weight="fill"
                />
              </a>
              <a
                href="https://github.com/Ashaaardtp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors">
                <GithubLogoIcon
                  size={32}
                  color="#f2f2f7"
                  weight="fill"
                />
              </a>
            </motion.div>
          </motion.div>
          <div className="flex-1">
            <h2 className="font-poppins font-semibold text-lg">
              Navigasi
            </h2>
            <ul>
              {navLinks.map((link) => (
                <li
                  key={link.name}
                  className="mt-2">
                  <a
                    href={link.href}
                    className="text-muted hover:text-putih transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="font-poppins text-lg font-semibold mb-3">
              Kirim Testimoni
            </h3>
            <p className="text-muted text-sm mb-3">
              Bagikan pengalamanmu dengan HadirIn
            </p>
            <form className="flex flex-col gap-3">
              <textarea
                placeholder="Tulis pengalamanmu bersama HadirIn..."
                className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-lg text-putih placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
              />
              <button
                type="button"
                className="self-end px-5 py-2 bg-primary text-midnight-dark font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Kirim
              </button>
            </form>
          </div>
        </motion.div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-muted text-sm">
          <p>
            © 2026 HadirIn. All rights reserved |
            Created With Fuiyoh Energy by Mpash
          </p>
        </div>
      </motion.div>
    </motion.footer>
  );
}
