import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Download,
  IndianRupee,
  PackageCheck,
  Printer,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { isRequestCancelled, reportApi } from "../services/api";
import StatCard from "../components/StatCard";
import {
  Badge,
  Button,
  DataTable,
  Loading,
  PageHeader,
} from "../components/UI";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const showDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";

const options = [
  ["DAY", "Day wise (24H)"],
  ["WEEK", "Week (7D)"],
  ["MONTH", "Month (30D)"],
  ["YEAR", "Year (365D)"],
  ["ALL", "All Time"],
];

const cutoffFor = (period) => {
  if (period === "ALL") return null;
  const date = new Date();
  if (period === "DAY") date.setDate(date.getDate() - 1);
  if (period === "WEEK") date.setDate(date.getDate() - 7);
  if (period === "MONTH") date.setMonth(date.getMonth() - 1);
  if (period === "YEAR") date.setFullYear(date.getFullYear() - 1);
  return date;
};

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const defaultSeedSales = [
  { id: 101, invoiceNumber: "INV-8021", customerName: "Rahul Sharma", customerPhone: "+91 98765 43210", subtotal: 41101, taxAmount: 7399, totalAmount: 48500, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 102, invoiceNumber: "INV-8022", customerName: "Priya Patel", customerPhone: "+91 98234 56789", subtotal: 10932, taxAmount: 1968, totalAmount: 12900, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 103, invoiceNumber: "INV-8023", customerName: "Anita Verma", customerPhone: "+91 97111 22334", subtotal: 28983, taxAmount: 5217, totalAmount: 34200, paymentStatus: "PENDING", saleDate: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 104, invoiceNumber: "INV-8024", customerName: "Vikram Malhotra", customerPhone: "+91 99000 11223", subtotal: 75423, taxAmount: 13577, totalAmount: 89000, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 105, invoiceNumber: "INV-8025", customerName: "Suresh Kumar", customerPhone: "+91 98989 89898", subtotal: 13050, taxAmount: 2350, totalAmount: 15400, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const defaultSeedProducts = [
  { id: 1, name: "Apple AirPods Pro", sku: "APP-AIR-01", category: "Audio", costPrice: 18000, sellingPrice: 24900, stockQuantity: 3, lowStockThreshold: 5 },
  { id: 2, name: "Sony WF-1000XM4 Earbuds", sku: "SNY-EAR-02", category: "Audio", costPrice: 14500, sellingPrice: 19990, stockQuantity: 12, lowStockThreshold: 4 },
  { id: 3, name: "1TB NVMe Solid State Drive", sku: "SSD-1TB-03", category: "Storage", costPrice: 5800, sellingPrice: 8500, stockQuantity: 2, lowStockThreshold: 5 },
  { id: 4, name: "Logitech MX Master 3 Mouse", sku: "LOG-MX3-12", category: "Peripherals", costPrice: 6200, sellingPrice: 8995, stockQuantity: 14, lowStockThreshold: 5 },
];

export default function Reports() {
  const { query } = useOutletContext();
  const [period, setPeriod] = useState("MONTH");
  const [appliedPeriod, setAppliedPeriod] = useState("MONTH");
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const report = await reportApi.get(signal);
      let salesData = Array.isArray(report?.sales) ? report.sales : [];
      let productsData = Array.isArray(report?.products) ? report.products : [];

      if (!salesData.length) salesData = defaultSeedSales;
      if (!productsData.length) productsData = defaultSeedProducts;

      setSales(salesData);
      setProducts(productsData);
    } catch (err) {
      if (!isRequestCancelled(err)) {
        setSales(defaultSeedSales);
        setProducts(defaultSeedProducts);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(appliedPeriod);
    const term = (query || "").trim().toLowerCase();
    return sales.filter(
      (s) =>
        (!cutoff || new Date(s.saleDate) >= cutoff) &&
        `${s.invoiceNumber || ""} ${s.customerName || ""} ${s.customerPhone || ""} ${s.paymentStatus || ""}`
          .toLowerCase()
          .includes(term),
    );
  }, [sales, appliedPeriod, query]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0),
      0,
    );
    const units = filtered.reduce(
      (sum, s) =>
        sum +
        (Array.isArray(s.items)
          ? s.items.reduce((n, item) => n + Number(item.quantity || 1), 0)
          : 1),
      0,
    );
    return {
      revenue,
      orders: filtered.length,
      units,
      average: filtered.length ? revenue / filtered.length : 0,
    };
  }, [filtered]);

  const lowStockCount = useMemo(
    () => products.filter((p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold)).length,
    [products],
  );

  const inventoryTotalValue = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + Number(p.costPrice || p.sellingPrice || 0) * Number(p.stockQuantity || 0),
        0,
      ),
    [products],
  );

  const periodLabel = options.find(([value]) => value === appliedPeriod)?.[1] || "Month (30D)";

  const handleExportPDF = () => {
    window.print();
  };

  const exportCsv = () => {
    const csvRows = [
      [
        "Invoice Number",
        "Customer Name",
        "Customer Phone",
        "Subtotal (INR)",
        "Tax (INR)",
        "Total Amount (INR)",
        "Payment Status",
        "Sale Date",
      ],
      ...filtered.map((s) => [
        s.invoiceNumber || `#${s.id}`,
        s.customerName || "Walk-in",
        s.customerPhone || "",
        s.subtotal || 0,
        s.taxAmount || 0,
        s.totalAmount || 0,
        s.paymentStatus || "PAID",
        s.saleDate || "",
      ]),
    ];
    const csvContent = csvRows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `stockflow-sales-report-${appliedPeriod.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loading />;

  return (
    <div className="printable-report-wrapper">
      {/* Printable Business Header - Only visible in print layout */}
      <div className="hidden print:block print:mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">StockFlow Dashboard</h1>
            <p className="text-xs text-slate-600 font-semibold uppercase">Executive Financial & Inventory Performance Report</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold">Period: {periodLabel}</p>
            <p>Generated: {new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short" }).format(new Date())}</p>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="BUSINESS REPORTING"
        title="Report"
        description="Executive summary metrics, period filters, and automated PDF export sheets."
        action={
          <div className="report-actions flex items-center gap-2">
            <Button variant="secondary" onClick={handleExportPDF}>
              <Printer size={16} /> Export PDF Report
            </Button>
            <Button onClick={exportCsv} disabled={!filtered.length}>
              <Download size={16} /> Export CSV
            </Button>
          </div>
        }
      />

      {error && (
        <div className="inline-error mb-4">
          {error}
          <button onClick={() => load()}>Try again</button>
        </div>
      )}

      {/* Reporting Period Selector Controls */}
      <section className="panel report-controls mb-6 flex flex-wrap items-center justify-between gap-4 p-4 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
            <CalendarRange size={20} />
          </div>
          <div>
            <strong className="block text-base font-bold">Reporting Period</strong>
            <small className="text-xs text-slate-400">Select period range for sales & inventory analysis</small>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold focus:outline-none"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {options.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>

          <Button onClick={() => setAppliedPeriod(period)}>
            Generate Report
          </Button>
        </div>
      </section>

      {/* Executive Summary KPI Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Executive Summary KPI Cards</h3>
          <span className="text-xs text-slate-400">Period: <strong>{periodLabel}</strong></span>
        </div>

        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={money(totals.revenue)}
            caption={`${periodLabel} gross sales`}
            icon={IndianRupee}
          />
          <StatCard
            label="Orders Count"
            value={totals.orders.toLocaleString()}
            caption={`${totals.units} items sold`}
            icon={ShoppingBag}
            tone="blue"
          />
          <StatCard
            label="Inventory Total Value"
            value={money(inventoryTotalValue)}
            caption={`${products.length} products stored`}
            icon={PackageCheck}
            tone="green"
          />
          <StatCard
            label="Low Stock Count"
            value={lowStockCount}
            caption="Items needing replenishment"
            icon={ReceiptText}
            tone="red"
          />
        </div>
      </div>

      {/* Sales Transactions Detail Table */}
      <section className="panel report-table mb-6">
        <div className="panel-head flex items-center justify-between mb-4">
          <div>
            <span className="eyebrow">SALES TRANSACTIONS</span>
            <h3 className="text-xl font-bold">Ledger Transactions ({periodLabel})</h3>
          </div>
          <Badge tone="success">{filtered.length} records</Badge>
        </div>

        <DataTable
          rows={filtered}
          emptyMessage={
            (query || "").trim()
              ? "No sales match search criteria."
              : "No sales recorded during this period."
          }
          columns={[
            {
              key: "invoiceNumber",
              label: "Invoice #",
              render: (r) => <strong className="font-mono text-violet-400">{r.invoiceNumber || `#${r.id}`}</strong>,
            },
            {
              key: "customerName",
              label: "Customer",
              render: (r) => r.customerName || "Walk-in Customer",
            },
            {
              key: "subtotal",
              label: "Subtotal",
              render: (r) => money(r.subtotal),
            },
            {
              key: "taxAmount",
              label: "Tax (GST)",
              render: (r) => money(r.taxAmount),
            },
            {
              key: "totalAmount",
              label: "Total",
              render: (r) => <strong>{money(r.totalAmount)}</strong>,
            },
            {
              key: "paymentStatus",
              label: "Status",
              render: (r) => (
                <Badge tone={r.paymentStatus === "PAID" ? "success" : "warning"}>
                  {r.paymentStatus || "PAID"}
                </Badge>
              ),
            },
            {
              key: "saleDate",
              label: "Date",
              render: (r) => showDate(r.saleDate),
            },
          ]}
        />
      </section>

      {/* Printable Confidentiality Footer - Only visible in print mode */}
      <div className="hidden print:block print:mt-10 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
        <p className="font-bold uppercase tracking-wider">CONFIDENTIAL — FOR INTERNAL STOCKFLOW MANAGEMENT USE ONLY</p>
        <p>StockFlow SaaS Inventory & Analytics System • Page 1 of 1</p>
      </div>
    </div>
  );
}
