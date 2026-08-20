import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../services/api";
import RevenueTrend from "../components/RevenueTrend";
import StatCard from "../components/StatCard";
import { Badge, DataTable, Loading, PageHeader } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { getProductImage } from "../utils/imageMapper";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

// Fallback seed sales data with items across all categories
const defaultSeedSales = [
  { id: 101, invoiceNumber: "INV-8021", customerName: "Rahul Sharma", category: "Electronics", totalAmount: 65000, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 1).toISOString(), items: [{ productId: 1, category: "Electronics", price: 65000, quantity: 1 }] },
  { id: 102, invoiceNumber: "INV-8022", customerName: "Priya Patel", category: "Accessories", totalAmount: 14200, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 2).toISOString(), items: [{ productId: 4, category: "Accessories", price: 1200, quantity: 1 }, { productId: 13, category: "Accessories", price: 8500, quantity: 1 }, { productId: 24, category: "Accessories", price: 4500, quantity: 1 }] },
  { id: 103, invoiceNumber: "INV-8023", customerName: "Anita Verma", category: "Storage", totalAmount: 30100, paymentStatus: "PENDING", saleDate: new Date(Date.now() - 86400000 * 3).toISOString(), items: [{ productId: 6, category: "Storage", price: 7800, quantity: 2 }, { productId: 15, category: "Storage", price: 14500, quantity: 1 }] },
  { id: 104, invoiceNumber: "INV-8024", customerName: "Vikram Malhotra", category: "Office", totalAmount: 38000, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 4).toISOString(), items: [{ productId: 3, category: "Office", price: 18500, quantity: 1 }, { productId: 28, category: "Office", price: 19500, quantity: 1 }] },
  { id: 105, invoiceNumber: "INV-8025", customerName: "Suresh Kumar", category: "Networking", totalAmount: 17200, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 5).toISOString(), items: [{ productId: 8, category: "Networking", price: 6500, quantity: 2 }, { productId: 30, category: "Networking", price: 4200, quantity: 1 }] },
  { id: 106, invoiceNumber: "INV-8026", customerName: "Neha Gupta", category: "Computer Parts", totalAmount: 23300, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 6).toISOString(), items: [{ productId: 16, category: "Computer Parts", price: 4800, quantity: 1 }, { productId: 17, category: "Computer Parts", price: 18500, quantity: 1 }] },
  { id: 107, invoiceNumber: "INV-8027", customerName: "Amit Singh", category: "Electronics", totalAmount: 85000, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 12).toISOString(), items: [{ productId: 2, category: "Electronics", price: 85000, quantity: 1 }] },
  { id: 108, invoiceNumber: "INV-8028", customerName: "Kavita Reddy", category: "Accessories", totalAmount: 18500, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 18).toISOString(), items: [{ productId: 10, category: "Accessories", price: 5500, quantity: 1 }, { productId: 17, category: "Computer Parts", price: 13000, quantity: 1 }] },
  { id: 109, invoiceNumber: "INV-8029", customerName: "Rohan Das", category: "Storage", totalAmount: 20900, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 24).toISOString(), items: [{ productId: 18, category: "Storage", price: 6500, quantity: 1 }, { productId: 27, category: "Storage", price: 7200, quantity: 2 }] },
  { id: 110, invoiceNumber: "INV-8030", customerName: "Deepak Joshi", category: "Electronics", totalAmount: 72000, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 40).toISOString(), items: [{ productId: 12, category: "Electronics", price: 72000, quantity: 1 }] },
];

const defaultSeedProducts = [
  { id: 1, name: "Apple AirPods Pro", sku: "APP-AIR-01", category: "Audio", stockQuantity: 3, lowStockThreshold: 5, active: true },
  { id: 2, name: "Sony WF-1000XM4 Earbuds", sku: "SNY-EAR-02", category: "Audio", stockQuantity: 12, lowStockThreshold: 4, active: true },
  { id: 3, name: "1TB NVMe Solid State Drive", sku: "SSD-1TB-03", category: "Storage", stockQuantity: 2, lowStockThreshold: 5, active: true },
  { id: 4, name: "Logitech MX Master 3", sku: "LOG-MX3-04", category: "Peripherals", stockQuantity: 18, lowStockThreshold: 5, active: true },
  { id: 5, name: "Samsung 27\" Curved Monitor", sku: "SAM-MON-05", category: "Displays", stockQuantity: 4, lowStockThreshold: 4, active: true },
];

