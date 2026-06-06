"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartsProps {
  monthlyData: { month: string; revenue: number; profit: number }[];
}

export default function AnalyticsCharts({ monthlyData }: AnalyticsChartsProps) {
  const labels = monthlyData.map((d) => d.month);
  const revenues = monthlyData.map((d) => d.revenue);
  const profits = monthlyData.map((d) => d.profit);

  // Common chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "var(--color-bg-tooltip)",
        titleColor: "var(--color-text-inverse)",
        bodyColor: "var(--color-text-inverse)",
        borderColor: "var(--color-border)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "var(--color-text-muted)",
          font: {
            family: "var(--font-body)",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "var(--color-border-light)",
        },
        ticks: {
          color: "var(--color-text-muted)",
          font: {
            family: "var(--font-mono)",
            size: 10,
          },
          callback: (value: any) => {
            if (value >= 1e6) return `${value / 1e6}jt`;
            return value;
          },
        },
      },
    },
  };

  const revenueData = {
    labels,
    datasets: [
      {
        label: "Omzet",
        data: revenues,
        backgroundColor: "rgba(212, 160, 83, 0.75)",
        hoverBackgroundColor: "var(--color-accent)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const profitData = {
    labels,
    datasets: [
      {
        label: "Keuntungan",
        data: profits,
        borderColor: "var(--color-success)",
        backgroundColor: "rgba(45, 139, 78, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "var(--color-success)",
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "var(--space-6)",
        marginTop: "var(--space-6)",
      }}
    >
      {/* Sales/Revenue Chart */}
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
        <div className="card-header" style={{ marginBottom: "var(--space-4)" }}>
          <div>
            <h3 className="card-title">Grafik Omzet Penjualan</h3>
            <p className="card-subtitle">Omzet kotor bulanan (6 bulan terakhir)</p>
          </div>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Bar data={revenueData} options={options as any} />
        </div>
      </div>

      {/* Profit Chart */}
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
        <div className="card-header" style={{ marginBottom: "var(--space-4)" }}>
          <div>
            <h3 className="card-title">Grafik Keuntungan Bersih</h3>
            <p className="card-subtitle">Estimasi keuntungan kotor hewan terjual</p>
          </div>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Line data={profitData} options={options as any} />
        </div>
      </div>
    </div>
  );
}
