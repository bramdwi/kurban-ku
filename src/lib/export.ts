import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatNumber, getSpeciesLabel, getStatusConfig } from "./utils";

// Helper for formatting dates
const getExportDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`;
};

// ==========================================
// CSV EXPORT FUNCTIONS (Safe and zero-dependency alternative to XLSX)
// ==========================================

export function exportToExcel(type: string, data: any) {
  let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility

  const escapeCSV = (val: any) => {
    let stringVal = val === null || val === undefined ? "" : String(val);
    // Mitigate CSV Formula Injection (CWE-1236)
    if (/^[=\+\-\@\t\r]/.test(stringVal)) {
      stringVal = "'" + stringVal;
    }
    if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  if (type === "financial") {
    csvContent += "RINGKASAN KEUANGAN\n";
    csvContent += "Indikator,Nilai\n";
    csvContent += `Total Pendapatan,${data.totalRevenue}\n`;
    csvContent += `Total Terbayar,${data.totalPaid}\n`;
    csvContent += `Sisa Hutang,${data.totalDebt}\n`;
    csvContent += `Total Modal Pembelian,${data.totalPurchaseCost}\n`;
    csvContent += `Laba Kotor,${data.grossProfit}\n`;
    csvContent += `Biaya Operasional,${data.totalExpenses}\n`;
    csvContent += `Laba Bersih,${data.netProfit}\n\n`;

    if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
      csvContent += "BREAKDOWN BULANAN\n";
      csvContent += "Bulan,Jumlah Transaksi,Pendapatan,Laba Bersih\n";
      data.monthlyBreakdown.forEach((m: any) => {
        csvContent += `${escapeCSV(m.month)},${m.count},${m.revenue},${m.profit}\n`;
      });
    }

  } else if (type === "sales") {
    csvContent += "RINGKASAN PENJUALAN\n";
    csvContent += "Indikator,Nilai\n";
    csvContent += `Total Transaksi,${data.totalTransactions}\n`;
    csvContent += `Total Hewan Terjual,${data.totalAnimals}\n`;
    csvContent += `Total Nilai Penjualan,${data.totalRevenue}\n\n`;

    if (data.speciesBreakdown && data.speciesBreakdown.length > 0) {
      csvContent += "PENJUALAN PER JENIS HEWAN\n";
      csvContent += "Jenis Hewan,Jumlah Terjual (Ekor),Pendapatan\n";
      data.speciesBreakdown.forEach((sp: any) => {
        csvContent += `${escapeCSV(getSpeciesLabel(sp.species))},${sp.count},${sp.revenue}\n`;
      });
      csvContent += "\n";
    }

    if (data.topBuyers && data.topBuyers.length > 0) {
      csvContent += "TOP PEMBELI\n";
      csvContent += "Peringkat,Nama,Jumlah Transaksi,Total Pembelian\n";
      data.topBuyers.forEach((b: any, idx: number) => {
        csvContent += `${idx + 1},${escapeCSV(b.name)},${b.count},${b.totalSpent}\n`;
      });
    }

  } else if (type === "animal") {
    csvContent += "RINGKASAN STOK HEWAN\n";
    csvContent += "Status / Kategori,Jumlah\n";
    csvContent += `Tersedia (AVAILABLE),${data.statusCounts?.AVAILABLE || 0}\n`;
    csvContent += `Dipesan (BOOKED),${data.statusCounts?.BOOKED || 0}\n`;
    csvContent += `Terjual (SOLD),${data.statusCounts?.SOLD || 0}\n`;
    csvContent += `Mati (DEAD),${data.statusCounts?.DEAD || 0}\n`;
    csvContent += `Valuasi Stok Tersedia (Harga Jual),${data.totalStockValue || 0}\n`;
    csvContent += `Valuasi Stok Tersedia (Harga Modal),${data.totalPurchaseValue || 0}\n`;
    csvContent += `Potensi Keuntungan Stok Tersedia,${(data.totalStockValue || 0) - (data.totalPurchaseValue || 0)}\n\n`;

    if (data.speciesStock && data.speciesStock.length > 0) {
      csvContent += "STOK PER JENIS HEWAN\n";
      csvContent += "Jenis Hewan,Total Stok (Ekor),Tersedia,Terjual,Nilai Jual Stok\n";
      data.speciesStock.forEach((sp: any) => {
        csvContent += `${escapeCSV(getSpeciesLabel(sp.species))},${sp.total},${sp.available},${sp.sold},${sp.totalValue}\n`;
      });
    }

  } else if (type === "delivery") {
    csvContent += "RINGKASAN PENGIRIMAN\n";
    csvContent += "Indikator,Nilai\n";
    csvContent += `Total Pengiriman,${data.totalDeliveries}\n`;
    csvContent += `Tingkat Keberhasilan,${data.successRate}%\n`;
    csvContent += `Status Terjadwal (SCHEDULED),${data.statusCounts?.SCHEDULED || 0}\n`;
    csvContent += `Status Transit (IN_TRANSIT),${data.statusCounts?.IN_TRANSIT || 0}\n`;
    csvContent += `Status Terkirim (DELIVERED),${data.statusCounts?.DELIVERED || 0}\n`;
    csvContent += `Status Gagal (FAILED),${data.statusCounts?.FAILED || 0}\n\n`;

    if (data.driverPerformance && data.driverPerformance.length > 0) {
      csvContent += "KINERJA DRIVER / KURIR\n";
      csvContent += "Driver,Total Tugas,Berhasil,Gagal,Tingkat Keberhasilan\n";
      data.driverPerformance.forEach((d: any) => {
        const rate = d.total > 0 ? `${Math.round((d.delivered / d.total) * 100)}%` : "0%";
        csvContent += `${escapeCSV(d.name)},${d.total},${d.delivered},${d.failed},${rate}\n`;
      });
    }
  }

  // Create Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_${type}_${getExportDateString()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