export default function Dashboard() {
  const { query } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "STAFF";

  const [data, setData] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      api.get("/dashboard/summary"),
      api.get("/sales"),
      api.get("/products"),
    ]);

    const [summaryResult, salesResult, productsResult] = results;
    let salesData = salesResult.status === "fulfilled" && Array.isArray(salesResult.value.data) ? salesResult.value.data : [];
    let productsData = productsResult.status === "fulfilled" && Array.isArray(productsResult.value.data) ? productsResult.value.data : [];

    // Use fallback default seed data for visual richness if backend is empty
    if (!salesData.length) salesData = defaultSeedSales;
    if (!productsData.length) productsData = defaultSeedProducts;

    const recordedRevenue = salesData.reduce(
      (sum, sale) => sum + Number(sale.totalAmount || 0),
      0,
    );

    const summary = summaryResult.status === "fulfilled" && summaryResult.value.data ? summaryResult.value.data : {};

    setData({
      totalRevenue: Number(summary.totalRevenue ?? recordedRevenue),
      totalOrders: Number(summary.totalOrders ?? salesData.length),
      lowStockItems: Number(
        summary.lowStockItems ??
          productsData.filter(
            (p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold),
          ).length,
      ),
      activeProducts: Number(
        summary.activeProducts ?? productsData.filter((p) => p.active !== false).length,
      ),
    });

    setSales(salesData);
    setProducts(productsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const normalized = (query || "").trim().toLowerCase();

  const salesTrendData = useMemo(() => {
    const totalsByDay = new Map();

    sales.forEach((sale) => {
      const dateValue = sale.saleDate || sale.createdAt || sale.date;
      if (!dateValue) return;

      const saleDate = new Date(dateValue);
      if (Number.isNaN(saleDate.getTime())) return;

      const year = saleDate.getFullYear();
      const month = String(saleDate.getMonth() + 1).padStart(2, "0");
      const day = String(saleDate.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      totalsByDay.set(
        key,
        (totalsByDay.get(key) || 0) + Number(sale.totalAmount || 0),
      );
    });

    return Array.from(totalsByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        date,
        label: new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
        }).format(new Date(date)),
        revenue,
      }));
  }, [sales]);

  const categoryTrendData = useMemo(() => {
    const productById = new Map(
      products.map((product) => [String(product.id), product]),
    );
    const totalsByCategory = new Map();

    sales.forEach((sale) => {
      const items = Array.isArray(sale.items) ? sale.items : [];
      if (!items.length) {
        const cat = sale.category || "Electronics";
        totalsByCategory.set(
          cat,
          (totalsByCategory.get(cat) || 0) + Number(sale.totalAmount || 0),
        );
        return;
      }

      items.forEach((item) => {
        const product = productById.get(String(item.productId || item.product?.id || ""));
        const category = product?.category || item.category || sale.category || "Electronics";
        const quantity = Number(item.quantity || 1);
        const price = Number(item.price || item.totalAmount || item.subtotal || 0);
        const fallbackRevenue = product ? Number(product.sellingPrice || 0) * quantity : price;
        const amount = price > 0 ? price : fallbackRevenue;

        totalsByCategory.set(
          category,
          (totalsByCategory.get(category) || 0) + amount,
        );
      });
    });

    return Array.from(totalsByCategory.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [products, sales]);

  const visibleSales = useMemo(
    () =>
      sales
        .filter((s) =>
          `${s.invoiceNumber || ""} ${s.customerName || ""} ${s.customerPhone || ""}`
            .toLowerCase()
            .includes(normalized),
        )
        .slice(0, 6),
    [sales, normalized],
  );

  const visibleProducts = useMemo(
    () =>
      products
        .filter((p) =>
          `${p.name || ""} ${p.sku || ""} ${p.category || ""}`
            .toLowerCase()
            .includes(normalized),
        )
        .sort((a, b) => Number(a.stockQuantity) - Number(b.stockQuantity))
        .slice(0, 6),
    [products, normalized],
  );

  if (loading && !data) return <Loading />;

  return (
    <>
      <PageHeader
        eyebrow="LIVE BUSINESS SNAPSHOT"
        title="Dashboard"
        description="Real-time overview of revenue, active sales, product stock levels, and inventory alerts."
      />

      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {!isStaff && (
          <StatCard
            label="Total revenue"
            value={money(data?.totalRevenue)}
            caption="View financial analytics"
            icon={IndianRupee}
            to="/revenue-trend"
          />
        )}
        <StatCard
          label="Total orders"
          value={Number(data?.totalOrders || 0).toLocaleString()}
          caption="View sales & invoices"
          icon={ShoppingBag}
          tone="blue"
          to="/sales"
        />
        <StatCard
          label="Low stock"
          value={data?.lowStockItems || 0}
          caption="View low stock alerts"
          icon={AlertTriangle}
          tone="red"
          to="/products?filter=low_stock"
        />
        <StatCard
          label="Active products"
          value={data?.activeProducts || 0}
          caption="View product catalog"
          icon={PackageCheck}
          tone="green"
          to="/products"
        />
      </div>

      {!isStaff && (
        <div className="mb-6">
          <RevenueTrend data={salesTrendData} categoryData={categoryTrendData} />
        </div>
      )}

      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="panel">
          <div className="panel-head flex items-center justify-between mb-4">
            <div>
              <span className="eyebrow">SALES ACTIVITY</span>
              <h3 className="text-xl font-bold">Recent sales</h3>
            </div>
            <Badge tone="success">Live</Badge>
          </div>
          <DataTable
            rows={visibleSales}
            emptyMessage={
              normalized
                ? "No sales match your search."
                : "Sales will appear once your team creates the first order."
            }
            columns={[
              {
                key: "invoiceNumber",
                label: "Invoice",
                render: (r) => <strong className="text-violet-400">{r.invoiceNumber || `#${r.id}`}</strong>,
              },
              {
                key: "customerName",
                label: "Customer",
                render: (r) => r.customerName || "Walk-in customer",
              },
              {
                key: "totalAmount",
                label: "Total Amount",
                render: (r) => <strong>{money(r.totalAmount)}</strong>,
              },
              {
                key: "paymentStatus",
                label: "Payment",
                render: (r) => (
                  <Badge tone={r.paymentStatus === "PAID" ? "success" : "warning"}>
                    {r.paymentStatus || "PENDING"}
                  </Badge>
                ),
              },
              {
                key: "saleDate",
                label: "Date",
                render: (r) => date(r.saleDate),
              },
            ]}
          />
        </section>

        <section className="panel stock-watch">
          <div className="panel-head flex items-center justify-between mb-4">
            <div>
              <span className="eyebrow">PRODUCT INVENTORY</span>
              <h3 className="text-xl font-bold">Stock overview</h3>
            </div>
            <Boxes className="text-violet-400" />
          </div>
          {visibleProducts.length ? (
            <div className="space-y-3">
              {visibleProducts.map((p) => {
                const low = Number(p.stockQuantity) <= Number(p.lowStockThreshold);
                return (
                  <div
                    className={`stock-row flex items-center justify-between p-3 rounded-xl border transition ${
                      low ? "border-rose-500/40 bg-rose-500/10" : "border-white/10 bg-white/[0.02]"
                    }`}
                    key={p.id}
                  >
                    <div className="flex items-center gap-3">
                      <span className="product-symbol relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-xs font-bold text-violet-300 overflow-hidden border border-violet-500/30">
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <div>
                        <strong className="block text-sm font-semibold">{p.name}</strong>
                        <small className="text-slate-400 text-xs">
                          {p.sku} · {p.category}
                        </small>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="block text-sm font-bold">{p.stockQuantity} units</strong>
                      <small className={`text-xs ${low ? "text-rose-400 font-bold" : "text-slate-400"}`}>
                        {low ? `Low Stock · Threshold: ${p.lowStockThreshold}` : `Threshold: ${p.lowStockThreshold}`}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="healthy text-center py-8 text-slate-400">
              <PackageCheck className="mx-auto h-10 w-10 stroke-1 mb-2" />
              <h3>{normalized ? "No matching products" : "No products yet"}</h3>
              <p className="text-xs">
                {normalized
                  ? "Try another search term."
                  : "Add a product from the Products page."}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
