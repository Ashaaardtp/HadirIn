"use client";

import { useState } from "react";
import { List, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Alur", href: "#alur" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "Bantuan", href: "#bantuan" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight-dark/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#hero" className="text-2xl font-extrabold font-poppins text-putih">
            Hadir
            <span className="text-putih/70">In</span>
          </a>

          <ul className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="hover:text-primary text-putih font-medium transition-colors font-poppins"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <button
            className="md:hidden text-putih"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <List size={28} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block hover:text-primary text-putih font-medium transition-colors font-poppins"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
