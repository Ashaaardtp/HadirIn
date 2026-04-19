"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthRequiredPopup() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const authRequired = searchParams.get("auth");
    if (authRequired === "required") {
      setVisible(true);
      const timeout = window.setTimeout(() => {
        setVisible(false);
      }, 7000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 top-6 z-50 rounded-3xl border border-red-500/20 bg-red-600/95 px-4 py-4 shadow-2xl shadow-red-900/20 text-white backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-3 w-3 rounded-full bg-white/90" />
        <div>
          <p className="font-bold text-sm">
            Akses ditolak
          </p>
          <p className="text-xs text-white/90 mt-1 leading-snug">
            Anda tidak dapat masuk langsung ke
            dashboard tanpa login. Silakan login
            jika sudah punya akun, atau daftar
            jika belum.
          </p>
        </div>
      </div>
    </div>
  );
}
