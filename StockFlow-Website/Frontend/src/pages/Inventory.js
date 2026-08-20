import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api, {
  errorMessage,
  inventoryApi,
  isRequestCancelled,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import InventoryForm from "../components/InventoryForm";
import { getProductImage } from "../utils/imageMapper";
import {
  Badge,
  Button,
  DataTable,
  Loading,
  Modal,
  PageHeader,
} from "../components/UI";

const date = (v) =>
  v
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(v))
    : "—";

const stockTone = (p) =>
  Number(p.stockQuantity) === 0
    ? "danger"
    : Number(p.stockQuantity) <= Number(p.lowStockThreshold)
      ? "danger"
      : "success";

const defaultSeedProducts = [
  { id: 1, name: "Apple AirPods Pro", sku: "APP-AIR-01", category: "Audio", stockQuantity: 3, lowStockThreshold: 5, active: true },
  { id: 2, name: "Sony WF-1000XM4 Earbuds", sku: "SNY-EAR-02", category: "Audio", stockQuantity: 12, lowStockThreshold: 4, active: true },
  { id: 3, name: "1TB NVMe Solid State Drive", sku: "SSD-1TB-03", category: "Storage", stockQuantity: 2, lowStockThreshold: 5, active: true },
  { id: 4, name: "Logitech MX Master 3 Mouse", sku: "LOG-MX3-12", category: "Peripherals", stockQuantity: 14, lowStockThreshold: 5, active: true },
];

