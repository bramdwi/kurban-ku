import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatCurrency, formatNumber, getSpeciesLabel, getStatusConfig } from "./utils";

// Helper for formatting dates
const getExportDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`;
};

// ==========================================
// EXCEL EXPORT FUNCTIONS
// ==========================================

export function exportToExcel(type: string, data: any) {
  const wb = XLSX.utils.book_new();

  if (type === "financial") {
    // 1. Summary Sheet
    const summaryData = [
      { Indikator: "Total Pendapatan", Nilai: data.totalRevenue },
      { Indikator: "Total Terbayar", Nilai: data.totalPaid },
      { Indikator: "Sisa Hutang", Nilai: data.totalDebt },
      { Indikator: "Total Modal Pembelian", Nilai: data.totalPurchaseCost },
      { Indikator: "Laba Kotor", Nilai: data.grossProfit },
      { Indikator: "Biaya Operasional", Nilai: data.totalExpenses },
      { Indikator: "Laba Bersih", Nilai: data.netProfit },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Keuangan");

    // 2. Monthly Breakdown Sheet
    if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
      const monthlyData = data.monthlyBreakdown.map((m: any) => ({
        Bulan: m.month,
        "Jumlah Transaksi": m.count,
        Pendapatan: m.revenue,
        "Laba Bersih": m.profit,
      }));
      const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, wsMonthly, "Breakdown Bulanan");
    }

  } else if (type === "sales") {
    // 1. Sales Summary
    const summaryData = [
      { Indikator: "Total Transaksi", Nilai: data.totalTransactions },
      { Indikator: "Total Hewan Terjual", Nilai: data.totalAnimals },
      { Indikator: "Total Nilai Penjualan", Nilai: data.totalRevenue },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Penjualan");

    // 2. Species Breakdown
    if (data.speciesBreakdown && data.speciesBreakdown.length > 0) {
      const speciesData = data.speciesBreakdown.map((sp: any) => ({
        "Jenis Hewan": getSpeciesLabel(sp.species),
        "Jumlah Terjual (Ekor)": sp.count,
        Pendapatan: sp.revenue,
      }));
      const wsSpecies = XLSX.utils.json_to_sheet(speciesData);
      XLSX.utils.book_append_sheet(wb, wsSpecies, "Penjualan per Jenis");
    }

    // 3. Top Buyers
    if (data.topBuyers && data.topBuyers.length > 0) {
      const buyersData = data.topBuyers.map((b: any, idx: number) => ({
        Peringkat: idx + 1,
        Nama: b.name,
        "Jumlah Transaksi": b.count,
        "Total Pembelian": b.totalSpent,
      }));
      const wsBuyers = XLSX.utils.json_to_sheet(buyersData);
      XLSX.utils.book_append_sheet(wb, wsBuyers, "Top Pembeli");
    }

  } else if (type === "animal") {
    // 1. Stock Summary
    const summaryData = [
      { Status: "Tersedia (AVAILABLE)", Jumlah: data.statusCounts?.AVAILABLE || 0 },
      { Status: "Dipesan (BOOKED)", Jumlah: data.statusCounts?.BOOKED || 0 },
      { Status: "Terjual (SOLD)", Jumlah: data.statusCounts?.SOLD || 0 },
      { Status: "Mati (DEAD)", Jumlah: data.statusCounts?.DEAD || 0 },
      { Status: "Valuasi Stok Tersedia (Harga Jual)", Jumlah: data.totalStockValue || 0 },
      { Status: "Valuasi Stok Tersedia (Harga Modal)", Jumlah: data.totalPurchaseValue || 0 },
      { Status: "Potensi Keuntungan Stok Tersedia", Jumlah: (data.totalStockValue || 0) - (data.totalPurchaseValue || 0) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Stok");

    // 2. Species Stock Detail
    if (data.speciesStock && data.speciesStock.length > 0) {
      const speciesData = data.speciesStock.map((sp: any) => ({
        "Jenis Hewan": getSpeciesLabel(sp.species),
        "Total Stok (Ekor)": sp.total,
        Tersedia: sp.available,
        Terjual: sp.sold,
        "Nilai Jual Stok": sp.totalValue,
      }));
      const wsSpecies = XLSX.utils.json_to_sheet(speciesData);
      XLSX.utils.book_append_sheet(wb, wsSpecies, "Stok per Jenis");
    }

  } else if (type === "delivery") {
    // 1. Delivery Summary
    const summaryData = [
      { Indikator: "Total Pengiriman", Nilai: data.totalDeliveries },
      { Indikator: "Tingkat Keberhasilan", Nilai: `${data.successRate}%` },
      { Indikator: "Status Terjadwal (SCHEDULED)", Nilai: data.statusCounts?.SCHEDULED || 0 },
      { Indikator: "Status Transit (IN_TRANSIT)", Nilai: data.statusCounts?.IN_TRANSIT || 0 },
      { Indikator: "Status Terkirim (DELIVERED)", Nilai: data.statusCounts?.DELIVERED || 0 },
      { Indikator: "Status Gagal (FAILED)", Nilai: data.statusCounts?.FAILED || 0 },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Pengiriman");

    // 2. Driver Performance
    if (data.driverPerformance && data.driverPerformance.length > 0) {
      const driverData = data.driverPerformance.map((d: any) => ({
        Driver: d.name,
        "Total Tugas": d.total,
        Berhasil: d.delivered,
        Gagal: d.failed,
        "Tingkat Keberhasilan": d.total > 0 ? `${Math.round((d.delivered / d.total) * 100)}%` : "0%",
      }));
      const wsDriver = XLSX.utils.json_to_sheet(driverData);
      XLSX.utils.book_append_sheet(wb, wsDriver, "Kinerja Driver");
    }
  }

  // Write file
  XLSX.writeFile(wb, `Laporan_${type}_${getExportDateString()}.xlsx`);
}

// ==========================================
// PDF EXPORT FUNCTIONS
// ==========================================

export function exportToPDF(type: string, data: any) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header Style
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(26, 24, 20); // Warm Dark Primary Color
  doc.text("KurbanKu - Laporan Manajemen Kurban", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 101, 96); // Secondary Text
  doc.text(`Tanggal Unduh: ${dateStr}`, 14, 26);

  // Divider
  doc.setDrawColor(232, 228, 222);
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(212, 160, 83); // Warm Gold Accent

  if (type === "financial") {
    doc.text("Laporan Analisis Keuangan", 14, 38);

    // Summary Table
    const tableBody = [
      ["Total Pendapatan", formatCurrency(data.totalRevenue), `${data.totalTransactions} Transaksi`],
      ["Total Terbayar", formatCurrency(data.totalPaid), `${data.paidTransactions} Lunas`],
      ["Sisa Hutang (Piutang)", formatCurrency(data.totalDebt), `${data.dpTransactions} DP + ${data.unpaidTransactions} Belum Bayar`],
      ["Total Modal Pembelian", formatCurrency(data.totalPurchaseCost), "Harga pokok pembelian hewan kurban"],
      ["Laba Kotor", formatCurrency(data.grossProfit), "Pendapatan - Modal Pembelian"],
      ["Biaya Operasional", formatCurrency(data.totalExpenses), "Total pengeluaran operasional"],
      ["Laba Bersih", formatCurrency(data.netProfit), "Laba Kotor - Biaya Operasional"],
    ];

    autoTable(doc, {
      startY: 42,
      head: [["Indikator", "Nilai / Jumlah", "Keterangan"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [212, 160, 83] },
      columnStyles: {
        1: { fontStyle: "bold", halign: "right" },
      },
    });

    // Monthly breakdown table if exists
    if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 24, 20);
      doc.text("Perkembangan Bulanan", 14, (doc as any).lastAutoTable.finalY + 12);

      const monthlyBody = data.monthlyBreakdown.map((m: any) => [
        m.month,
        `${m.count} Transaksi`,
        formatCurrency(m.revenue),
        formatCurrency(m.profit),
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Bulan", "Jumlah Transaksi", "Pendapatan", "Laba Bersih"]],
        body: monthlyBody,
        theme: "grid",
        headStyles: { fillColor: [45, 139, 78] }, // Success green for stats
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right", fontStyle: "bold" },
        },
      });
    }

  } else if (type === "sales") {
    doc.text("Laporan Analisis Penjualan", 14, 38);

    const tableBody = [
      ["Total Transaksi", formatNumber(data.totalTransactions), "Faktur penjualan tercatat"],
      ["Total Hewan Terjual", `${formatNumber(data.totalAnimals)} Ekor`, "Jumlah sapi, kambing, dan domba terjual"],
      ["Total Nilai Penjualan", formatCurrency(data.totalRevenue), "Akumulasi nilai transaksi penjualan"],
    ];

    autoTable(doc, {
      startY: 42,
      head: [["Indikator", "Nilai / Jumlah", "Keterangan"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [212, 160, 83] },
      columnStyles: {
        1: { fontStyle: "bold", halign: "right" },
      },
    });

    // Species Breakdown Table
    if (data.speciesBreakdown && data.speciesBreakdown.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 24, 20);
      doc.text("Penjualan per Jenis Hewan", 14, (doc as any).lastAutoTable.finalY + 12);

      const speciesBody = data.speciesBreakdown.map((sp: any) => [
        getSpeciesLabel(sp.species),
        `${sp.count} Ekor`,
        formatCurrency(sp.revenue),
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Jenis Hewan", "Jumlah Terjual", "Total Revenue"]],
        body: speciesBody,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 196] }, // Info Blue
        columnStyles: {
          1: { halign: "center" },
          2: { halign: "right", fontStyle: "bold" },
        },
      });
    }

    // Top Buyers Table
    if (data.topBuyers && data.topBuyers.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 24, 20);
      doc.text("Pelanggan Terbaik (Top 10)", 14, (doc as any).lastAutoTable.finalY + 12);

      const buyersBody = data.topBuyers.map((b: any, idx: number) => [
        idx + 1,
        b.name,
        `${b.count} Transaksi`,
        formatCurrency(b.totalSpent),
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Peringkat", "Nama Pelanggan", "Jumlah Transaksi", "Total Pembelian"]],
        body: buyersBody,
        theme: "striped",
        headStyles: { fillColor: [45, 139, 78] },
        columnStyles: {
          0: { halign: "center" },
          2: { halign: "center" },
          3: { halign: "right", fontStyle: "bold" },
        },
      });
    }

  } else if (type === "animal") {
    doc.text("Laporan Analisis & Valuasi Stok Hewan", 14, 38);

    const tableBody = [
      ["Hewan Tersedia (AVAILABLE)", `${formatNumber(data.statusCounts?.AVAILABLE || 0)} Ekor`, "Hewan siap untuk dipesan/dijual"],
      ["Hewan Dipesan (BOOKED)", `${formatNumber(data.statusCounts?.BOOKED || 0)} Ekor`, "Hewan telah di-DP namun belum lunas/kirim"],
      ["Hewan Terjual (SOLD)", `${formatNumber(data.statusCounts?.SOLD || 0)} Ekor`, "Hewan lunas dan dalam pengiriman/selesai"],
      ["Hewan Mati (DEAD)", `${formatNumber(data.statusCounts?.DEAD || 0)} Ekor`, "Hewan mati (kerugian operasional)"],
      ["Total Valuasi Stok Tersedia (Harga Jual)", formatCurrency(data.totalStockValue || 0), "Potensi omzet jika stok terjual seluruhnya"],
      ["Total Valuasi Stok Tersedia (Harga Modal)", formatCurrency(data.totalPurchaseValue || 0), "Modal terikat pada stok saat ini"],
      ["Potensi Keuntungan Stok Tersedia", formatCurrency((data.totalStockValue || 0) - (data.totalPurchaseValue || 0)), "Selisih harga jual dan modal"],
    ];

    autoTable(doc, {
      startY: 42,
      head: [["Status / Kategori", "Nilai / Jumlah", "Keterangan"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [212, 160, 83] },
      columnStyles: {
        1: { fontStyle: "bold", halign: "right" },
      },
    });

    // Species Stock Detail Table
    if (data.speciesStock && data.speciesStock.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 24, 20);
      doc.text("Detail Stok per Jenis Hewan", 14, (doc as any).lastAutoTable.finalY + 12);

      const speciesBody = data.speciesStock.map((sp: any) => [
        getSpeciesLabel(sp.species),
        `${sp.total} Ekor`,
        `${sp.available} Ekor`,
        `${sp.sold} Ekor`,
        formatCurrency(sp.totalValue),
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Jenis Hewan", "Total Stok", "Tersedia", "Terjual", "Nilai Jual Stok"]],
        body: speciesBody,
        theme: "grid",
        headStyles: { fillColor: [45, 139, 78] },
        columnStyles: {
          1: { halign: "center" },
          2: { halign: "center" },
          3: { halign: "center" },
          4: { halign: "right", fontStyle: "bold" },
        },
      });
    }

  } else if (type === "delivery") {
    doc.text("Laporan Pemantauan Pengiriman", 14, 38);

    const tableBody = [
      ["Total Pengiriman", formatNumber(data.totalDeliveries), "Jumlah seluruh tugas pengiriman"],
      ["Tingkat Keberhasilan", `${data.successRate}%`, "Rasio pengiriman berstatus Selesai"],
      ["Pengiriman Terjadwal (SCHEDULED)", formatNumber(data.statusCounts?.SCHEDULED || 0), "Belum dikirim oleh driver"],
      ["Pengiriman Transit (IN_TRANSIT)", formatNumber(data.statusCounts?.IN_TRANSIT || 0), "Sedang dalam perjalanan"],
      ["Pengiriman Terkirim (DELIVERED)", formatNumber(data.statusCounts?.DELIVERED || 0), "Diterima pembeli dengan baik"],
      ["Pengiriman Gagal (FAILED)", formatNumber(data.statusCounts?.FAILED || 0), "Kendala pengiriman (perlu re-schedule)"],
    ];

    autoTable(doc, {
      startY: 42,
      head: [["Indikator", "Nilai / Jumlah", "Keterangan"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [212, 160, 83] },
      columnStyles: {
        1: { fontStyle: "bold", halign: "right" },
      },
    });

    // Driver Performance Table
    if (data.driverPerformance && data.driverPerformance.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 24, 20);
      doc.text("Performa Driver / Kurir", 14, (doc as any).lastAutoTable.finalY + 12);

      const driverBody = data.driverPerformance.map((d: any) => [
        d.name,
        `${d.total} Tugas`,
        d.delivered,
        d.failed,
        d.total > 0 ? `${Math.round((d.delivered / d.total) * 100)}%` : "0%",
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Nama Driver", "Total Tugas", "Terkirim (Sukses)", "Gagal", "Tingkat Sukses"]],
        body: driverBody,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 196] },
        columnStyles: {
          1: { halign: "center" },
          2: { halign: "center", textColor: [45, 139, 78] },
          3: { halign: "center", textColor: [209, 67, 67] },
          4: { halign: "center", fontStyle: "bold" },
        },
      });
    }
  }

  // Footer / Page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(156, 150, 144);
    doc.text(
      `Halaman ${i} dari ${pageCount} - Dokumen Laporan KurbanKu secara otomatis dibuat pada ${dateStr}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save PDF
  doc.save(`Laporan_${type}_${getExportDateString()}.pdf`);
}
