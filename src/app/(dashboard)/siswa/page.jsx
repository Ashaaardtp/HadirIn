/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, {
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  Send,
  Camera,
  User,
  Search,
  Trash2,
  ClipboardList,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import createClient from "@/utils/supabase/client";

export default function SiswaDashboard() {
  // ─── Onboarding State ───────────────────────────────────────
  const [onboardingStep, setOnboardingStep] =
    useState(0); // 0=loading, 1=nama, 2=kode_sekretaris, 3=kelas, 4=dashboard, 5=login_verify
  const [namaSekretaris, setNamaSekretaris] =
    useState("");
  const [
    kodeSecretarisInput,
    setKodeSecretarisInput,
  ] = useState("");
  const [inputNamaKelas, setInputNamaKelas] =
    useState("");
  const [kodeSekretaris, setKodeSekretaris] =
    useState(""); // kode_kelas dari localStorage (login-siswa)
  const [namaKelasAktif, setNamaKelasAktif] =
    useState(""); // nama_kelas aktif
  const [onboardingError, setOnboardingError] =
    useState("");
  const [onboardingSaving, setOnboardingSaving] =
    useState(false);
  const [loginKodeInput, setLoginKodeInput] =
    useState(""); // Input kode untuk verifikasi login
  const [
    showKodeOnboarding,
    setShowKodeOnboarding,
  ] = useState(false); // Tampilkan kode saat onboarding
  const [showKodeLogin, setShowKodeLogin] =
    useState(false); // Tampilkan kode saat login

  // ─── Dashboard State ─────────────────────────────────────────
  const [searchTerm, setSearchTerm] =
    useState("");
  const [rekapSiswa, setRekapSiswa] = useState(
    [],
  );
  const [selectedSiswa, setSelectedSiswa] =
    useState(null);
  const [status, setStatus] = useState("Sakit");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [loadingSiswa, setLoadingSiswa] =
    useState(true);
  const [
    isMobilePopupOpen,
    setIsMobilePopupOpen,
  ] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] =
    useState("list"); // "list" | "form" | "rekap"

  // ─── Edit & Duplicate Warning State ────────────────────────
  const [editingItem, setEditingItem] =
    useState(null); // Item yang sedang diedit
  const [
    showDuplicateWarning,
    setShowDuplicateWarning,
  ] = useState(false); // Tampilkan warning duplikat
  const [
    duplicateWarningMessage,
    setDuplicateWarningMessage,
  ] = useState(""); // Pesan warning
  const [tempEditData, setTempEditData] =
    useState(null); // Data edit sementara sebelum disimpan

  const supabase = createClient();

  // ─── Cek apakah sekretaris sudah pernah setup ───────────────
  useEffect(() => {
    const stored = localStorage.getItem(
      "sekretaris_profile",
    );
    if (stored) {
      // Sudah pernah setup, tapi perlu login dengan kode
      const parsed = JSON.parse(stored);
      setNamaSekretaris(parsed.nama_sekretaris);
      setNamaKelasAktif(parsed.nama_kelas);
      setKodeSekretaris(parsed.kode_kelas);
      setOnboardingStep(5); // Login verification screen
    } else {
      // Belum pernah setup, mulai onboarding
      const savedKode =
        localStorage.getItem("classCode");
      if (savedKode) {
        setKodeSekretaris(savedKode);
      }
      setOnboardingStep(1); // mulai onboarding
    }
  }, []);

  // Handler: simpan nama sekretaris (step 1 → 2)
  const handleSimpanNama = () => {
    if (!namaSekretaris.trim()) {
      setOnboardingError("Nama wajib diisi.");
      return;
    }
    setOnboardingError("");
    setOnboardingStep(2); // Pindah ke input Kode Sekretaris
  };

  // Handler: validasi kode sekretaris unik (step 2 → 3)
  const handleSimpanKode = async () => {
    if (!kodeSecretarisInput.trim()) {
      setOnboardingError(
        "Kode sekretaris wajib diisi.",
      );
      return;
    }

    if (kodeSecretarisInput.trim().length < 4) {
      setOnboardingError(
        "Kode sekretaris minimal 4 karakter.",
      );
      return;
    }

    setOnboardingSaving(true);
    setOnboardingError("");

    // Cek apakah kode sudah digunakan
    const { data, error } = await supabase
      .from("sekretaris")
      .select("kode_sekretaris")
      .eq(
        "kode_sekretaris",
        kodeSecretarisInput.trim(),
      )
      .single();

    if (data) {
      setOnboardingError(
        "Kode sekretaris sudah digunakan. Gunakan kode lain.",
      );
      setOnboardingSaving(false);
      return;
    }

    setOnboardingError("");
    setOnboardingStep(3); // Pindah ke input Nama Kelas
    setOnboardingSaving(false);
  };

  // Handler: validasi nama_kelas ke DB dan simpan ke tabel sekretaris (step 3 → 4)
  const handleValidasiKelas = async () => {
    if (!inputNamaKelas.trim()) {
      setOnboardingError(
        "Nama kelas harus diisi.",
      );
      return;
    }
    if (!kodeSekretaris) {
      setOnboardingError(
        "Kode kelas tidak ditemukan. Silakan login ulang.",
      );
      return;
    }
    setOnboardingSaving(true);
    setOnboardingError("");

    // Validasi: nama_kelas harus cocok dengan kode_kelas yang sudah tersimpan
    const { data, error } = await supabase
      .from("profiles")
      .select("kode_kelas, nama_kelas")
      .eq("nama_kelas", inputNamaKelas.trim())
      .eq("kode_kelas", kodeSekretaris)
      .single();

    if (error || !data) {
      setOnboardingError(
        "Nama kelas tidak sesuai dengan kode unik yang Anda gunakan untuk login. Pastikan nama kelas benar sesuai data dari guru.",
      );
      setOnboardingSaving(false);
      return;
    }

    // Insert data ke tabel sekretaris
    const { error: insertError } = await supabase
      .from("sekretaris")
      .insert([
        {
          nama_sekretaris: namaSekretaris.trim(),
          kode_sekretaris:
            kodeSecretarisInput.trim(),
          nama_kelas: data.nama_kelas,
        },
      ]);

    if (insertError) {
      setOnboardingError(
        "Gagal menyimpan data: " +
          insertError.message,
      );
      setOnboardingSaving(false);
      return;
    }

    // Simpan profil lengkap ke localStorage
    const profile = {
      nama_sekretaris: namaSekretaris.trim(),
      kode_sekretaris: kodeSecretarisInput.trim(),
      nama_kelas: data.nama_kelas,
      kode_kelas: data.kode_kelas,
    };

    localStorage.setItem(
      "sekretaris_profile",
      JSON.stringify(profile),
    );
    setNamaKelasAktif(data.nama_kelas);
    setOnboardingStep(4);
  };

  // Handler: verifikasi kode sekretaris untuk login (step 5 → 4)
  const handleVerifyLoginKode = async () => {
    if (!loginKodeInput.trim()) {
      setOnboardingError(
        "Kode sekretaris harus diisi.",
      );
      return;
    }

    setOnboardingSaving(true);
    setOnboardingError("");

    // Cek apakah kode cocok dengan yang disimpan
    const stored = localStorage.getItem(
      "sekretaris_profile",
    );
    if (!stored) {
      setOnboardingError(
        "Data profil tidak ditemukan.",
      );
      setOnboardingSaving(false);
      return;
    }

    const profile = JSON.parse(stored);
    if (
      loginKodeInput.trim() !==
      profile.kode_sekretaris
    ) {
      setOnboardingError(
        "Kode sekretaris tidak sesuai. Coba lagi.",
      );
      setOnboardingSaving(false);
      return;
    }

    // Kode benar, masuk ke dashboard
    setKodeSecretarisInput(
      profile.kode_sekretaris,
    );
    setInputNamaKelas(profile.nama_kelas);
    setOnboardingStep(4);
    setOnboardingSaving(false);
  };

  // Handler: Logout
  const handleLogout = () => {
    localStorage.removeItem("sekretaris_profile");
    setNamaSekretaris("");
    setKodeSecretarisInput("");
    setInputNamaKelas("");
    setLoginKodeInput("");
    setOnboardingError("");
    setOnboardingStep(1);
    setRekapSiswa([]);
  };

  useEffect(() => {
    const fetchSiswa = async () => {
      const { data, error } = await supabase
        .from("siswa")
        .select("*")
        .eq("kode_kelas", kodeSekretaris) // Filter agar tidak muncul siswa kelas lain
        .order("nama", { ascending: true });

      if (error) {
        console.error(
          "Error fetching siswa:",
          error,
        );
      } else {
        setSiswaList(data);
      }
      setLoadingSiswa(false);
    };
    fetchSiswa();
  }, [kodeSekretaris, supabase]);

  const filteredStudents = useMemo(() => {
    return siswaList.filter((s) =>
      s.nama
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, siswaList]);

  // ─── Check Duplicate Function ──────────────────────────────
  const checkDuplicate = (
    namaSiswaToCheck,
    excludeTempId = null,
  ) => {
    return rekapSiswa.some((item) => {
      if (
        excludeTempId &&
        item.tempId === excludeTempId
      ) {
        return false; // Skip item yang sedang diedit
      }
      return (
        item.nama_siswa.toLowerCase() ===
        namaSiswaToCheck.toLowerCase()
      );
    });
  };

  const tambahKeRekap = (e) => {
    e.preventDefault();
    if (!selectedSiswa) return;

    // Cek duplikat
    if (checkDuplicate(selectedSiswa.nama)) {
      setDuplicateWarningMessage(
        `⚠️ Siswa "${selectedSiswa.nama}" sudah ada dalam antrean. Yakin ingin menambahkan lagi?

Klik "Lanjutkan Tambah" untuk tetap menambahkan, atau "Batal" untuk membatalkan.`,
      );
      setShowDuplicateWarning(true);
      setTempEditData({
        nama_siswa: selectedSiswa.nama,
        no_absen: selectedSiswa.no_absen,
        status: status,
        alasan:
          (
            status === "Izin" ||
            status === "Sakit"
          ) ?
            alasan
          : "Tanpa Keterangan",
        bukti_file: file,
        kode_kelas: kodeSekretaris,
        nama_kelas: namaKelasAktif,
        nama_pelapor: namaSekretaris,
      });
      return;
    }

    const dataBaru = {
      tempId: Date.now(),
      nama_siswa: selectedSiswa.nama,
      no_absen: selectedSiswa.no_absen,
      status: status,
      alasan:
        status === "Izin" || status === "Sakit" ?
          alasan
        : "Tanpa Keterangan",
      bukti_file: file,
      kode_kelas: kodeSekretaris,
      nama_kelas: namaKelasAktif,
      nama_pelapor: namaSekretaris,
    };

    setRekapSiswa([...rekapSiswa, dataBaru]);
    setAlasan("");
    setFile(null);
    setSelectedSiswa(null);
  };

  // ─── Handle Confirm Duplicate ─────────────────────────────
  const handleConfirmDuplicate = () => {
    if (!tempEditData) return;

    const dataBaru = {
      tempId: Date.now(),
      ...tempEditData,
    };

    setRekapSiswa([...rekapSiswa, dataBaru]);
    setAlasan("");
    setFile(null);
    setSelectedSiswa(null);
    setShowDuplicateWarning(false);
    setTempEditData(null);
  };

  // ─── Edit Item in Queue ───────────────────────────────────
  const editRekapItem = (item) => {
    setEditingItem({ ...item });
    setStatus(item.status);
    setAlasan(item.alasan || "");
    setFile(item.bukti_file);
  };

  // ─── Cancel Edit ──────────────────────────────────────────
  const cancelEditRekapItem = () => {
    setEditingItem(null);
    setAlasan("");
    setFile(null);
  };

  // ─── Update Item in Queue ────────────────────────────────
  const updateRekapItem = () => {
    if (!editingItem) return;

    // Cek duplikat (exclude item yang sedang diedit)
    if (
      checkDuplicate(
        editingItem.nama_siswa,
        editingItem.tempId,
      )
    ) {
      setDuplicateWarningMessage(
        `⚠️ Tidak dapat mengubah menjadi "${editingItem.nama_siswa}" karena nama siswa tersebut sudah ada di antrean lain.`,
      );
      setShowDuplicateWarning(true);
      return;
    }

    const updatedRekapSiswa = rekapSiswa.map(
      (item) => {
        if (item.tempId === editingItem.tempId) {
          return {
            ...item,
            status,
            alasan:
              (
                status === "Izin" ||
                status === "Sakit"
              ) ?
                alasan
              : "Tanpa Keterangan",
            bukti_file: file,
          };
        }
        return item;
      },
    );

    setRekapSiswa(updatedRekapSiswa);
    setEditingItem(null);
    setAlasan("");
    setFile(null);
  };

  const kirimSemuaLaporan = async () => {
    if (rekapSiswa.length === 0) return;
    setLoading(true);

    try {
      const processedData = await Promise.all(
        rekapSiswa.map(async (item) => {
          let fileUrl = null;
          if (
            item.bukti_file &&
            ["Sakit", "Izin"].includes(
              item.status,
            )
          ) {
            const fileExt = item.bukti_file.name
              .split(".")
              .pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data, error: uploadError } =
              await supabase.storage
                .from("surat-sakit")
                .upload(
                  fileName,
                  item.bukti_file,
                );

            if (!uploadError) {
              const {
                data: { publicUrl },
              } = supabase.storage
                .from("surat-sakit")
                .getPublicUrl(fileName);
              fileUrl = publicUrl;
            }
          }

          const { tempId, bukti_file, ...rest } =
            item;
          const finalData = {
            ...rest,
            bukti_file: fileUrl,
          };

          console.log(
            "Data yang dikirim:",
            finalData,
          );
          return finalData;
        }),
      );

      console.log(
        "Processed data:",
        processedData,
      );

      const { error } = await supabase
        .from("absensi")
        .insert(processedData);

      if (error) {
        console.error("Error detail:", error);
        alert("Gagal mengirim: " + error.message);
      } else {
        alert(
          `Berhasil mengirim rekap untuk ${rekapSiswa.length} siswa!`,
        );
        setRekapSiswa([]);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan: " + err.message);
    }
    setLoading(false);
  };

  // ─── Onboarding Screen ──────────────────────────────────────
  if (onboardingStep === 0) {
    return (
      <div className="min-h-screen bg-midnight-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amethyst/40 border-t-amethyst rounded-full animate-spin" />
      </div>
    );
  }

  if (
    onboardingStep === 1 ||
    onboardingStep === 2 ||
    onboardingStep === 3
  ) {
    return (
      <div className="min-h-screen bg-midnight-dark flex items-center justify-center p-4 font-poppins">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-amethyst/20 border border-amethyst/30 flex items-center justify-center mx-auto mb-4">
              <ClipboardList
                size={28}
                className="text-amethyst"
              />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-white mb-1">
              Selamat Datang, Sekretaris!
            </h1>
            <p className="text-gray-500 text-sm">
              Sebelum memulai, lengkapi data
              berikut.
              <br />
              <span className="text-gray-600 text-xs">
                Data hanya diisi satu kali.
              </span>
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8 px-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-2 ${onboardingStep >= s ? "text-amethyst" : "text-gray-600"}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      onboardingStep > s ?
                        "bg-amethyst border-amethyst text-white"
                      : onboardingStep === s ?
                        "border-amethyst text-amethyst"
                      : "border-white/10 text-gray-600"
                    }`}>
                    {onboardingStep > s ? "✓" : s}
                  </div>
                  <span className="text-xs font-medium">
                    {s === 1 ?
                      "Nama Sekretaris"
                    : s === 2 ?
                      "Kode Sekretaris"
                    : "Nama Kelas"}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-px transition-all ${onboardingStep > s ? "bg-amethyst/40" : "bg-white/10"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div className="bg-midnight-2/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Nama Sekretaris Kelas
                    </p>
                    <input
                      type="text"
                      value={namaSekretaris}
                      onChange={(e) =>
                        setNamaSekretaris(
                          e.target.value,
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleSimpanNama()
                      }
                      placeholder="Masukkan nama lengkapmu..."
                      autoFocus
                      className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amethyst/60 transition-colors"
                    />
                  </div>
                  {onboardingError && (
                    <p className="text-xs text-red-400">
                      {onboardingError}
                    </p>
                  )}
                  <button
                    onClick={handleSimpanNama}
                    className="w-full bg-amethyst hover:brightness-110 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-amethyst/20">
                    Lanjut →
                  </button>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4">
                  <div className="bg-amethyst/10 border border-amethyst/20 rounded-xl px-4 py-2.5 text-sm text-white">
                    Halo,{" "}
                    <span className="font-bold text-amethyst">
                      {namaSekretaris}
                    </span>{" "}
                    👋
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Kode Sekretaris
                    </p>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Buat kode unik yang hanya
                      Anda ketahui. Gunakan untuk
                      login di masa depan. Minimal
                      4 karakter.
                    </p>
                    <div className="relative">
                      <input
                        type={
                          showKodeOnboarding ?
                            "text"
                          : "password"
                        }
                        value={
                          kodeSecretarisInput
                        }
                        onChange={(e) =>
                          setKodeSecretarisInput(
                            e.target.value,
                          )
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleSimpanKode()
                        }
                        placeholder="Contoh: ABC123"
                        autoFocus
                        className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amethyst/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowKodeOnboarding(
                            !showKodeOnboarding,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amethyst transition-colors">
                        {showKodeOnboarding ?
                          <EyeOff size={18} />
                        : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {onboardingError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      ⚠️ {onboardingError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOnboardingStep(1);
                        setOnboardingError("");
                      }}
                      className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-xl transition-colors border border-white/10">
                      ← Kembali
                    </button>
                    <button
                      onClick={handleSimpanKode}
                      disabled={onboardingSaving}
                      className="flex-1 bg-amethyst hover:brightness-110 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-amethyst/20 disabled:opacity-60">
                      {onboardingSaving ?
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Memvalidasi...
                        </span>
                      : "Lanjut →"}
                    </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4">
                  <div className="bg-amethyst/10 border border-amethyst/20 rounded-xl px-4 py-2.5 text-sm text-white">
                    Kode{" "}
                    <span className="font-bold text-amethyst">
                      {kodeSecretarisInput}
                    </span>{" "}
                    berhasil disimpan ✓
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Nama Kelas
                    </p>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Masukkan nama kelas sesuai
                      yang dibuat oleh guru. Harus
                      sesuai dengan kode unik yang
                      Anda gunakan saat login.
                    </p>
                    <input
                      type="text"
                      value={inputNamaKelas}
                      onChange={(e) =>
                        setInputNamaKelas(
                          e.target.value,
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleValidasiKelas()
                      }
                      placeholder="Contoh: XII IPA 1"
                      autoFocus
                      className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amethyst/60 transition-colors"
                    />
                  </div>

                  {onboardingError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      ⚠️ {onboardingError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOnboardingStep(2);
                        setOnboardingError("");
                      }}
                      className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-xl transition-colors border border-white/10">
                      ← Kembali
                    </button>
                    <button
                      onClick={
                        handleValidasiKelas
                      }
                      disabled={onboardingSaving}
                      className="flex-1 bg-amethyst hover:brightness-110 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-amethyst/20 disabled:opacity-60">
                      {onboardingSaving ?
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Menyimpan...
                        </span>
                      : "Mulai Absensi →"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-gray-600 mt-4">
            Data ini hanya tersimpan di perangkat
            ini dan tidak dapat diubah.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Login Verification Screen ──────────────────────────────
  if (onboardingStep === 5) {
    return (
      <div className="min-h-screen bg-midnight-dark flex items-center justify-center p-4 font-poppins">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-amethyst/20 border border-amethyst/30 flex items-center justify-center mx-auto mb-4">
              <ClipboardList
                size={28}
                className="text-amethyst"
              />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-white mb-1">
              Selamat Kembali!
            </h1>
            <p className="text-gray-500 text-sm">
              Masukkan kode sekretaris Anda untuk
              melanjutkan.
            </p>
          </div>

          {/* Card */}
          <div className="bg-midnight-2/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            {/* Nama Sekretaris Display */}
            <div className="bg-amethyst/10 border border-amethyst/20 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-amethyst uppercase tracking-widest mb-1">
                Akun
              </p>
              <p className="text-lg font-bold text-white">
                {namaSekretaris}
              </p>
            </div>

            {/* Kode Input */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Kode Sekretaris
              </p>
              <div className="relative">
                <input
                  type={
                    showKodeLogin ? "text" : (
                      "password"
                    )
                  }
                  value={loginKodeInput}
                  onChange={(e) =>
                    setLoginKodeInput(
                      e.target.value,
                    )
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleVerifyLoginKode()
                  }
                  placeholder="Masukkan kode Anda..."
                  autoFocus
                  className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amethyst/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowKodeLogin(
                      !showKodeLogin,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amethyst transition-colors">
                  {showKodeLogin ?
                    <EyeOff size={18} />
                  : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {onboardingError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                ⚠️ {onboardingError}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleLogout}
                className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-xl transition-colors border border-white/10">
                Logout
              </button>
              <button
                onClick={handleVerifyLoginKode}
                disabled={onboardingSaving}
                className="flex-1 bg-amethyst hover:brightness-110 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-amethyst/20 disabled:opacity-60">
                {onboardingSaving ?
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </span>
                : "Masuk →"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Dashboard Utama ─────────────────────────────────────────
  return (
    <main className="min-h-screen bg-midnight-dark p-4 md:p-8 text-white font-poppins">
      {/* Banner Identitas Sekretaris */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-midnight-2/40 border border-white/5 rounded-2xl px-5 py-3 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amethyst/20 flex items-center justify-center">
              <User
                size={15}
                className="text-amethyst"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {namaSekretaris}
              </p>
              <p className="text-[10px] text-gray-500">
                Sekretaris Kelas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Kelas
              </p>
              <p className="text-xs font-bold text-amethyst">
                {namaKelasAktif}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Kode
              </p>
              <p className="text-xs font-bold text-amber-400 tracking-widest">
                {kodeSekretaris}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors border border-white/10 hover:border-white/20">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP: 3 Kolom Grid */}
      <div className="hidden lg:grid max-w-7xl mx-auto grid-cols-3 gap-6 md:gap-8">
        {/* 1. DAFTAR SISWA TERURUT ABJAD */}
        <section className="bg-midnight-2/40 border border-white/5 rounded-4xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
            <Search size={16} /> Cari & Pilih
            Siswa
          </h3>
          <input
            type="text"
            placeholder="Cari nama..."
            className="w-full bg-midnight-dark/60 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-amethyst outline-none mb-4 transition-all"
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
          <div className="space-y-2 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
            {loadingSiswa ?
              <p className="text-gray-500 text-sm text-center py-4">
                Memuat data...
              </p>
            : filteredStudents.map((siswa) => (
                <motion.div
                  key={siswa.id}
                  whileHover={{ x: 5 }}
                  onClick={() =>
                    setSelectedSiswa(siswa)
                  }
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${selectedSiswa?.id === siswa.id ? "bg-amethyst/20 border-amethyst shadow-[0_0_15px_rgba(168,85,247,0.1)]" : "bg-midnight-dark/40 border-white/5 hover:border-white/20"}`}>
                  <div className="text-[10px] font-poppins font-bold text-putih bg-amethyst/10 w-7 h-7 flex items-center justify-center rounded-lg border border-amethyst/20 shrink-0">
                    {siswa.no_absen}
                  </div>
                  <div className="overflow-hidden text-ellipsis">
                    <p className="text-xs font-bold whitespace-nowrap">
                      {siswa.nama}
                    </p>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </section>

        {/* 2. FORM KETERANGAN */}
        <section className="bg-midnight-2/40 border border-white/5 rounded-4xl p-6 backdrop-blur-xl h-fit lg:sticky lg:top-8">
          <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">
            Input Absensi
          </h3>
          <AnimatePresence mode="wait">
            {selectedSiswa || editingItem ?
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={
                  editingItem ?
                    (e) => {
                      e.preventDefault();
                      updateRekapItem();
                    }
                  : tambahKeRekap
                }
                className="space-y-4">
                <div className="p-4 bg-amethyst/10 rounded-2xl border border-amethyst/20">
                  <p className="text-[10px] text-amethyst font-bold uppercase mb-1 tracking-widest">
                    Absen{" "}
                    {editingItem ?
                      editingItem.no_absen
                    : selectedSiswa?.no_absen}
                  </p>
                  <p className="text-base font-bold text-white">
                    {editingItem ?
                      editingItem.nama_siswa
                    : selectedSiswa?.nama}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["Sakit", "Izin", "Alpa"].map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setStatus(t)
                        }
                        className={`py-3 rounded-xl text-[10px] font-bold transition-all ${status === t ? "bg-amethyst text-white shadow-lg" : "bg-midnight-dark/60 text-gray-500 hover:text-white border border-white/5"}`}>
                        {t}
                      </button>
                    ),
                  )}
                </div>

                {status !== "Alpa" && (
                  <textarea
                    required
                    placeholder={`Tulis alasan ${status.toLowerCase()}...`}
                    value={alasan}
                    onChange={(e) =>
                      setAlasan(e.target.value)
                    }
                    className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl p-4 text-xs outline-none focus:border-amethyst min-h-25 transition-all"
                  />
                )}

                {["Sakit", "Izin"].includes(
                  status,
                ) && (
                  <div className="p-4 bg-midnight-dark/60 border border-dashed border-white/10 rounded-xl">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-3">
                      Upload Bukti {status}
                      (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFile(e.target.files[0])
                      }
                      className="text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-white/10 file:text-white cursor-pointer hover:file:bg-white/20"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-amethyst hover:brightness-110 py-4 rounded-2xl text-xs font-bold shadow-lg shadow-amethyst/20 transition-all">
                  {editingItem ?
                    "Simpan Perubahan"
                  : "Tambahkan ke Daftar Rekap"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingItem) {
                      cancelEditRekapItem();
                    } else {
                      setSelectedSiswa(null);
                    }
                  }}
                  className="w-full text-[10px] text-gray-600 hover:text-white font-bold uppercase tracking-widest pt-2 transition-colors">
                  {editingItem ?
                    "Batal Edit"
                  : "Batal"}
                </button>
              </motion.form>
            : <div className="py-24 text-center text-gray-600 text-xs italic space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <User size={20} />
                </div>
                <p>
                  Klik salah satu nama di samping
                  <br />
                  untuk memulai absensi
                </p>
              </div>
            }
          </AnimatePresence>
        </section>

        {/* 3. DAFTAR ANTREAN REKAP */}
        <section className="bg-midnight-2/40 border border-white/5 rounded-4xl p-6 backdrop-blur-xl flex flex-col min-h-125">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList size={16} /> Antrean
              Harian
            </h3>
            <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
              {rekapSiswa.length} Siswa
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar mb-6">
            <AnimatePresence>
              {rekapSiswa.map((item) => (
                <motion.div
                  key={item.tempId}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  className="p-4 bg-midnight-dark/60 border border-white/5 rounded-2xl flex justify-between items-center hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-gray-500 w-4">
                      {item.no_absen}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white leading-none mb-1">
                        {item.nama_siswa}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            (
                              item.status ===
                              "Sakit"
                            ) ?
                              "bg-yellow-500/10 text-yellow-500"
                            : (
                              item.status ===
                              "Izin"
                            ) ?
                              "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                          }`}>
                          {item.status}
                        </span>
                        {item.bukti_file && (
                          <FileText
                            size={10}
                            className="text-amethyst animate-pulse"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        editRekapItem(item)
                      }
                      className="px-3 py-1.5 text-[10px] font-bold text-amethyst hover:bg-amethyst/20 bg-amethyst/10 border border-amethyst/30 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setRekapSiswa(
                          rekapSiswa.filter(
                            (i) =>
                              i.tempId !==
                              item.tempId,
                          ),
                        )
                      }
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {rekapSiswa.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                <ClipboardList
                  size={40}
                  className="mb-2"
                />
                <p className="text-xs italic">
                  Belum ada data antrean
                </p>
              </div>
            )}
          </div>

          <button
            onClick={kirimSemuaLaporan}
            disabled={
              rekapSiswa.length === 0 || loading
            }
            className="w-full bg-white text-midnight-dark font-bold py-4 rounded-2xl hover:bg-amethyst hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-xl">
            {loading ?
              "Mengirim Data..."
            : <>
                <CheckCircle2 size={18} /> Kirim
                Rekap Ke Guru
              </>
            }
          </button>
        </section>
      </div>

      {/* MOBILE: Floating Action Button & Fullscreen Popup */}
      <div className="lg:hidden">
        {/* FAB - Buka Popup */}
        <button
          onClick={() =>
            setIsMobilePopupOpen(true)
          }
          className="fixed bottom-6 right-6 w-16 h-16 bg-amethyst rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform">
          <ClipboardList
            size={28}
            className="text-white"
          />
        </button>

        {/* Fullscreen Popup */}
        <AnimatePresence>
          {isMobilePopupOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-midnight-dark flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">
                  Absensi Kelas
                </h2>
                <button
                  onClick={() =>
                    setIsMobilePopupOpen(false)
                  }
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white">
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                    />
                  </svg>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() =>
                    setMobileActiveTab("list")
                  }
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    mobileActiveTab === "list" ?
                      "text-amethyst border-b-2 border-amethyst"
                    : "text-gray-500"
                  }`}>
                  Daftar Siswa
                </button>
                <button
                  onClick={() =>
                    setMobileActiveTab("form")
                  }
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    mobileActiveTab === "form" ?
                      "text-amethyst border-b-2 border-amethyst"
                    : "text-gray-500"
                  }`}>
                  Form Absensi
                </button>
                <button
                  onClick={() =>
                    setMobileActiveTab("rekap")
                  }
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    mobileActiveTab === "rekap" ?
                      "text-amethyst border-b-2 border-amethyst"
                    : "text-gray-500"
                  }`}>
                  Rekap ({rekapSiswa.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Tab 1: Daftar Siswa */}
                {mobileActiveTab === "list" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      className="w-full bg-midnight-2/60 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-amethyst outline-none mb-4"
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value,
                        )
                      }
                    />
                    {loadingSiswa ?
                      <p className="text-gray-500 text-sm text-center py-8">
                        Memuat data...
                      </p>
                    : filteredStudents.map(
                        (siswa) => (
                          <motion.div
                            key={siswa.id}
                            onClick={() => {
                              setSelectedSiswa(
                                siswa,
                              );
                              setMobileActiveTab(
                                "form",
                              );
                            }}
                            className="p-4 bg-midnight-2/60 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-amethyst/50 transition-all">
                            <div className="text-sm font-bold text-putih bg-amethyst/20 w-10 h-10 flex items-center justify-center rounded-xl border border-amethyst/30 shrink-0">
                              {siswa.no_absen}
                            </div>
                            <p className="text-sm font-bold text-white">
                              {siswa.nama}
                            </p>
                          </motion.div>
                        ),
                      )
                    }
                  </div>
                )}

                {/* Tab 2: Form Absensi */}
                {mobileActiveTab === "form" && (
                  <div className="space-y-4">
                    {selectedSiswa ?
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!selectedSiswa)
                            return;

                          const dataBaru = {
                            tempId: Date.now(),
                            nama_siswa:
                              selectedSiswa.nama,
                            no_absen:
                              selectedSiswa.no_absen,
                            status: status,
                            alasan:
                              (
                                status ===
                                  "Izin" ||
                                status === "Sakit"
                              ) ?
                                alasan
                              : "Tanpa Keterangan",
                            bukti_file: file,
                            kode_kelas:
                              kodeSekretaris,
                            nama_kelas:
                              namaKelasAktif,
                            nama_pelapor:
                              namaSekretaris,
                          };

                          setRekapSiswa([
                            ...rekapSiswa,
                            dataBaru,
                          ]);
                          setAlasan("");
                          setFile(null);
                        }}
                        className="space-y-4">
                        <div className="p-5 bg-amethyst/10 rounded-2xl border border-amethyst/30">
                          <p className="text-xs text-amethyst font-bold uppercase mb-1 tracking-widest">
                            Absen{" "}
                            {
                              selectedSiswa.no_absen
                            }
                          </p>
                          <p className="text-lg font-bold text-white">
                            {selectedSiswa.nama}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            "Sakit",
                            "Izin",
                            "Alpa",
                          ].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setStatus(t)
                              }
                              className={`py-4 rounded-2xl text-sm font-bold transition-all ${status === t ? "bg-amethyst text-white shadow-lg" : "bg-midnight-2/60 text-gray-400 hover:text-white border border-white/10"}`}>
                              {t}
                            </button>
                          ))}
                        </div>

                        {status !== "Alpa" && (
                          <textarea
                            required
                            placeholder={`Tulis alasan ${status.toLowerCase()}...`}
                            value={alasan}
                            onChange={(e) =>
                              setAlasan(
                                e.target.value,
                              )
                            }
                            className="w-full bg-midnight-2/60 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-amethyst min-h-28 transition-all"
                          />
                        )}

                        {[
                          "Sakit",
                          "Izin",
                        ].includes(status) && (
                          <div className="p-4 bg-midnight-2/60 border border-dashed border-white/20 rounded-2xl">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">
                              Upload Bukti{" "}
                              {status}
                              (Opsional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setFile(
                                  e.target
                                    .files[0],
                                )
                              }
                              className="text-xs text-gray-400"
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          onClick={() =>
                            setMobileActiveTab(
                              "rekap",
                            )
                          }
                          className="w-full bg-amethyst hover:brightness-110 py-5 rounded-2xl text-sm font-bold shadow-lg shadow-amethyst/30 transition-all">
                          Tambahkan ke Rekap
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSiswa(null)
                          }
                          className="w-full text-xs text-gray-500 hover:text-white font-bold uppercase tracking-widest pt-4 transition-colors">
                          Batal
                        </button>
                      </motion.form>
                    : <div className="text-center py-16 opacity-50">
                        <User
                          size={48}
                          className="mx-auto mb-4"
                        />
                        <p className="text-sm text-gray-400">
                          Pilih siswa dari tab
                          &quot;Daftar Siswa&quot;
                          terlebih dahulu
                        </p>
                      </div>
                    }
                  </div>
                )}

                {/* Tab 3: Rekap */}
                {mobileActiveTab === "rekap" && (
                  <div className="space-y-3">
                    {rekapSiswa.length === 0 ?
                      <div className="text-center py-16 opacity-50">
                        <ClipboardList
                          size={48}
                          className="mx-auto mb-4"
                        />
                        <p className="text-sm text-gray-400">
                          Belum ada data rekap
                        </p>
                      </div>
                    : <>
                        {rekapSiswa.map(
                          (item) => (
                            <div
                              key={item.tempId}
                              className="p-4 bg-midnight-2/60 border border-white/5 rounded-2xl flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-gray-500">
                                  {item.no_absen}
                                </span>
                                <div>
                                  <p className="text-sm font-bold text-white">
                                    {
                                      item.nama_siswa
                                    }
                                  </p>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-1 rounded mt-1 inline-block ${
                                      (
                                        item.status ===
                                        "Sakit"
                                      ) ?
                                        "bg-yellow-500/20 text-yellow-500"
                                      : (
                                        item.status ===
                                        "Izin"
                                      ) ?
                                        "bg-blue-500/20 text-blue-500"
                                      : "bg-red-500/20 text-red-500"
                                    }`}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    editRekapItem(
                                      item,
                                    );
                                    setMobileActiveTab(
                                      "form",
                                    );
                                  }}
                                  className="px-3 py-1.5 text-[10px] font-bold text-amethyst hover:bg-amethyst/20 bg-amethyst/10 border border-amethyst/30 rounded-lg transition-colors">
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setRekapSiswa(
                                      rekapSiswa.filter(
                                        (i) =>
                                          i.tempId !==
                                          item.tempId,
                                      ),
                                    )
                                  }
                                  className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                  <Trash2
                                    size={18}
                                  />
                                </button>
                              </div>
                            </div>
                          ),
                        )}

                        <button
                          onClick={
                            kirimSemuaLaporan
                          }
                          disabled={
                            rekapSiswa.length ===
                              0 || loading
                          }
                          className="w-full bg-white text-midnight-dark font-bold py-5 rounded-2xl hover:bg-amethyst hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-xl mt-6">
                          {loading ?
                            "Mengirim..."
                          : `Kirim ${rekapSiswa.length} Data ke Guru`
                          }
                        </button>
                      </>
                    }
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Duplicate Warning Popup ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDuplicateWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-midnight-2/95 border border-yellow-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-yellow-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle
                    size={20}
                    className="text-yellow-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Perhatian
                </h3>
              </div>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">
                {duplicateWarningMessage}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateWarning(
                      false,
                    );
                    setTempEditData(null);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-colors">
                  Batal
                </button>
                <button
                  onClick={handleConfirmDuplicate}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl transition-colors shadow-lg shadow-yellow-500/20">
                  Lanjutkan Tambah
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