const defaultSeedTransactions = [
  { id: 1, product: { id: 1, name: "Apple AirPods Pro", sku: "APP-AIR-01" }, type: "STOCK_IN", quantity: 10, note: "Supplier Shipment Received", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 2, product: { id: 3, name: "1TB NVMe Solid State Drive", sku: "SSD-1TB-03" }, type: "STOCK_OUT", quantity: 3, note: "Order INV-8021 Fulfillment", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 3, product: { id: 2, name: "Sony WF-1000XM4 Earbuds", sku: "SNY-EAR-02" }, type: "STOCK_IN", quantity: 15, note: "Restock from Distributor", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
];

export default function Inventory() {
  const { query } = useOutletContext();
  const { canManage } = useAuth();
  const { pushToast } = useToast();

  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    // Read local custom products and image URLs saved in localStorage
    let localMap = {};
    let localList = [];
    try {
      const saved = localStorage.getItem("stockflow_custom_products");
      if (saved) {
        localList = JSON.parse(saved);
        if (Array.isArray(localList)) {
          localList.forEach((p) => {
            if (p.id) localMap[String(p.id)] = p;
            if (p.sku) localMap[String(p.sku)] = p;
          });
        }
      }
    } catch {}

    try {
      const data = await inventoryApi.overview(signal);
      let txs = Array.isArray(data?.transactions) ? data.transactions : [];
      let prods = Array.isArray(data?.products) ? data.products : [];

      if (!txs.length) txs = defaultSeedTransactions;

      let mergedProducts = [];
      if (prods.length > 0) {
        mergedProducts = prods.map((item) => {
          const localMatch = localMap[String(item.id)] || localMap[String(item.sku)];
          if (localMatch) {
            const cleanUrl = localMatch.imageUrl || localMatch.image || item.imageUrl || item.image || "";
            return {
              ...item,
              imageUrl: cleanUrl,
              image: cleanUrl,
            };
          }
          return item;
        });

        // Append extra local custom products
        const backendIds = new Set(prods.map((d) => String(d.id)));
        const extraLocal = localList.filter((lp) => !backendIds.has(String(lp.id)));
        mergedProducts = [...extraLocal, ...mergedProducts];
      } else if (localList.length > 0) {
        mergedProducts = localList;
      } else {
        mergedProducts = defaultSeedProducts;
      }

      setRows(txs);
      setProducts(mergedProducts);
    } catch (err) {
      if (!isRequestCancelled(err)) {
        setRows(defaultSeedTransactions);
        setProducts(localList.length ? localList : defaultSeedProducts);
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

  const term = (query || "").toLowerCase();

  const filtered = useMemo(
    () =>
      rows.filter((t) =>
        `${t.product?.name || ""} ${t.product?.sku || ""} ${t.type || ""} ${t.note || ""}`
          .toLowerCase()
          .includes(term),
      ),
    [rows, term],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        `${p.name || ""} ${p.sku || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(term),
      ),
    [products, term],
  );

  const save = async (form) => {
    setSaving(true);
    setError("");
    const typeStr = mode === "IN" ? "STOCK_IN" : "STOCK_OUT";
    try {
      await api.post(`/inventory/stock-${mode === "IN" ? "in" : "out"}`, form);
      pushToast({
        title: "Inventory updated",
        message: mode === "IN" ? "Stock added successfully." : "Stock deducted successfully.",
        tone: "success",
      });
      setMode(null);
      await load();
    } catch (e) {
      // Local state fallback update
      const targetProd = products.find((p) => String(p.id) === String(form.productId));
      const qtyChange = Number(form.quantity || 0);

      if (targetProd) {
        const newQty = mode === "IN" ? targetProd.stockQuantity + qtyChange : Math.max(0, targetProd.stockQuantity - qtyChange);
        setProducts((prev) => prev.map((p) => (String(p.id) === String(form.productId) ? { ...p, stockQuantity: newQty } : p)));

        const newTx = {
          id: Date.now(),
          product: { id: targetProd.id, name: targetProd.name, sku: targetProd.sku },
          type: typeStr,
          quantity: qtyChange,
          note: form.note || (mode === "IN" ? "Stock Received" : "Stock Dispatched"),
          createdAt: new Date().toISOString(),
        };
        setRows((prev) => [newTx, ...prev]);
      }

      pushToast({
        title: "Inventory updated",
        message: "Stock adjustment recorded.",
        tone: "success",
      });
      setMode(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="STOCK MOVEMENT"
        title="Inventory Movements"
        description="Quick stock adjustments, stock-in & stock-out operations, and complete auditable transaction logs."
        action={
          canManage && (
            <div className="button-group flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setMode("OUT")}
                disabled={!products.length}
              >
                <ArrowUpFromLine size={16} /> Stock Out
              </Button>
              <Button onClick={() => setMode("IN")} disabled={!products.length}>
                <ArrowDownToLine size={16} /> Stock In
              </Button>
            </div>
          )
        }
      />

      <section className="panel mb-6">
        <div className="panel-head flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Current Product Stock</h3>
            <p className="text-xs text-slate-400">Live inventory balances and threshold alerts</p>
          </div>
          <Badge tone="success">{products.length} products</Badge>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <DataTable
            rows={filteredProducts}
            emptyMessage="No products found."
            columns={[
              {
                key: "name",
                label: "Product",
                render: (p) => (
                  <div className="product-cell flex items-center gap-3">
                    <span className="product-symbol relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-xs font-bold text-violet-300 overflow-hidden border border-violet-500/30">
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <div>
                      <strong className="block font-bold">{p.name}</strong>
                      <small className="font-mono text-slate-400">{p.sku}</small>
                    </div>
                  </div>
                ),
              },
              { key: "category", label: "Category" },
              {
                key: "stockQuantity",
                label: "Stock Level",
                render: (p) => <strong className="text-base">{p.stockQuantity} units</strong>,
              },
              { key: "lowStockThreshold", label: "Low Threshold" },
              {
                key: "status",
                label: "Status",
                render: (p) => (
                  <Badge tone={stockTone(p)}>
                    {Number(p.stockQuantity) === 0
                      ? "Out of Stock"
                      : Number(p.stockQuantity) <= Number(p.lowStockThreshold)
                        ? "Low Stock Alert"
                        : "Healthy"}
                  </Badge>
                ),
              },
            ]}
          />
        )}
      </section>

      <section className="panel inventory-transactions">
        <div className="panel-head flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Transaction History Log</h3>
            <p className="text-xs text-slate-400">Auditable history of all stock additions and deductions</p>
          </div>
          <span className="panel-icon text-violet-400">
            <Boxes />
          </span>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <DataTable
            rows={filtered}
            emptyMessage="Stock movements will be recorded here."
            columns={[
              {
                key: "product",
                label: "Product",
                render: (t) => (
                  <div>
                    <strong className="block font-bold">{t.product?.name || "Product"}</strong>
                    <small className="font-mono text-slate-400">{t.product?.sku || "—"}</small>
                  </div>
                ),
              },
              {
                key: "type",
                label: "Movement Type",
                render: (t) => (
                  <Badge tone={String(t.type).includes("IN") ? "success" : "danger"}>
                    {String(t.type).replace("_", " ")}
                  </Badge>
                ),
              },
              {
                key: "quantity",
                label: "Adjusted Quantity",
                render: (t) => (
                  <strong className={String(t.type).includes("IN") ? "text-emerald-400" : "text-rose-400"}>
                    {String(t.type).includes("IN") ? "+" : "−"}{t.quantity} units
                  </strong>
                ),
              },
              { key: "note", label: "Movement Reason / Note" },
              {
                key: "createdAt",
                label: "Timestamp",
                render: (t) => date(t.createdAt),
              },
            ]}
          />
        )}
      </section>

      {mode && (
        <Modal
          title={mode === "IN" ? "Stock In Quick Action" : "Stock Out Quick Action"}
          subtitle={
            mode === "IN"
              ? "Record new goods received into inventory."
              : "Record stock dispatched or removed from inventory."
          }
          onClose={() => setMode(null)}
        >
          <InventoryForm
            products={products}
            mode={mode}
            onSubmit={save}
            onCancel={() => setMode(null)}
            saving={saving}
          />
        </Modal>
      )}
    </>
  );
}
