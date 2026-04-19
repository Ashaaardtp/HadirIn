"use client";

export const dynamic = "force-dynamic";

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
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
  Legend,
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
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import createClient from "@/utils/supabase/client";
import * as XLSX from "xlsx"; // Import library xlsx

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
  const [popupDate, setPopupDate] =
    useState(null);
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
  const [
    selectedExportDate,
    setSelectedExportDate,
  ] = useState(null);
  const [showDatePicker, setShowDatePicker] =
    useState(false);
  const [showChartModal, setShowChartModal] =
    useState(false);
  const [
    showSekretarisPopup,
    setShowSekretarisPopup,
  ] = useState(false);
  const [
    namaSekretarisInput,
    setNamaSekretarisInput,
  ] = useState("");
  const [
    kodeSekretarisInput,
    setKodeSekretarisInput,
  ] = useState("");
  const [savingSekretaris, setSavingSekretaris] =
    useState(false);
  const supabase = createClient();
  const router = useRouter();
  const [
    showDuplicateError,
    setShowDuplicateError,
  ] = useState(false);
  const [sekretarisList, setSekretarisList] =
    useState([]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/?auth=required");
      }
    };
    checkUser();
  }, [router, supabase]);
  const [
    loadingSekretaris,
    setLoadingSekretaris,
  ] = useState(false);
  const [showStatistik, setShowStatistik] =
    useState(false);
  const [showCsvUpload, setShowCsvUpload] =
    useState(false);
  const [csvUploading, setCsvUploading] =
    useState(false);
  const [csvResult, setCsvResult] =
    useState(null); // { success, errors, error }

  // Handler: Import Data Siswa dari CSV
  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    setCsvResult(null);

    let text;
    try {
      text = await file.text();
    } catch {
      setCsvResult({
        error:
          "Gagal membaca file. Pastikan format file adalah .csv",
      });
      setCsvUploading(false);
      return;
    }

    const lines = text
      .trim()
      .split("\n")
      .map((l) => l.replace(/\r/g, "").trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setCsvResult({
        error:
          "File CSV kosong atau tidak memiliki data siswa.",
      });
      setCsvUploading(false);
      return;
    }

    // Validasi header
    const header = lines[0].toLowerCase();
    const expectedHeader =
      "nama,no_absen,kode_kelas,nama_kelas,jenis_kelamin";
    if (header !== expectedHeader) {
      setCsvResult({
        error: `Format kolom tidak sesuai. Kolom yang diharapkan:\n${expectedHeader}`,
      });
      setCsvUploading(false);
      e.target.value = "";
      return;
    }

    const rows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length !== 5) {
        errors.push(
          `Baris ${i + 1}: jumlah kolom tidak sesuai (${cols.length} kolom ditemukan, butuh 5)`,
        );
        continue;
      }

      const [
        nama,
        no_absen,
        kode_kelas,
        nama_kelas,
        jenis_kelamin,
      ] = cols.map((c) => c.trim());

      if (
        !nama ||
        !no_absen ||
        !kode_kelas ||
        !nama_kelas ||
        !jenis_kelamin
      ) {
        errors.push(
          `Baris ${i + 1}: ada kolom yang kosong`,
        );
        continue;
      }

      const noAbsenParsed = parseInt(no_absen);
      if (isNaN(noAbsenParsed)) {
        errors.push(
          `Baris ${i + 1}: no_absen harus berupa angka`,
        );
        continue;
      }

      const jkUpper = jenis_kelamin.toUpperCase();
      if (jkUpper !== "L" && jkUpper !== "P") {
        errors.push(
          `Baris ${i + 1}: jenis_kelamin harus "L" atau "P"`,
        );
        continue;
      }

      rows.push({
        nama,
        no_absen: noAbsenParsed,
        kode_kelas,
        nama_kelas,
        jenis_kelamin: jkUpper,
      });
    }

    if (rows.length === 0) {
      setCsvResult({
        error:
          "Tidak ada data valid yang dapat diimport.",
        errors,
      });
      setCsvUploading(false);
      e.target.value = "";
      return;
    }

    const { error: insertError } = await supabase
      .from("siswa")
      .insert(rows);

    if (insertError) {
      setCsvResult({
        error:
          "Gagal menyimpan ke database: " +
          insertError.message,
        errors,
      });
    } else {
      setCsvResult({
        success: rows.length,
        errors,
      });
    }

    setCsvUploading(false);
    e.target.value = "";
  };

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

    // Cek apakah kode sudah digunakan oleh pengguna lain
    const { data: existingProfile } =
      await supabase
        .from("profiles")
        .select("id, nama_lengkap")
        .eq("kode_kelas", trimmedKode)
        .neq("id", profile.id)
        .single();

    if (existingProfile) {
      setShowDuplicateError(true);
      setSavingKode(false);
      return;
    }

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

  const handleSimpanSekretaris = async () => {
    if (
      !namaSekretarisInput.trim() ||
      !kodeSekretarisInput.trim() ||
      !kodeInput.trim() ||
      !namaKelas.trim()
    ) {
      alert("Mohon lengkapi semua data.");
      return;
    }
    setSavingSekretaris(true);

    const { error } = await supabase
      .from("sekretaris")
      .insert([
        {
          nama_sekretaris:
            namaSekretarisInput.trim(),
          kode_sekretaris: kodeSekretarisInput
            .trim()
            .toUpperCase(),
          nama_kelas: namaKelas.trim(),
          kode_kelas: kodeInput.trim(),
        },
      ]);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      setSavingSekretaris(false);
      return;
    }

    alert("Sekretaris berhasil dibuat!");
    setNamaSekretarisInput("");
    setKodeSekretarisInput("");
    setShowSekretarisPopup(false);
    setSavingSekretaris(false);

    // Fetch ulang data sekretaris setelah disimpan
    await fetchSekretaris(kodeInput.trim());
  };

  // Fungsi Ekspor ke Excel
  const exportToExcel = useCallback(async () => {
    if (!selectedExportDate) {
      alert(
        "Silakan pilih tanggal untuk diekspor terlebih dahulu.",
      );
      return;
    }

    if (laporanAbsensi.length === 0) {
      alert(
        "Tidak ada data absensi untuk diekspor.",
      );
      return;
    }

    // Ambil semua siswa dari database
    const { data: siswaList } = await supabase
      .from("siswa")
      .select("*")
      .eq("kode_kelas", kodeInput)
      .order("no_absen", { ascending: true });

    if (!siswaList || siswaList.length === 0) {
      alert("Data siswa tidak ditemukan.");
      return;
    }

    // Filter absensi hanya untuk tanggal yang dipilih
    const filteredAbsensi = laporanAbsensi.filter(
      (item) => {
        const dateKey = new Date(
          item.created_at,
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        return dateKey === selectedExportDate;
      },
    );

    if (filteredAbsensi.length === 0) {
      alert(
        "Tidak ada data absensi untuk tanggal yang dipilih.",
      );
      return;
    }

    // Style helpers
    const headerStyle = {
      fill: { fgColor: { rgb: "4F46E5" } },
      font: {
        color: { rgb: "FFFFFF" },
        bold: true,
        sz: 12,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: {
          style: "thin",
          color: { rgb: "000000" },
        },
        bottom: {
          style: "thin",
          color: { rgb: "000000" },
        },
        left: {
          style: "thin",
          color: { rgb: "000000" },
        },
        right: {
          style: "thin",
          color: { rgb: "000000" },
        },
      },
    };

    const cellStyle = {
      alignment: { vertical: "center" },
      border: {
        top: {
          style: "thin",
          color: { rgb: "000000" },
        },
        bottom: {
          style: "thin",
          color: { rgb: "000000" },
        },
        left: {
          style: "thin",
          color: { rgb: "000000" },
        },
        right: {
          style: "thin",
          color: { rgb: "000000" },
        },
      },
    };

    const hadirStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: "D1FAE5" } },
    };

    const sakitStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: "FEF3C7" } },
    };

    const izinStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: "DBEAFE" } },
    };

    const alpaStyle = {
      ...cellStyle,
      fill: { fgColor: { rgb: "FEE2E2" } },
    };

    // Helper untuk apply style ke range
    const applyStyleToRange = (
      ws,
      rangeRef,
      style,
    ) => {
      if (!rangeRef || !ws) return;
      let range;
      if (typeof rangeRef === "string") {
        range = XLSX.utils.decode_range(rangeRef);
      } else if (rangeRef.s && rangeRef.e) {
        range = rangeRef;
      } else {
        return;
      }
      const start = range.s;
      const end = range.e;
      for (let R = start.r; R <= end.r; R++) {
        for (let C = start.c; C <= end.c; C++) {
          const cellAddress =
            XLSX.utils.encode_cell({
              r: R,
              c: C,
            });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = style;
        }
      }
    };

    // Helper apply header style
    const applyHeaderStyle = (
      ws,
      startRow,
      endRow,
      colCount,
    ) => {
      for (let c = 0; c < colCount; c++) {
        const cell =
          ws[
            XLSX.utils.encode_cell({
              r: startRow,
              c,
            })
          ];
        if (cell) cell.s = headerStyle;
      }
    };

    // Helper apply status style
    const applyStatusStyle = (
      ws,
      statusCol,
      startRow,
      data,
    ) => {
      data.forEach((item, idx) => {
        const statusCell =
          ws[
            XLSX.utils.encode_cell({
              r: startRow + 1 + idx,
              c: statusCol,
            })
          ];
        if (statusCell) {
          if (item.Status === "Hadir")
            statusCell.s = hadirStyle;
          else if (item.Status === "Sakit")
            statusCell.s = sakitStyle;
          else if (item.Status === "Izin")
            statusCell.s = izinStyle;
          else if (item.Status === "Alpa")
            statusCell.s = alpaStyle;
        }
      });
    };

    const workbook = XLSX.utils.book_new();

    // Prepare data untuk tanggal yang dipilih
    const absentMap = {};
    filteredAbsensi.forEach((a) => {
      absentMap[a.nama_siswa] = a;
    });

    // Cari jam pertama laporan di hari yang dipilih
    const firstReportTime =
      filteredAbsensi.length > 0 ?
        new Date(
          filteredAbsensi[
            filteredAbsensi.length - 1
          ].created_at,
        ).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    // Cari nama pelapor pertama di hari yang dipilih
    const firstReporterName =
      filteredAbsensi.length > 0 ?
        filteredAbsensi[
          filteredAbsensi.length - 1
        ].nama_pelapor || "-"
      : "-";

    const dayData = siswaList.map((siswa) => {
      const absen = absentMap[siswa.nama];
      return {
        Tanggal: selectedExportDate,
        Jam:
          absen ?
            new Date(
              absen.created_at,
            ).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : firstReportTime,
        "No Absen": siswa.no_absen,
        "Nama Siswa": siswa.nama,
        "Jenis Kelamin":
          siswa.jenis_kelamin || "-",
        Status: absen ? absen.status : "Hadir",
        Keterangan: absen?.alasan || "-",
        "Nama Pelapor":
          absen?.nama_pelapor ||
          firstReporterName,
        Bukti: absen?.bukti_file || "-",
        "Nama Kelas": namaKelas || "-",
      };
    });

    // Format tanggal untuk header
    const formattedDate = new Date(
      selectedExportDate
        .split("/")
        .reverse()
        .join("-"),
    ).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create title and data structure
    const titleAndData = [
      [
        `REKAP ABSENSI ${namaKelas} - ${profile?.nama_lengkap}`,
      ],
      [`Tanggal: ${formattedDate}`],
      [],
      Object.keys(dayData[0] || {}),
      ...dayData.map((row) => Object.values(row)),
    ];

    const dayWorksheet =
      XLSX.utils.aoa_to_sheet(titleAndData);
    const dayColWidths = [
      { wch: 12 }, // Tanggal
      { wch: 8 }, // Jam
      { wch: 10 }, // No Absen
      { wch: 25 }, // Nama Siswa
      { wch: 15 }, // Jenis Kelamin
      { wch: 12 }, // Status
      { wch: 35 }, // Keterangan
      { wch: 20 }, // Nama Pelapor
      { wch: 50 }, // Bukti
      { wch: 20 }, // Nama Kelas
    ];
    dayWorksheet["!cols"] = dayColWidths;

    // Style: Title row (row 0)
    const titleCellStyle = {
      fill: { fgColor: { rgb: "1F2937" } },
      font: {
        color: { rgb: "FFFFFF" },
        bold: true,
        sz: 14,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: {
          style: "thin",
          color: { rgb: "000000" },
        },
        bottom: {
          style: "thin",
          color: { rgb: "000000" },
        },
        left: {
          style: "thin",
          color: { rgb: "000000" },
        },
        right: {
          style: "thin",
          color: { rgb: "000000" },
        },
      },
    };

    // Style: Date row (row 1)
    const dateCellStyle = {
      fill: { fgColor: { rgb: "374151" } },
      font: {
        color: { rgb: "FFFFFF" },
        bold: true,
        sz: 11,
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
      },
      border: {
        top: {
          style: "thin",
          color: { rgb: "000000" },
        },
        bottom: {
          style: "thin",
          color: { rgb: "000000" },
        },
        left: {
          style: "thin",
          color: { rgb: "000000" },
        },
        right: {
          style: "thin",
          color: { rgb: "000000" },
        },
      },
    };

    // Apply styles to title and date rows
    const titleCell = dayWorksheet["A1"];
    if (titleCell) titleCell.s = titleCellStyle;

    const dateCell = dayWorksheet["A2"];
    if (dateCell) dateCell.s = dateCellStyle;

    // Apply header style to row 3 (headers)
    for (let c = 0; c < 10; c++) {
      const headerCell =
        dayWorksheet[
          XLSX.utils.encode_cell({
            r: 3,
            c,
          })
        ];
      if (headerCell) headerCell.s = headerStyle;
    }

    // Apply styles to data rows (starting from row 4)
    applyStyleToRange(
      dayWorksheet,
      {
        s: { r: 4, c: 0 },
        e: {
          r: 3 + dayData.length,
          c: 9,
        },
      },
      cellStyle,
    );

    // Apply status color to Status column (column 5, data rows start at row 4)
    applyStatusStyle(dayWorksheet, 5, 3, dayData);

    XLSX.utils.book_append_sheet(
      workbook,
      dayWorksheet,
      "Data Absensi",
    );
    // Create summary sheet
    const totalHadir = dayData.filter(
      (e) => e.Status === "Hadir",
    ).length;
    const totalSakit = dayData.filter(
      (e) => e.Status === "Sakit",
    ).length;
    const totalIzin = dayData.filter(
      (e) => e.Status === "Izin",
    ).length;
    const totalAlpa = dayData.filter(
      (e) => e.Status === "Alpa",
    ).length;

    const summaryData = [
      {
        Metrik: "KELAS",
        Nilai: namaKelas || "-",
      },
      {
        Metrik: "KODE KELAS",
        Nilai: kodeInput || "-",
      },
      {
        Metrik: "TANGGAL",
        Nilai: formattedDate,
      },
      {
        Metrik: "WALI KELAS",
        Nilai: profile?.nama_lengkap || "-",
      },
      {
        Metrik: "TOTAL SISWA",
        Nilai: siswaList.length,
      },
      {
        Metrik: "TANGGAL EKSPOR",
        Nilai: new Date().toLocaleString("id-ID"),
      },
      { Metrik: "", Nilai: "" },
      { Metrik: "REKAP STATUS", Nilai: "" },
      {
        Metrik: "Total Hadir",
        Nilai: totalHadir,
      },
      {
        Metrik: "Total Sakit",
        Nilai: totalSakit,
      },
      { Metrik: "Total Izin", Nilai: totalIzin },
      { Metrik: "Total Alpa", Nilai: totalAlpa },
    ];

    const summarySheet =
      XLSX.utils.json_to_sheet(summaryData);
    const summaryColWidths = [
      { wch: 20 },
      { wch: 30 },
    ];
    summarySheet["!cols"] = summaryColWidths;
    applyStyleToRange(
      summarySheet,
      XLSX.utils.decode_range(
        summarySheet["!ref"],
      ),
      cellStyle,
    );

    // Style header summary
    [0, 1, 2, 3, 4, 5, 7, 8, 11].forEach((r) => {
      const cell =
        summarySheet[
          XLSX.utils.encode_cell({ r, c: 0 })
        ];
      if (cell)
        cell.s = {
          ...headerStyle,
          fill: { fgColor: { rgb: "1F2937" } },
        };
    });

    // Color coding for summary status
    const summaryHadirCell =
      summarySheet[
        XLSX.utils.encode_cell({ r: 8, c: 1 })
      ];
    if (summaryHadirCell)
      summaryHadirCell.s = {
        ...cellStyle,
        fill: { fgColor: { rgb: "D1FAE5" } },
      };
    const summarySakitCell =
      summarySheet[
        XLSX.utils.encode_cell({ r: 9, c: 1 })
      ];
    if (summarySakitCell)
      summarySakitCell.s = {
        ...cellStyle,
        fill: { fgColor: { rgb: "FEF3C7" } },
      };
    const summaryIzinCell =
      summarySheet[
        XLSX.utils.encode_cell({ r: 10, c: 1 })
      ];
    if (summaryIzinCell)
      summaryIzinCell.s = {
        ...cellStyle,
        fill: { fgColor: { rgb: "DBEAFE" } },
      };
    const summaryAlpaCell =
      summarySheet[
        XLSX.utils.encode_cell({ r: 11, c: 1 })
      ];
    if (summaryAlpaCell)
      summaryAlpaCell.s = {
        ...cellStyle,
        fill: { fgColor: { rgb: "FEE2E2" } },
      };

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Ringkasan",
    );

    // Create file with selected date in filename
    const fileName = `rekap_absensi_${namaKelas || "kelas"}_${selectedExportDate.replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [
    laporanAbsensi,
    namaKelas,
    kodeInput,
    profile,
    supabase,
    selectedExportDate,
  ]);

  // Fungsi Unduh Excel Lengkap
  const downloadExcel = useCallback(async () => {
    if (!selectedExportDate) {
      alert(
        "Silakan pilih tanggal untuk diekspor terlebih dahulu.",
      );
      return;
    }

    if (!kodeInput) {
      alert("Kode kelas tidak ditemukan.");
      return;
    }

    // Ambil semua siswa
    const { data: siswaList } = await supabase
      .from("siswa")
      .select("*")
      .eq("kode_kelas", kodeInput)
      .order("no_absen", { ascending: true });

    if (!siswaList || siswaList.length === 0) {
      alert("Data siswa tidak ditemukan.");
      return;
    }

    // Ambil nama sekretaris untuk default nama pelapor
    const { data: sekretarisData } =
      await supabase
        .from("sekretaris")
        .select("nama_sekretaris")
        .eq("kode_kelas", kodeInput)
        .limit(1);
    const namaSekretaris =
      sekretarisData?.[0]?.nama_sekretaris || "-";

    // Filter absensi hanya untuk tanggal yang dipilih
    const filteredAbsensi = laporanAbsensi.filter(
      (item) => {
        const dateKey = new Date(
          item.created_at,
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        return dateKey === selectedExportDate;
      },
    );

    // Ambil semua tanggal unik dari laporan absensi untuk statistik
    const allDates = [
      ...new Set(
        laporanAbsensi.map((item) =>
          new Date(
            item.created_at,
          ).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
        ),
      ),
    ];

    // Prepare data
    const data = siswaList.map((siswa, index) => {
      const absen = filteredAbsensi.find(
        (a) => a.nama_siswa === siswa.nama,
      );
      const statusHariIni =
        absen ? absen.status : "Hadir";
      const keterangan = absen?.alasan || "-";

      const row = {
        No: index + 1,
        Nama: siswa.nama,
        "Status Hari Ini": statusHariIni,
        Keterangan: keterangan,
        "Nama Pelapor":
          absen?.nama_pelapor || namaSekretaris,
      };

      if (showStatistik) {
        // Hitung statistik
        let totalHadir = 0,
          totalSakit = 0,
          totalIzin = 0,
          totalAlpa = 0;
        for (const date of allDates) {
          const absenStat = laporanAbsensi.find(
            (a) =>
              a.nama_siswa === siswa.nama &&
              new Date(
                a.created_at,
              ).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }) === date,
          );
          if (absenStat) {
            if (absenStat.status === "Sakit")
              totalSakit++;
            else if (absenStat.status === "Izin")
              totalIzin++;
            else if (absenStat.status === "Alpa")
              totalAlpa++;
          } else {
            totalHadir++;
          }
        }
        row["Total Hadir"] = totalHadir;
        row["Total Sakit"] = totalSakit;
        row["Total Izin"] = totalIzin;
        row["Total Alpa"] = totalAlpa;
      }
      return row;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet =
      XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Data Absensi",
    );
    const fileName = `rekap_absensi_${namaKelas || "kelas"}_${selectedExportDate.replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [
    laporanAbsensi,
    namaKelas,
    kodeInput,
    supabase,
    showStatistik,
    selectedExportDate,
  ]);

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

  // Helper: Fetch sekretaris data
  const fetchSekretaris = async (kodeKelas) => {
    if (!kodeKelas) return;
    setLoadingSekretaris(true);
    const { data } = await supabase
      .from("sekretaris")
      .select("*")
      .eq("kode_kelas", kodeKelas)
      .order("created_at", { ascending: false });
    setSekretarisList(data || []);
    setLoadingSekretaris(false);
  };

  useEffect(() => {
    const fetchAbsensi = async (
      kodeKelas,
      namaKelasVal,
    ) => {
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
          await fetchAbsensi(
            profileData.kode_kelas,
            profileData.nama_kelas || null,
          );
          await fetchSekretaris(
            profileData.kode_kelas,
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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sekretaris",
        },
        (payload) => {
          const currentKode = kodeInput;
          if (
            payload.new.kode_kelas === currentKode
          ) {
            setSekretarisList((prev) => [
              payload.new,
              ...prev,
            ]);
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [kodeInput, supabase]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowChartModal(false);
        setPopupDate(null);
      }
    };
    window.addEventListener(
      "keydown",
      handleKeyDown,
    );
    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, []);

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
      return Object.values(dailyMap).sort(
        (a, b) => {
          const dateA = new Date(
            a.date.replace(
              /(\d+)\s+(\w+)/,
              "2024 $2 $1",
            ),
          );
          const dateB = new Date(
            b.date.replace(
              /(\d+)\s+(\w+)/,
              "2024 $2 $1",
            ),
          );
          return dateA - dateB;
        },
      );
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
            weekStartDate: weekStart,
            Sakit: 0,
            Izin: 0,
            Alpa: 0,
            total: 0,
          };
        }
        weeklyMap[weekLabel][item.status]++;
        weeklyMap[weekLabel].total++;
      });
      return Object.values(weeklyMap).sort(
        (a, b) =>
          a.weekStartDate - b.weekStartDate,
      );
    } else if (chartView === "percentage") {
      const totalSiswa = 30;
      const sick = laporanAbsensi.filter(
        (a) => a.status === "Sakit",
      ).length;
      const izin = laporanAbsensi.filter(
        (a) => a.status === "Izin",
      ).length;
      const alpa = laporanAbsensi.filter(
        (a) => a.status === "Alpa",
      ).length;
      const totalAbsensi = sick + izin + alpa;
      const tidakHadirPersentase = Math.round(
        (totalAbsensi / totalSiswa) * 100,
      );
      const hadirPersentase =
        100 - tidakHadirPersentase;

      return [
        {
          name: "Hadir",
          value: hadirPersentase,
          color: "#10B981",
        },
        {
          name: "Tidak Hadir",
          value: tidakHadirPersentase,
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

              {/* Input Nama Kelas */}
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
                        const { error } =
                          await supabase
                            .from("profiles")
                            .update({
                              nama_kelas: trimmed,
                            })
                            .eq("id", profile.id);
                        if (!error) {
                          setProfile((prev) => ({
                            ...prev,
                            nama_kelas: trimmed,
                          }));
                          setNamaKelas(trimmed);
                          setIsNamaKelasLocked(
                            true,
                          );
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
                                )
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

              {/* Tombol Import CSV Siswa */}
              {isNamaKelasLocked && (
                <div className="mt-3">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCsvResult(null);
                      setShowCsvUpload(true);
                    }}
                    className="w-full py-3 px-4 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                    <UploadCloud
                      size={16}
                      className="shrink-0"
                    />
                    <span>
                      Import Data Siswa (CSV)
                    </span>
                  </motion.button>
                  <p className="text-[9px] text-gray-500 mt-2 text-center leading-relaxed">
                    Upload file .csv untuk
                    mengisi data siswa
                  </p>
                </div>
              )}

              {/* Kode Kelas */}
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

                {/* Tombol Buat Sekretaris */}
                {isLocked && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <motion.button
                      whileHover={
                        (
                          sekretarisList.length ===
                          0
                        ) ?
                          { scale: 1.02 }
                        : {}
                      }
                      whileTap={
                        (
                          sekretarisList.length ===
                          0
                        ) ?
                          { scale: 0.98 }
                        : {}
                      }
                      onClick={() =>
                        sekretarisList.length ===
                          0 &&
                        setShowSekretarisPopup(
                          true,
                        )
                      }
                      disabled={
                        sekretarisList.length > 0
                      }
                      className={`w-full py-3 px-4 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                        (
                          sekretarisList.length >
                          0
                        ) ?
                          "bg-gray-600/50 hover:bg-gray-600/50 cursor-not-allowed opacity-60"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                      }`}>
                      <Users
                        size={16}
                        className="shrink-0"
                      />
                      <span>
                        Buat Sekretaris Baru
                      </span>
                    </motion.button>
                    <p className="text-[9px] text-gray-500 mt-2 text-center leading-relaxed">
                      {sekretarisList.length > 0 ?
                        "Sekretaris sudah dibuat"
                      : "Buat akun sekretaris untuk input absensi"
                      }
                    </p>

                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sekretaris Cards Section */}
          {isLocked &&
            sekretarisList.length > 0 && (
              <div className="flex justify-center">
                <div className="space-y-4 max-w-md w-full">
                  <h2 className="text-xl font-bold text-white text-center">
                    Data Sekretaris
                  </h2>
                  <div className="flex justify-center">
                    {sekretarisList.map(
                      (sekretaris) => (
                        <motion.div
                          key={sekretaris.id}
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-xl w-full">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-600/30 flex items-center justify-center">
                              <Users
                                size={20}
                                className="text-emerald-400"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">
                                {
                                  sekretaris.nama_sekretaris
                                }
                              </p>
                              <p className="text-xs text-gray-400">
                                Sekretaris
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-midnight-dark/50 rounded-lg p-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Kode Sekretaris
                              </p>
                              <p className="text-sm font-mono text-emerald-400 mt-1">
                                {
                                  sekretaris.kode_sekretaris
                                }
                              </p>
                            </div>
                            <div className="bg-midnight-dark/50 rounded-lg p-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Dibuat Pada
                              </p>
                              <p className="text-sm text-gray-300 mt-1">
                                {new Date(
                                  sekretaris.created_at,
                                ).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month:
                                      "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

          <AnimatePresence>
            {showSekretarisPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-midnight-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
                <motion.div
                  initial={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  className="w-full max-w-md bg-midnight-2/90 border border-white/10 p-6 rounded-[2rem] shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-playfair text-xl font-bold text-white">
                      Buat Sekretaris
                    </h2>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setShowSekretarisPopup(
                          false,
                        )
                      }
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                      <X
                        size={18}
                        className="text-gray-300"
                      />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Nama Lengkap Sekretaris
                      </label>
                      <input
                        type="text"
                        value={
                          namaSekretarisInput
                        }
                        onChange={(e) =>
                          setNamaSekretarisInput(
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: Budi Santoso"
                        className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Kode Sekretaris
                      </label>
                      <input
                        type="text"
                        value={
                          kodeSekretarisInput
                        }
                        onChange={(e) =>
                          setKodeSekretarisInput(
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="Contoh: BUDI2024"
                        className="w-full bg-midnight-dark/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors uppercase"
                      />
                    </div>

                    <div className="p-3 bg-midnight-dark/40 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-400 mb-1">
                        Kelas:
                      </p>
                      <p className="text-sm font-bold text-emerald-400">
                        {namaKelas} ({kodeInput})
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={
                      handleSimpanSekretaris
                    }
                    disabled={
                      savingSekretaris ||
                      !namaSekretarisInput.trim() ||
                      !kodeSekretarisInput.trim()
                    }
                    className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-poppins font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {savingSekretaris ?
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    : <>Simpan Sekretaris</>}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Popup Import CSV Siswa */}
          <AnimatePresence>
            {showCsvUpload && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-midnight-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
                <motion.div
                  initial={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  className="w-full max-w-md bg-midnight-2/90 border border-white/10 p-6 rounded-[2rem] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <UploadCloud
                          size={18}
                          className="text-indigo-400"
                        />
                      </div>
                      <h2 className="font-playfair text-xl font-bold text-white">
                        Import Data Siswa
                      </h2>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setShowCsvUpload(false);
                        setCsvResult(null);
                      }}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                      <X
                        size={18}
                        className="text-gray-300"
                      />
                    </motion.button>
                  </div>

                  {/* Format info */}
                  <div className="mb-5 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      Format Kolom CSV yang
                      Diwajibkan
                    </p>
                    <code className="block text-xs text-indigo-300 bg-midnight-dark/60 rounded-lg px-3 py-2 font-mono break-all">
                      nama,no_absen,kode_kelas,nama_kelas,jenis_kelamin
                    </code>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Pastikan urutan kolom persis
                      seperti di atas. Nilai{" "}
                      <span className="text-indigo-300 font-bold">
                        jenis_kelamin
                      </span>{" "}
                      harus{" "}
                      <span className="text-indigo-300 font-bold">
                        L
                      </span>{" "}
                      atau{" "}
                      <span className="text-indigo-300 font-bold">
                        P
                      </span>
                      .
                    </p>
                  </div>

                  {/* File input */}
                  <label className="block w-full cursor-pointer">
                    <div
                      className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors ${csvUploading ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/15 hover:border-indigo-500/50 hover:bg-indigo-500/5"}`}>
                      {csvUploading ?
                        <>
                          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                          <p className="text-sm text-indigo-400 font-bold">
                            Memproses &
                            menyimpan...
                          </p>
                        </>
                      : <>
                          <UploadCloud
                            size={28}
                            className="text-indigo-400/60"
                          />
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">
                              Klik untuk pilih
                              file CSV
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              Hanya file .csv yang
                              didukung
                            </p>
                          </div>
                        </>
                      }
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      disabled={csvUploading}
                      onChange={handleCsvUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Hasil upload */}
                  {csvResult && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-4 space-y-3">
                      {/* Sukses */}
                      {csvResult.success > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
                          <CheckCircle2
                            size={20}
                            className="text-emerald-400 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-bold text-emerald-400">
                              {csvResult.success}{" "}
                              siswa berhasil
                              disimpan!
                            </p>
                            <p className="text-[10px] text-emerald-400/70 mt-0.5">
                              Data telah tersimpan
                              ke tabel siswa.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error fatal */}
                      {csvResult.error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl">
                          <div className="flex items-start gap-2">
                            <AlertCircle
                              size={16}
                              className="text-red-400 shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-red-400 font-medium whitespace-pre-line">
                              {csvResult.error}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Baris error */}
                      {csvResult.errors?.length >
                        0 && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 max-h-36 overflow-y-auto">
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            {
                              csvResult.errors
                                .length
                            }{" "}
                            baris dilewati
                          </p>
                          {csvResult.errors.map(
                            (err, i) => (
                              <p
                                key={i}
                                className="text-[10px] text-amber-300/80 leading-relaxed">
                                • {err}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  <button
                    onClick={() => {
                      setShowCsvUpload(false);
                      setCsvResult(null);
                    }}
                    className="w-full mt-5 py-3 bg-white/8 hover:bg-white/15 text-white text-sm font-bold rounded-xl transition-colors border border-white/10">
                    Tutup
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Popup Error Kode Duplikat */}
          <AnimatePresence>
            {showDuplicateError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-midnight-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
                <motion.div
                  initial={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  className="w-full max-w-sm bg-red-500/10 border border-red-500/30 p-6 rounded-[2rem] shadow-2xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                      <AlertCircle
                        size={32}
                        className="text-red-500"
                      />
                    </div>
                    <h2 className="font-playfair text-xl font-bold text-white mb-2">
                      Kode Kelas Sudah Ada!
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Kode{" "}
                      <span className="text-amber-400 font-bold">
                        {kodeInput}
                      </span>{" "}
                      sudah digunakan oleh kelas
                      lain. Silakan gunakan kode
                      yang berbeda.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setShowDuplicateError(
                          false,
                        )
                      }
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                      Coba Lagi
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chart Ringkasan Absensi */}
          <section className="bg-midnight-2/40 border border-white/5 p-4 rounded-4xl backdrop-blur-xl">
            <div className="mb-3">
              <div className="flex flex-col gap-3 mb-3">
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-midnight-dark/40 border border-white/10 rounded-xl px-3 py-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                      Pilih Tanggal:
                    </span>
                    <div className="relative w-full sm:w-auto">
                      <button
                        onClick={() =>
                          setShowDatePicker(
                            !showDatePicker,
                          )
                        }
                        className={`flex items-center justify-between gap-2 w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          selectedExportDate ?
                            "bg-amber-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}>
                        <span className="truncate">
                          {selectedExportDate ||
                            "Pilih tanggal"}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            showDatePicker ?
                              "rotate-180"
                            : ""
                          }`}
                        />
                      </button>
                      {showDatePicker && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -10,
                          }}
                          className="absolute top-full mt-2 z-40 bg-midnight-dark border border-white/10 rounded-2xl shadow-lg max-h-48 overflow-y-auto w-44">
                          {(
                            groupedDates.length ===
                            0
                          ) ?
                            <div className="p-3 text-xs text-gray-500 text-center">
                              Tidak ada data
                            </div>
                          : groupedDates.map(
                              (date) => (
                                <motion.button
                                  key={date}
                                  whileHover={{
                                    backgroundColor:
                                      "rgba(255,255,255,0.05)",
                                  }}
                                  onClick={() => {
                                    const dateKey =
                                      new Date(
                                        date,
                                      ).toLocaleDateString(
                                        "id-ID",
                                        {
                                          year: "numeric",
                                          month:
                                            "2-digit",
                                          day: "2-digit",
                                        },
                                      );
                                    setSelectedExportDate(
                                      dateKey,
                                    );
                                    setShowDatePicker(
                                      false,
                                    );
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-xs font-semibold border-b border-white/5 transition-colors ${
                                    (
                                      selectedExportDate ===
                                      new Date(
                                        date,
                                      ).toLocaleDateString(
                                        "id-ID",
                                        {
                                          year: "numeric",
                                          month:
                                            "2-digit",
                                          day: "2-digit",
                                        },
                                      )
                                    ) ?
                                      "bg-amber-600/20 text-amber-400"
                                    : "text-gray-300 hover:text-white"
                                  }`}>
                                  {date}
                                </motion.button>
                              ),
                            )
                          }
                        </motion.div>
                      )}
                    </div>
                  </div>
                  {/* CHECKBOX STATISTIK */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <input
                        type="checkbox"
                        checked={showStatistik}
                        onChange={(e) =>
                          setShowStatistik(
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                      Sertakan Rekap Total
                    </label>
                  </div>
                  {/* TOMBOL UNDUH EXCEL */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadExcel}
                    disabled={!selectedExportDate}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-lg disabled:cursor-not-allowed">
                    <Download size={14} />
                    Unduh Excel
                  </motion.button>
                </div>
              </div>

              {/* Sorting Buttons */}
              <div className="flex flex-col md:flex-row gap-2">
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

            {/* MOBILE: Lihat Chart Button */}
            <motion.button
              key={`chart-mobile-${chartView}`}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() =>
                setShowChartModal(true)
              }
              className="md:hidden w-full py-6 bg-midnight-dark/40 border border-white/10 rounded-2xl cursor-pointer hover:bg-amethyst/20 hover:border-amethyst/30 transition-all">
              <div className="flex items-center justify-center gap-3">
                <TrendingUp
                  size={24}
                  className="text-amethyst"
                />
                <span className="text-white font-bold text-lg">
                  Lihat Chart
                </span>
              </div>
            </motion.button>

            {/* DESKTOP: Chart Preview */}
            <motion.div
              key={`chart-desktop-${chartView}`}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() =>
                setShowChartModal(true)
              }
              className="hidden md:block w-full py-8 bg-midnight-dark/40 border border-white/10 rounded-2xl cursor-pointer hover:bg-amethyst/20 hover:border-amethyst/30 transition-all overflow-hidden">
              <div className="h-80">
                {chartView === "summary" ?
                  <ResponsiveContainer
                    width="100%"
                    height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        verticalPoints={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={12}
                        fontWeight="600"
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        fontWeight="600"
                        allowDecimals={false}
                        tickCount={5}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor:
                            "rgba(15, 23, 42, 0.98)",
                          borderRadius: "12px",
                          border:
                            "1.5px solid rgba(255,255,255,0.2)",
                          color: "#ffffff",
                          fontSize: 12,
                          padding: "10px 14px",
                        }}
                        cursor={{
                          fill: "rgba(255,255,255,0.08)",
                        }}
                        formatter={(value) => {
                          return [
                            <span
                              key="value"
                              style={{
                                fontWeight:
                                  "bold",
                              }}>
                              {value} siswa
                            </span>,
                          ];
                        }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={80}>
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
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        verticalPoints={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={12}
                        fontWeight="600"
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        fontWeight="600"
                        allowDecimals={false}
                        tickCount={5}
                        tickLine={false}
                        width={40}
                        tickFormatter={(v) =>
                          `${v}%`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor:
                            "rgba(15, 23, 42, 0.98)",
                          borderRadius: "12px",
                          border:
                            "1.5px solid rgba(255,255,255,0.2)",
                          color: "#ffffff",
                          fontSize: 12,
                          padding: "10px 14px",
                        }}
                        cursor={{
                          fill: "rgba(255,255,255,0.08)",
                        }}
                        formatter={(value) => {
                          return [
                            <span
                              key="value"
                              style={{
                                fontWeight:
                                  "bold",
                              }}>
                              {value}%
                            </span>,
                          ];
                        }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={80}>
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
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 40,
                      }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        verticalPoints={false}
                      />
                      <XAxis
                        dataKey={
                          chartView === "daily" ?
                            "date"
                          : "week"
                        }
                        stroke="#9ca3af"
                        fontSize={11}
                        fontWeight="500"
                        angle={-30}
                        textAnchor="end"
                        tickLine={false}
                        interval={
                          chartData.length > 10 ?
                            1
                          : 0
                        }
                        height={60}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        fontWeight="600"
                        allowDecimals={false}
                        tickCount={5}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor:
                            "rgba(15, 23, 42, 0.98)",
                          borderRadius: "12px",
                          border:
                            "1.5px solid rgba(255,255,255,0.2)",
                          color: "#ffffff",
                          fontSize: 12,
                          padding: "10px 14px",
                        }}
                        cursor={{
                          stroke: "#fff",
                          strokeWidth: 1,
                        }}
                        formatter={(
                          value,
                          name,
                        ) => {
                          const colorMap = {
                            Hadir: "#10B981",
                            Sakit: "#FBBF24",
                            Izin: "#60A5FA",
                            Alpa: "#EF4444",
                          };
                          return [
                            <span
                              key="value"
                              style={{
                                color:
                                  colorMap[
                                    name
                                  ] || "#fff",
                                fontWeight:
                                  "bold",
                              }}>
                              {value} siswa
                            </span>,
                          ];
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                        }}
                        iconType="line"
                        formatter={(value) => {
                          const labelMap = {
                            Sakit: "Sakit",
                            Izin: "Izin",
                            Alpa: "Alpa",
                          };
                          return (
                            labelMap[value] ||
                            value
                          );
                        }}
                      />
                      <Line
                        type="natural"
                        dataKey="Sakit"
                        stroke="#FBBF24"
                        strokeWidth={3}
                        dot={{
                          fill: "#FBBF24",
                          r: 4,
                          strokeWidth: 2,
                          stroke: "#0f172a",
                        }}
                        isAnimationActive={true}
                      />
                      <Line
                        type="natural"
                        dataKey="Izin"
                        stroke="#60A5FA"
                        strokeWidth={3}
                        dot={{
                          fill: "#60A5FA",
                          r: 4,
                          strokeWidth: 2,
                          stroke: "#0f172a",
                        }}
                        isAnimationActive={true}
                      />
                      <Line
                        type="natural"
                        dataKey="Alpa"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{
                          fill: "#EF4444",
                          r: 4,
                          strokeWidth: 2,
                          stroke: "#0f172a",
                        }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                }
              </div>
              <div className="text-center mt-3 text-xs text-gray-400">
                Klik untuk melihat chart lebih
                besar →
              </div>
            </motion.div>

            {/* Info Legend untuk Summary View */}
            {chartView === "summary" && (
              <div className="flex flex-col md:flex-row gap-2 mt-4">
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
                      className="flex-1 p-3.5 bg-white/6 rounded-2xl border border-white/10 hover:border-white/20 min-w-0 flex flex-col gap-1.5 transition-all">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 shadow-lg"
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        />
                        <span className="text-xs font-bold text-white">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white leading-none">
                        {item.value}
                      </p>
                      <p className="text-[9px] text-gray-400 leading-snug">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Info Statistics untuk Daily/Weekly View */}
            {(chartView === "daily" ||
              chartView === "weekly") && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {[
                  {
                    label: "Total Sakit",
                    value: chartData.reduce(
                      (sum, d) => sum + d.Sakit,
                      0,
                    ),
                    color: "#FBBF24",
                    icon: "🏥",
                  },
                  {
                    label: "Total Izin",
                    value: chartData.reduce(
                      (sum, d) => sum + d.Izin,
                      0,
                    ),
                    color: "#60A5FA",
                    icon: "📋",
                  },
                  {
                    label: "Total Alpa",
                    value: chartData.reduce(
                      (sum, d) => sum + d.Alpa,
                      0,
                    ),
                    color: "#EF4444",
                    icon: "❌",
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">
                        {stat.label}
                      </span>
                      <span className="text-lg">
                        {stat.icon}
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: stat.color,
                      }}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* CHART MODAL — Full screen chart popup */}
        <AnimatePresence>
          {showChartModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() =>
                setShowChartModal(false)
              }
              className="fixed inset-0 z-50 bg-midnight-dark/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 md:p-8"
              style={{
                paddingTop:
                  "env(safe-area-inset-top)",
              }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp size={20} />
                  {chartView === "summary" ?
                    "Ringkasan Status Absensi"
                  : chartView === "daily" ?
                    "Absensi Harian"
                  : chartView === "weekly" ?
                    "Absensi Mingguan"
                  : "Persentase Kehadiran"}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() =>
                    setShowChartModal(false)
                  }
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                  <X
                    size={20}
                    className="text-gray-300"
                  />
                </motion.button>
              </div>

              {/* Chart Container - Full Height */}
              <div className="flex-1 min-h-0 w-full">
                <motion.div
                  key={chartView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full">
                  {chartView === "summary" ?
                    <ResponsiveContainer
                      width="100%"
                      height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                          verticalPoints={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          fontSize={14}
                          fontWeight="600"
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={13}
                          fontWeight="600"
                          allowDecimals={false}
                          tickCount={6}
                          tickLine={false}
                          width={50}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "rgba(15, 23, 42, 0.98)",
                            borderRadius: "12px",
                            border:
                              "1.5px solid rgba(255,255,255,0.2)",
                            color: "#ffffff",
                            fontSize: 13,
                            padding: "14px 18px",
                            boxShadow:
                              "0 10px 25px rgba(0,0,0,0.5)",
                          }}
                          cursor={{
                            fill: "rgba(255,255,255,0.08)",
                          }}
                          formatter={(value) => {
                            return [
                              <span
                                key="value"
                                style={{
                                  fontWeight:
                                    "bold",
                                  fontSize:
                                    "14px",
                                }}>
                                {value} siswa
                              </span>,
                            ];
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={120}>
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
                          top: 30,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                          verticalPoints={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          fontSize={14}
                          fontWeight="600"
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={13}
                          fontWeight="600"
                          allowDecimals={false}
                          tickCount={6}
                          tickLine={false}
                          width={50}
                          tickFormatter={(v) =>
                            `${v}%`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "rgba(15, 23, 42, 0.98)",
                            borderRadius: "12px",
                            border:
                              "1.5px solid rgba(255,255,255,0.2)",
                            color: "#ffffff",
                            fontSize: 13,
                            padding: "14px 18px",
                            boxShadow:
                              "0 10px 25px rgba(0,0,0,0.5)",
                          }}
                          cursor={{
                            fill: "rgba(255,255,255,0.08)",
                          }}
                          formatter={(value) => {
                            return [
                              <span
                                key="value"
                                style={{
                                  fontWeight:
                                    "bold",
                                  fontSize:
                                    "14px",
                                }}>
                                {value}%
                              </span>,
                            ];
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={120}
                          label={{
                            position: "top",
                            fill: "#ffffff",
                            fontSize: 14,
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
                          top: 30,
                          right: 30,
                          left: 20,
                          bottom: 80,
                        }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                          verticalPoints={false}
                        />
                        <XAxis
                          dataKey={
                            (
                              chartView ===
                              "daily"
                            ) ?
                              "date"
                            : "week"
                          }
                          stroke="#9ca3af"
                          fontSize={12}
                          fontWeight="500"
                          angle={-45}
                          textAnchor="end"
                          tickLine={false}
                          interval={
                            (
                              chartData.length >
                              15
                            ) ?
                              1
                            : 0
                          }
                          height={100}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={13}
                          fontWeight="600"
                          allowDecimals={false}
                          tickCount={6}
                          tickLine={false}
                          width={50}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "rgba(15, 23, 42, 0.98)",
                            borderRadius: "12px",
                            border:
                              "1.5px solid rgba(255,255,255,0.2)",
                            color: "#ffffff",
                            fontSize: 13,
                            padding: "14px 18px",
                            boxShadow:
                              "0 10px 25px rgba(0,0,0,0.5)",
                          }}
                          labelStyle={{
                            color: "#e5e7eb",
                            fontWeight: "bold",
                            fontSize: 14,
                            marginBottom: "8px",
                          }}
                          cursor={{
                            stroke: "#fff",
                            strokeWidth: 1,
                          }}
                          formatter={(
                            value,
                            name,
                          ) => {
                            const colorMap = {
                              Hadir: "#10B981",
                              Sakit: "#FBBF24",
                              Izin: "#60A5FA",
                              Alpa: "#EF4444",
                            };
                            return [
                              <span
                                key="value"
                                style={{
                                  color:
                                    colorMap[
                                      name
                                    ] || "#fff",
                                  fontWeight:
                                    "bold",
                                  fontSize:
                                    "14px",
                                }}>
                                {value} siswa
                              </span>,
                              <span
                                key="name"
                                style={{
                                  display:
                                    "block",
                                  fontSize:
                                    "12px",
                                  color:
                                    "#9ca3af",
                                  marginTop:
                                    "4px",
                                }}>
                                {name}
                              </span>,
                            ];
                          }}
                          label={(props) => {
                            const { payload } =
                              props;
                            if (
                              payload &&
                              payload[0]
                            ) {
                              const data =
                                payload[0]
                                  .payload;
                              return (
                                <div
                                  style={{
                                    color:
                                      "#e5e7eb",
                                    marginBottom:
                                      "8px",
                                    fontSize:
                                      "14px",
                                    fontWeight:
                                      "bold",
                                  }}>
                                  {data.date ||
                                    data.week}
                                  {data.total && (
                                    <span
                                      style={{
                                        marginLeft:
                                          "8px",
                                        color:
                                          "#9ca3af",
                                        fontSize:
                                          "12px",
                                      }}>
                                      (Total:{" "}
                                      {data.total}
                                      )
                                    </span>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: "20px",
                          }}
                          iconType="line"
                          formatter={(value) => {
                            const labelMap = {
                              Sakit: "🏥 Sakit",
                              Izin: "📋 Izin",
                              Alpa: "❌ Alpa",
                            };
                            return (
                              labelMap[value] ||
                              value
                            );
                          }}
                        />
                        <Line
                          type="natural"
                          dataKey="Sakit"
                          stroke="#FBBF24"
                          strokeWidth={4}
                          dot={{
                            fill: "#FBBF24",
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#0f172a",
                          }}
                          activeDot={{
                            r: 7,
                            strokeWidth: 2,
                          }}
                          isAnimationActive={true}
                        />
                        <Line
                          type="natural"
                          dataKey="Izin"
                          stroke="#60A5FA"
                          strokeWidth={4}
                          dot={{
                            fill: "#60A5FA",
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#0f172a",
                          }}
                          activeDot={{
                            r: 7,
                            strokeWidth: 2,
                          }}
                          isAnimationActive={true}
                        />
                        <Line
                          type="natural"
                          dataKey="Alpa"
                          stroke="#EF4444"
                          strokeWidth={4}
                          dot={{
                            fill: "#EF4444",
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#0f172a",
                          }}
                          activeDot={{
                            r: 7,
                            strokeWidth: 2,
                          }}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  }
                </motion.div>
              </div>

              {/* Footer Info */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 shrink-0">
                <p>
                  💡 Klik tombol mode untuk
                  melihat perspektif lain
                </p>
                <p>
                  Tekan ESC atau klik luar untuk
                  tutup
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POPUP MODAL — Fullscreen saat klik tanggal */}
        <AnimatePresence>
          {popupDate && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
              }}
              className="fixed inset-0 z-50 flex flex-col bg-midnight-dark backdrop-blur-xl"
              style={{
                paddingTop:
                  "env(safe-area-inset-top)",
              }}>
              {/* Header Popup */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amethyst/15 flex items-center justify-center">
                    <ClipboardList
                      className="text-amethyst"
                      size={18}
                    />
                  </div>
                  <div>
                    <p className="font-playfair font-bold text-white text-base leading-tight">
                      {popupDate}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {groupedByDate[popupDate]
                        ?.length ?? 0}{" "}
                      siswa tidak masuk
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() =>
                    setPopupDate(null)
                  }
                  className="w-10 h-10 rounded-2xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors border border-white/10">
                  <X
                    size={18}
                    className="text-gray-300"
                  />
                </motion.button>
              </div>

              {/* Summary Badge Bar */}
              <div className="flex gap-2 px-5 pt-4 pb-2">
                {["Sakit", "Izin", "Alpa"].map(
                  (status) => {
                    const count =
                      groupedByDate[
                        popupDate
                      ]?.filter(
                        (l) =>
                          l.status === status,
                      ).length ?? 0;
                    const colors = {
                      Sakit:
                        "bg-yellow-500/15 border-yellow-500/25 text-yellow-400",
                      Izin: "bg-blue-500/15 border-blue-500/25 text-blue-400",
                      Alpa: "bg-red-500/15 border-red-500/25 text-red-400",
                    };
                    return (
                      <div
                        key={status}
                        className={`flex-1 flex flex-col items-center py-3 rounded-2xl border ${colors[status]}`}>
                        <span className="text-2xl font-bold leading-none">
                          {count}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80">
                          {status}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>

              {/* List Siswa — scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {groupedByDate[popupDate]?.map(
                  (lapor, idx) => (
                    <motion.div
                      key={lapor.id}
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: idx * 0.05,
                      }}
                      className={`rounded-2xl border p-4 ${
                        lapor.status === "Sakit" ?
                          "bg-yellow-500/5 border-yellow-500/15"
                        : (
                          lapor.status === "Izin"
                        ) ?
                          "bg-blue-500/5 border-blue-500/15"
                        : "bg-red-500/5 border-red-500/15"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-white leading-tight">
                              {lapor.nama_siswa}
                            </p>
                            {lapor.jenis_kelamin && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amethyst/10 text-amethyst border border-amethyst/20">
                                {
                                  lapor.jenis_kelamin
                                }
                              </span>
                            )}
                          </div>
                          {lapor.nama_pelapor && (
                            <span className="text-[10px] text-amber-400/80">
                              Dilaporkan oleh{" "}
                              {lapor.nama_pelapor}
                            </span>
                          )}
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(
                              lapor.created_at,
                            ).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}{" "}
                            WIB
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide ${
                            (
                              lapor.status ===
                              "Sakit"
                            ) ?
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : (
                              lapor.status ===
                              "Izin"
                            ) ?
                              "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                          {lapor.status}
                        </span>
                      </div>
                      {lapor.alasan && (
                        <p className="text-xs text-gray-400 italic mt-3 leading-relaxed border-t border-white/5 pt-3">
                          &quot;{lapor.alasan}
                          &quot;
                        </p>
                      )}
                      {lapor.bukti_file && (
                        <div className="mt-3">
                          <a
                            href={
                              lapor.bukti_file
                            }
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
                  ),
                )}
              </div>

              {/* Tombol tutup bawah */}
              <div
                className="px-5 py-4 border-t border-white/5"
                style={{
                  paddingBottom:
                    "calc(1rem + env(safe-area-inset-bottom))",
                }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setPopupDate(null)
                  }
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
                    const records =
                      groupedByDate[dateKey];
                    const sakitCount =
                      records.filter(
                        (r) =>
                          r.status === "Sakit",
                      ).length;
                    const izinCount =
                      records.filter(
                        (r) =>
                          r.status === "Izin",
                      ).length;
                    const alpaCount =
                      records.filter(
                        (r) =>
                          r.status === "Alpa",
                      ).length;
                    return (
                      <motion.button
                        key={dateKey}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        whileHover={{
                          scale: 1.01,
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setPopupDate(dateKey)
                        }
                        className="w-full bg-midnight-dark/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amethyst/30 hover:bg-amethyst/5 transition-all text-left">
                        <div className="flex items-center justify-between px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amethyst/10 flex items-center justify-center shrink-0">
                              <ClipboardList
                                className="text-amethyst"
                                size={15}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-white">
                                {dateKey}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {records.length}{" "}
                                siswa · Tap untuk
                                detail
                              </p>
                            </div>
                          </div>
                          <div className="hidden md:flex items-center gap-1.5 shrink-0">
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
                            <ChevronDown
                              size={14}
                              className="text-amethyst ml-1 -rotate-90"
                            />
                          </div>
                          {/* Mobile: Hanya chevron */}
                          <div className="md:hidden flex items-center">
                            <ChevronDown
                              size={14}
                              className="text-amethyst -rotate-90"
                            />
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
