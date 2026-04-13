"use client";

import { useState } from "react";

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
          <a
            href="#hero"
            className="text-2xl font-extrabold font-poppins text-putih">
            Hadir
            <span className="text-putih/70">
              In
            </span>
          </a>

          <ul className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="hover:text-primary text-putih font-medium transition-colors font-poppins">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <button
            className="md:hidden text-putih flex flex-col gap-1.5 w-8 h-8 justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu">
            <span
              className={`w-full h-0.5 bg-putih rounded transition-all duration-300 ease-in-out transform origin-center ${
                isOpen ?
                  "rotate-45 translate-y-2"
                : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-putih rounded transition-all duration-300 ease-in-out ${
                isOpen ?
                  "opacity-0 scale-0"
                : "opacity-100 scale-100"
              }`}
            />
            <span
              className={`w-full h-0.5 bg-putih rounded transition-all duration-300 ease-in-out transform origin-center ${
                isOpen ?
                  "-rotate-45 -translate-y-2"
                : ""
              }`}
            />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() =>
                      setIsOpen(false)
                    }
                    className="block hover:text-primary text-putih font-medium transition-colors font-poppins">
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
