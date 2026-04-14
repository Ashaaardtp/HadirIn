"use client";

export const dynamic = "force-dynamic";

import React, {
  useState,
  useEffect,
} from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  User,
  Key,
  AlertCircle,
  ClipboardList,
  LogOut,
  TrendingUp,
  Camera,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  X,
  Users,
} from "lucide-react";
import createClient from "@/utils/supabase/client";

export default function WalikelasDashboard() {
  const [profile, setProfile] = useState(null);
  const [kodeInput, setKodeInput] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [laporanAbsensi, setLaporanAbsensi] =
    useState([]);
  const [chartView, setChartView] =
    useState("summary");
  const [expandedDate, setExpandedDate] =
    useState(null);
  const [popupDate, setPopupDate] = useState(null);
  const [avatarUrl, setAvatarUrl] =
    useState(null);
  const [namaKelas, setNamaKelas] = useState("");
  const [
    isNamaKelasLocked,
    setIsNamaKelasLocked,
  ] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);
  const [savingKode, setSavingKode] =
    useState(false);
  const supabase = createClient();

  // Helper: Generate kode unik 6 digit
  const generateUniqueCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(
        Math.floor(
          Math.random() * characters.length,
        ),
      );
    }
    return code;
  };

  // Handler: Simpan kode kelas ke Supabase
  const handleSimpanKode = async () => {
    if (!kodeInput.trim() || !profile?.id) return;
    setSavingKode(true);

    const trimmedKode = kodeInput.trim();

    const { error } = await supabase
      .from("profiles")
      .update({ kode_kelas: trimmedKode })
      .eq("id", profile.id);

    if (error) {
      alert(
        "Gagal menyimpan kode: " + error.message,
      );
      setSavingKode(false);
      return;
    }

    setIsLocked(true);
    setSavingKode(false);

    // Re-fetch absensi setelah kode disimpan
    if (namaKelas) {
      let query = supabase
        .from("absensi")
        .select("*")
        .eq("kode_kelas", trimmedKode)
        .eq("nama_kelas", namaKelas)
        .order("created_at", {
          ascending: false,
        });
      const { data } = await query;
      setLaporanAbsensi(data || []);
    }
  };

  // Handler: Generate dan fill kode otomatis
  const handleGenerateKode = () => {
    if (!isLocked) {
      const newCode = generateUniqueCode();
      setKodeInput(newCode);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      setAvatarUrl(
        data.publicUrl + "?t=" + Date.now(),
      );
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", profile.id);
    }
    setUploadingAvatar(false);
  };

  // Group laporanAbsensi by date
  const groupedByDate = React.useMemo(() => {
    const groups = {};
    laporanAbsensi.forEach((item) => {
      const dateKey = new Date(
        item.created_at,
      ).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return groups;
  }, [laporanAbsensi]);

  const groupedDates = Object.keys(groupedByDate);

  useEffect(() => {
    const fetchAbsensi = async (
      kodeKelas,
      namaKelasVal,
    ) => {
      // Double protection: filter by kode_kelas AND nama_kelas
      let query = supabase
        .from("absensi")
        .select("*")
        .eq("kode_kelas", kodeKelas)
        .order("created_at", {
          ascending: false,
        });

      if (namaKelasVal) {
        query = query.eq(
          "nama_kelas",
          namaKelasVal,
        );
      }

      const { data } = await query;
      setLaporanAbsensi(data || []);
    };

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        setProfile(profileData);
        if (profileData?.avatar_url)
          setAvatarUrl(profileData.avatar_url);
        if (profileData?.nama_kelas) {
          setNamaKelas(profileData.nama_kelas);
          setIsNamaKelasLocked(true);
        }

        if (profileData?.kode_kelas) {
          setKodeInput(profileData.kode_kelas);
          setIsLocked(true);

          // Gunakan double filter: kode_kelas + nama_kelas (jika sudah ada)
          await fetchAbsensi(
            profileData.kode_kelas,
            profileData.nama_kelas || null,
          );
        }
      }
    };

    fetchData();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "absensi",
        },
        (payload) => {
          // Filter realtime: hanya tambahkan jika kode_kelas dan nama_kelas cocok
          setLaporanAbsensi((prev) => {
            const currentKode =
              prev[0]?.kode_kelas || kodeInput;
            const currentNama =
              prev[0]?.nama_kelas;

            const kodeMatch =
              payload.new.kode_kelas ===
              currentKode;
            const namaMatch =
              !currentNama ||
              payload.new.nama_kelas ===
                currentNama;

            if (kodeMatch && namaMatch) {
              return [payload.new, ...prev];
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [kodeInput, supabase]);

  const getLatestDate = () => {
    if (laporanAbsensi.length === 0) return null;
    return new Date(laporanAbsensi[0].created_at);
  };

  const latestDate = getLatestDate();

  const getChartData = () => {
    if (chartView === "summary") {
      return [
        {
          name: "Sakit",
          value: laporanAbsensi.filter(
            (a) => a.status === "Sakit",
          ).length,
          color: "#FBBF24",
          desc: "Dengan Surat Keterangan",
        },
        {
          name: "Izin",
          value: laporanAbsensi.filter(
            (a) => a.status === "Izin",
          ).length,
          color: "#60A5FA",
          desc: "Izin tanpa Keterangan Rinci",
        },
        {
          name: "Alpa",
          value: laporanAbsensi.filter(
            (a) => a.status === "Alpa",
          ).length,
          color: "#EF4444",
          desc: "Tidak Ada Penjelasan",
        },
      ];
    } else if (chartView === "daily") {
      const dailyMap = {};
      laporanAbsensi.forEach((item) => {
        const date = new Date(
          item.created_at,
        ).toLocaleDateString("id-ID", {
          month: "short",
          day: "numeric",
        });
        if (!dailyMap[date]) {
          dailyMap[date] = {
            date,
            Sakit: 0,
            Izin: 0,
            Alpa: 0,
            total: 0,
          };
        }
        dailyMap[date][item.status]++;
        dailyMap[date].total++;
      });
      return Object.values(dailyMap);
    } else if (chartView === "weekly") {
      const weeklyMap = {};
      laporanAbsensi.forEach((item) => {
        const date = new Date(item.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(
          date.getDate() - date.getDay(),
        );
        const weekLabel =
          weekStart.toLocaleDateString("id-ID", {
            month: "short",
            day: "numeric",
          }) +
          " - " +
          new Date(
            weekStart.getTime() +
              6 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("id-ID", {
            month: "short",
            day: "numeric",
          });

        if (!weeklyMap[weekLabel]) {
          weeklyMap[weekLabel] = {
            week: weekLabel,
            Sakit: 0,
            Izin: 0,
            Alpa: 0,
            total: 0,
          };
        }
        weeklyMap[weekLabel][item.status]++;
        weeklyMap[weekLabel].total++;
      });
      return Object.values(weeklyMap);
    } else if (chartView === "percentage") {
      const totalSiswa = 30;
      const totalAbsensi = new Set(
        laporanAbsensi.map((a) => a.nama_siswa),
      ).size;
      const hadirPersentase = Math.round(
        ((totalSiswa - totalAbsensi) /
          totalSiswa) *
          100,
      );
      const absensiPersentase = Math.round(
        (totalAbsensi / totalSiswa) * 100,
      );

      return [
        {
          name: "Hadir",
          value: hadirPersentase,
          color: "#10B981",
        },
        {
          name: "Tidak Hadir",
          value: absensiPersentase,
          color: "#EF4444",
        },
      ];
    }
  };

  const chartData = getChartData();

  return (
    <motion.main
      className="min-h-screen bg-midnight-dark p-4 md:p-8 text-white font-poppins"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* BARIS ATAS: PROFIL & STATISTIK */}
        <div className="space-y-4">
          <div className="flex justify-center">
            {/* Box Profil */}
            <section className="bg-midnight-2/40 border border-white/5 p-5 rounded-4xl backdrop-blur-xl flex flex-col items-center min-h-80 w-full max-w-md">
              {/* Avatar */}
              <label
                className="relative cursor-pointer group mt-2"
                title="Klik untuk ganti foto profil">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
                <motion.div
                  className="w-24 h-24 rounded-3xl overflow-hidden bg-amethyst/20 border-2 border-amethyst/30 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}>
                  {avatarUrl ?
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  : <User
                      size={36}
                      className="text-amethyst"
                    />
                  }
                </motion.div>
                <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ?
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span className="text-[9px] text-white font-bold">
                        Uploading...
                      </span>
                    </div>
                  : <div className="flex flex-col items-center gap-1">
                      <Camera
                        size={16}
                        className="text-white"
                      />
                      <span className="text-[9px] text-white font-bold">
                        Upload Foto
                      </span>
                    </div>
                  }
                </div>
              </label>

              {/* Nama & Email */}
              <h1 className="font-playfair text-xl font-bold mt-4 text-center leading-tight">
                {profile?.nama_lengkap ||
                  "Memuat..."}
              </h1>
              <p className="text-gray-500 text-xs mt-1 text-center">
                {profile?.email}
              </p>

              <div className="w-full border-t border-white/5 my-5" />

              {/* Input Nama Kelas — hanya bisa diisi sekali */}
              <div className="w-full">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
                  Nama Kelas
                </p>
                {isNamaKelasLocked ?
                  <div className="w-full bg-midnight-dark/40 border border-white/8 rounded-xl px-4 py-2.5 text-center">
                    <p className="text-sm font-semibold text-white">
                      {namaKelas}
                    </p>
                  </div>
                : <div className="flex gap-2">
                    <input
                      type="text"
                      value={namaKelas}
                      onChange={(e) =>
                        setNamaKelas(
                          e.target.value,
                        )
                      }
                      placeholder="Contoh: XII IPA 1"
                      className="flex-1 bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amethyst/50 transition-colors text-center"
                    />
                    <button
                      onClick={async () => {
                        if (
                          !namaKelas.trim() ||
                          !profile?.id
                        )
                          return;
                        const trimmed =
                          namaKelas.trim();

                        // 1. Simpan ke database
                        const { error } =
                          await supabase
                            .from("profiles")
                            .update({
                              nama_kelas: trimmed,
                            })
                            .eq("id", profile.id);

                        if (!error) {
                          // 2. UPDATE STATE PROFILE (Penting agar data sinkron)
                          setProfile((prev) => ({
                            ...prev,
                            nama_kelas: trimmed,
                          }));
                          setNamaKelas(trimmed);
                          setIsNamaKelasLocked(
                            true,
                          );

                          // 3. Fetch ulang data absensi yang benar-benar milik kelas ini
                          if (kodeInput) {
                            const { data } =
                              await supabase
                                .from("absensi")
                                .select("*")
                                .eq(
                                  "kode_kelas",
                                  kodeInput,
                                )
                                .eq(
                                  "nama_kelas",
                                  trimmed,
                                ) // Filter ganda
                                .order(
                                  "created_at",
                                  {
                                    ascending: false,
                                  },
                                );
                            setLaporanAbsensi(
                              data || [],
                            );
                          }
                        }
                      }}
                      className="px-3 py-2.5 bg-amethyst/80 hover:bg-amethyst text-white text-xs font-bold rounded-xl transition-colors shrink-0">
                      Simpan
                    </button>
                  </div>
                }
              </div>

              {/* Kode Kelas — paling bawah tengah */}
              <div className="mt-auto pt-3 flex flex-col items-center w-full">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Identitas Kelas - Kode Unik
                </p>
                {isLocked ?
                  <div className="bg-midnight-dark/40 border border-amber-500/25 rounded-2xl px-6 py-3 text-center w-full space-y-1.5">
                    <p className="text-amber-400 font-bold text-xl tracking-[0.25em]">
                      {kodeInput}
                    </p>
                    {namaKelas && (
                      <p className="text-amber-400/60 text-xs font-medium tracking-wide">
                        {namaKelas}
                      </p>
                    )}
                    <p className="text-[9px] text-amber-400/50 italic">
                      ✓ Kode disimpan & terkunci
                    </p>
                  </div>
                : <div className="space-y-2 w-full">
                    <div className="bg-midnight-dark/60 border border-white/10 rounded-2xl px-4 py-3 text-center w-full focus-within:border-amber-500/50 transition-colors">
                      <input
                        type="text"
                        value={kodeInput}
                        onChange={(e) =>
                          setKodeInput(
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="MASUKKAN KODE ATAU AUTO-GENERATE"
                        className="bg-transparent text-amber-400 font-bold text-lg tracking-[0.25em] text-center focus:outline-none w-full placeholder-gray-600"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={
                          handleGenerateKode
                        }
                        disabled={savingKode}
                        className="flex-1 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors border border-white/10 disabled:opacity-50">
                        Auto-Generate
                      </button>
                      <button
                        onClick={handleSimpanKode}
                        disabled={
                          savingKode ||
                          !kodeInput.trim()
                        }
                        className="flex-1 px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                        {savingKode ?
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        : <>✓ Simpan Kode</>}
                      </button>
                    </div>
                  </div>
                }
                <p className="text-[9px] text-gray-500 mt-2 text-center">
                  {isLocked ?
                    "Kode perlu Anda bagikan kepada siswa"
                  : "Kode hanya bisa disimpan 1 kali"
                  }
                </p>
              </div>
            </section>
          </div>

          {/* Chart Ringkasan Absensi */}
          <section className="bg-midnight-2/40 border border-white/5 p-4 rounded-4xl backdrop-blur-xl">
            <div className="mb-3">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-playfair text-lg font-bold mb-1 flex items-center gap-2">
                    <TrendingUp
                      size={18}
                      className="text-amethyst"
                    />{" "}
                    {chartView === "summary" ?
                      "Ringkasan Status Absensi"
                    : chartView === "daily" ?
                      "Absensi Harian"
                    : chartView === "weekly" ?
                      "Absensi Mingguan"
                    : "Persentase Kehadiran Kelas"
                    }
                  </h3>
                  {latestDate && (
                    <motion.p
                      key={latestDate.toString()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-400">
                      Update:{" "}
                      {latestDate.toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}{" "}
                      pukul{" "}
                      {latestDate.toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Sorting Buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  {
                    id: "summary",
                    label: "Status",
                  },
                  {
                    id: "daily",
                    label: "Harian",
                  },
                  {
                    id: "weekly",
                    label: "Mingguan",
                  },
                  {
                    id: "percentage",
                    label: "Persentase",
                  },
                ].map((view) => (
                  <motion.button
                    key={view.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setChartView(view.id)
                    }
                    className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                      chartView === view.id ?
                        "bg-amethyst text-white shadow-lg shadow-amethyst/20"
                      : "bg-midnight-dark/60 text-gray-400 hover:text-white border border-white/10"
                    }`}>
                    {view.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Conditional Chart Render */}
            <motion.div
              key={chartView}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-48 sm:h-64 md:h-80 min-h-48">
              {chartView === "summary" ?
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 8,
                      right: 8,
                      left: -20,
                      bottom: 0,
                    }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={10}
                      allowDecimals={false}
                      tickCount={4}
                      tickLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "transparent",
                        border: "none",
                        boxShadow: "none",
                      }}
                      labelStyle={{
                        display: "none",
                      }}
                      itemStyle={{
                        display: "none",
                      }}
                      cursor={{
                        fill: "rgba(255,255,255,0.03)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={64}>
                      {chartData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              : chartView === "percentage" ?
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 8,
                      left: -20,
                      bottom: 0,
                    }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={10}
                      allowDecimals={false}
                      tickCount={4}
                      tickLine={false}
                      width={28}
                      tickFormatter={(v) =>
                        `${v}%`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "transparent",
                        border: "none",
                        boxShadow: "none",
                      }}
                      labelStyle={{
                        display: "none",
                      }}
                      itemStyle={{
                        display: "none",
                      }}
                      cursor={{
                        fill: "rgba(255,255,255,0.03)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={80}
                      label={{
                        position: "top",
                        fill: "#ffffff",
                        fontSize: 11,
                        fontWeight: "bold",
                        formatter: (value) =>
                          `${value}%`,
                      }}>
                      {chartData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              : <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 8,
                      right: 8,
                      left: -20,
                      bottom: 40,
                    }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey={
                        chartView === "daily" ?
                          "date"
                        : "week"
                      }
                      stroke="#9ca3af"
                      fontSize={9}
                      angle={-35}
                      textAnchor="end"
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={10}
                      allowDecimals={false}
                      tickCount={4}
                      tickLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#1a1a1a",
                        borderRadius: "10px",
                        border:
                          "1px solid rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        fontSize: 11,
                      }}
                      formatter={(value) => [
                        `${value}`,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="Sakit"
                      stroke="#FBBF24"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Izin"
                      stroke="#60A5FA"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Alpa"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
            </motion.div>

            {/* Info Legend untuk Summary View */}
            {chartView === "summary" && (
              <div className="flex flex-col md:flex-row gap-2 mt-3">
                <AnimatePresence>
                  {chartData.map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: idx * 0.1,
                      }}
                      className="flex-1 p-2.5 bg-midnight-dark/40 rounded-2xl border border-white/5 min-w-0 flex flex-col gap-0.5">
                      {/* Dot + Nama */}
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        />
                        <span className="text-[10px] font-bold text-white">
                          {item.name}
                        </span>
                      </div>
                      {/* Angka */}
                      <p className="text-xl font-bold text-white leading-none">
                        {item.value}
                      </p>
                      {/* Deskripsi */}
                      <p className="text-[8px] text-gray-500 leading-snug">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* POPUP MODAL — Fullscreen saat klik tanggal */}
        <AnimatePresence>
          {popupDate && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col bg-midnight-dark backdrop-blur-xl"
              style={{ paddingTop: "env(safe-area-inset-top)" }}>

              {/* Header Popup */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amethyst/15 flex items-center justify-center">
                    <ClipboardList className="text-amethyst" size={18} />
                  </div>
                  <div>
                    <p className="font-playfair font-bold text-white text-base leading-tight">
                      {popupDate}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {groupedByDate[popupDate]?.length ?? 0} siswa tidak masuk
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setPopupDate(null)}
                  className="w-10 h-10 rounded-2xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors border border-white/10">
                  <X size={18} className="text-gray-300" />
                </motion.button>
              </div>

              {/* Summary Badge Bar */}
              <div className="flex gap-2 px-5 pt-4 pb-2">
                {["Sakit", "Izin", "Alpa"].map((status) => {
                  const count = groupedByDate[popupDate]?.filter(
                    (l) => l.status === status
                  ).length ?? 0;
                  const colors = {
                    Sakit: "bg-yellow-500/15 border-yellow-500/25 text-yellow-400",
                    Izin:  "bg-blue-500/15 border-blue-500/25 text-blue-400",
                    Alpa:  "bg-red-500/15 border-red-500/25 text-red-400",
                  };
                  return (
                    <div
                      key={status}
                      className={`flex-1 flex flex-col items-center py-3 rounded-2xl border ${colors[status]}`}>
                      <span className="text-2xl font-bold leading-none">{count}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80">{status}</span>
                    </div>
                  );
                })}
              </div>

              {/* List Siswa — scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {groupedByDate[popupDate]?.map((lapor, idx) => (
                  <motion.div
                    key={lapor.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-2xl border p-4 ${
                      lapor.status === "Sakit"
                        ? "bg-yellow-500/5 border-yellow-500/15"
                        : lapor.status === "Izin"
                        ? "bg-blue-500/5 border-blue-500/15"
                        : "bg-red-500/5 border-red-500/15"
                    }`}>

                    {/* Row atas: nama + badge + jam */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white leading-tight">
                          {lapor.nama_siswa}
                        </p>
                        {lapor.nama_pelapor && (
                          <span className="text-[10px] text-amber-400/80">
                            Dilaporkan oleh {lapor.nama_pelapor}
                          </span>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {new Date(lapor.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} WIB
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide ${
                          lapor.status === "Sakit"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : lapor.status === "Izin"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                        {lapor.status}
                      </span>
                    </div>

                    {/* Alasan */}
                    {lapor.alasan && (
                      <p className="text-xs text-gray-400 italic mt-3 leading-relaxed border-t border-white/5 pt-3">
                        &quot;{lapor.alasan}&quot;
                      </p>
                    )}

                    {/* Tombol bukti */}
                    {lapor.bukti_file && (
                      <div className="mt-3">
                        <a
                          href={lapor.bukti_file}
                          download={`bukti_${lapor.nama_siswa}_${lapor.status}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 px-4 py-2 bg-amber-500/15 border border-amber-500/30 rounded-xl transition-colors">
                          <FileText size={13} />
                          Lihat Bukti
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Tombol tutup bawah */}
              <div className="px-5 py-4 border-t border-white/5" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPopupDate(null)}
                  className="w-full py-3.5 rounded-2xl bg-white/8 hover:bg-white/12 text-white text-sm font-bold transition-colors border border-white/10">
                  Tutup
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BARIS BAWAH: LAPORAN + SISWA ALPA */}
        <div className="grid grid-cols-1 gap-6">
          {/* KOLOM KIRI: Laporan Masuk */}
          <section className="bg-midnight-2/40 border border-white/5 p-5 rounded-4xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList
                  className="text-amethyst"
                  size={18}
                />
                <h2 className="font-playfair text-lg font-bold">
                  Laporan Masuk
                </h2>
              </div>
              <span className="px-3 py-1 bg-amethyst/10 text-amethyst rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Live
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {groupedDates.length > 0 ?
                  groupedDates.map((dateKey) => {
                    const records = groupedByDate[dateKey];
                    const sakitCount = records.filter(r => r.status === "Sakit").length;
                    const izinCount  = records.filter(r => r.status === "Izin").length;
                    const alpaCount  = records.filter(r => r.status === "Alpa").length;
                    return (
                      <motion.button
                        key={dateKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPopupDate(dateKey)}
                        className="w-full bg-midnight-dark/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amethyst/30 hover:bg-amethyst/5 transition-all text-left">
                        <div className="flex items-center justify-between px-4 py-4">
                          {/* Kiri */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amethyst/10 flex items-center justify-center shrink-0">
                              <ClipboardList className="text-amethyst" size={15} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-white">{dateKey}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {records.length} siswa · Tap untuk detail
                              </p>
                            </div>
                          </div>

                          {/* Kanan: mini badge pills + arrow */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {sakitCount > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-400 text-[10px] font-bold border border-yellow-500/20">
                                {sakitCount}S
                              </span>
                            )}
                            {izinCount > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                                {izinCount}I
                              </span>
                            )}
                            {alpaCount > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/20">
                                {alpaCount}A
                              </span>
                            )}
                            <ChevronDown size={14} className="text-amethyst ml-1 -rotate-90" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                : <div className="py-16 text-center text-gray-600 italic text-sm">
                    Belum ada laporan masuk dari
                    siswa hari ini.
                  </div>
                }
              </AnimatePresence>
            </div>
          </section>

          {/* KOLOM KANAN: Siswa Alpa > 2 Kali */}
          <section className="bg-midnight-2/40 border border-white/5 p-5 rounded-4xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle
                className="text-red-400"
                size={18}
              />
              <h2 className="font-playfair text-lg font-bold">
                Alpa Berulang
              </h2>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
              Siswa dengan alpa lebih dari 2 kali
            </p>

            {(() => {
              // Hitung jumlah alpa per siswa
              const alpaCount = {};
              laporanAbsensi
                .filter(
                  (a) => a.status === "Alpa",
                )
                .forEach((a) => {
                  alpaCount[a.nama_siswa] =
                    (alpaCount[a.nama_siswa] ||
                      0) + 1;
                });

              const siswaAlpa = Object.entries(
                alpaCount,
              )
                .filter(([, count]) => count > 2)
                .sort((a, b) => b[1] - a[1]);

              return siswaAlpa.length > 0 ?
                  <div className="space-y-2">
                    <AnimatePresence>
                      {siswaAlpa.map(
                        ([nama, count], idx) => (
                          <motion.div
                            key={nama}
                            initial={{
                              opacity: 0,
                              x: 10,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: idx * 0.05,
                            }}
                            className="flex items-center justify-between gap-3 bg-red-500/5 border border-red-500/15 px-4 py-3 rounded-xl">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                <User
                                  size={13}
                                  className="text-red-400"
                                />
                              </div>
                              <p className="text-sm font-semibold text-white truncate">
                                {nama}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-lg">
                              <span className="text-red-400 font-bold text-sm">
                                {count}x
                              </span>
                              <span className="text-[10px] text-red-400/70 font-medium">
                                alpa
                              </span>
                            </div>
                          </motion.div>
                        ),
                      )}
                    </AnimatePresence>
                  </div>
                : <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle
                        size={22}
                        className="text-amber-400"
                      />
                    </div>
                    <p className="text-sm font-semibold text-amber-400">
                      Semua Aman
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Tidak ada siswa dengan alpa
                      berulang
                    </p>
                  </div>;
            })()}
          </section>
        </div>
      </div>
    </motion.main>
  );
}