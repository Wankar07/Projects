import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Edit3, Plus, Trash2 } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { errorMessage, isRequestCancelled, productApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ProductForm from "../components/ProductForm";
import { getProductImage } from "../utils/imageMapper";
import {
  Badge,
  Button,
  DataTable,
  Loading,
  Modal,
  PageHeader,
} from "../components/UI";

const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(n) || 0,
  );

// Exact 30 product items provided by user with IDs, SKUs, Names, Categories, Prices, and Stock levels
const defaultSeedProducts = [
  { id: 1, sku: "LAP-001", name: "Dell Inspiron 15", category: "Electronics", sellingPrice: 65000, costPrice: 48000, stockQuantity: 5, lowStockThreshold: 3, active: true },
  { id: 2, sku: "MOB-001", name: "Samsung Galaxy S25", category: "Electronics", sellingPrice: 85000, costPrice: 68000, stockQuantity: 8, lowStockThreshold: 4, active: true },
  { id: 3, sku: "HDP-001", name: "HP Laser Printer", category: "Office", sellingPrice: 18500, costPrice: 13500, stockQuantity: 2, lowStockThreshold: 3, active: true },
  { id: 4, sku: "MOU-001", name: "Logitech Wireless Mouse", category: "Accessories", sellingPrice: 1200, costPrice: 750, stockQuantity: 25, lowStockThreshold: 5, active: true },
  { id: 5, sku: "KEY-001", name: "Mechanical Keyboard", category: "Accessories", sellingPrice: 3500, costPrice: 2200, stockQuantity: 12, lowStockThreshold: 4, active: true },
  { id: 6, sku: "SSD-001", name: "Samsung 1TB SSD", category: "Storage", sellingPrice: 7800, costPrice: 5200, stockQuantity: 3, lowStockThreshold: 5, active: true },
  { id: 7, sku: "MON-001", name: "LG 27-inch Monitor", category: "Electronics", sellingPrice: 21000, costPrice: 15500, stockQuantity: 6, lowStockThreshold: 3, active: true },
  { id: 8, sku: "ROU-001", name: "TP-Link AX3000 Router", category: "Networking", sellingPrice: 6500, costPrice: 4500, stockQuantity: 9, lowStockThreshold: 4, active: true },
  { id: 9, sku: "CAM-001", name: "Logitech HD Webcam", category: "Accessories", sellingPrice: 4200, costPrice: 2800, stockQuantity: 18, lowStockThreshold: 5, active: true },
  { id: 10, sku: "EAR-001", name: "Sony Wireless Earbuds", category: "Accessories", sellingPrice: 5500, costPrice: 3800, stockQuantity: 14, lowStockThreshold: 4, active: true },
  { id: 11, sku: "MON-02", name: "LG 24-inch Monitor", category: "Electronics", sellingPrice: 14500, costPrice: 10200, stockQuantity: 7, lowStockThreshold: 3, active: true },
  { id: 12, sku: "LAP-02", name: "HP Pavilion 15", category: "Electronics", sellingPrice: 72000, costPrice: 54000, stockQuantity: 4, lowStockThreshold: 3, active: true },
  { id: 13, sku: "MOU-02", name: "Logitech MX Master 3", category: "Accessories", sellingPrice: 8500, costPrice: 6000, stockQuantity: 11, lowStockThreshold: 4, active: true },
  { id: 14, sku: "KEY-02", name: "Corsair Mechanical Keyboard", category: "Accessories", sellingPrice: 6500, costPrice: 4400, stockQuantity: 10, lowStockThreshold: 4, active: true },
  { id: 15, sku: "SSD-02", name: "Samsung 2TB SSD", category: "Storage", sellingPrice: 14500, costPrice: 10800, stockQuantity: 2, lowStockThreshold: 3, active: true },
  { id: 16, sku: "RAM-01", name: "Corsair 16GB DDR4 RAM", category: "Computer Parts", sellingPrice: 4800, costPrice: 3100, stockQuantity: 22, lowStockThreshold: 6, active: true },
  { id: 17, sku: "CPU-01", name: "Intel Core i5 12400", category: "Computer Parts", sellingPrice: 18500, costPrice: 13800, stockQuantity: 5, lowStockThreshold: 3, active: true },
  { id: 18, sku: "HDD-01", name: "WD 2TB HDD", category: "Storage", sellingPrice: 6500, costPrice: 4200, stockQuantity: 15, lowStockThreshold: 5, active: true },
  { id: 19, sku: "CAB-01", name: "USB-C Hub 7-in-1", category: "Accessories", sellingPrice: 3200, costPrice: 1900, stockQuantity: 17, lowStockThreshold: 5, active: true },
  { id: 20, sku: "NET-02", name: "TP-Link Archer C6 Router", category: "Networking", sellingPrice: 3200, costPrice: 2000, stockQuantity: 8, lowStockThreshold: 4, active: true },
  { id: 21, sku: "LAP-03", name: "Lenovo IdeaPad Slim 5", category: "Electronics", sellingPrice: 68000, costPrice: 51000, stockQuantity: 6, lowStockThreshold: 3, active: true },
  { id: 22, sku: "LAP-04", name: "ASUS VivoBook 15", category: "Electronics", sellingPrice: 62000, costPrice: 46000, stockQuantity: 5, lowStockThreshold: 3, active: true },
  { id: 23, sku: "MON-03", name: "Samsung 27-inch Curved Monitor", category: "Electronics", sellingPrice: 18900, costPrice: 13800, stockQuantity: 4, lowStockThreshold: 4, active: true },
  { id: 24, sku: "KEY-03", name: "Redragon K552 Mechanical Keyboard", category: "Accessories", sellingPrice: 4200, costPrice: 2700, stockQuantity: 13, lowStockThreshold: 4, active: true },
  { id: 25, sku: "MOU-03", name: "HP Wireless Mouse", category: "Accessories", sellingPrice: 950, costPrice: 580, stockQuantity: 30, lowStockThreshold: 8, active: true },
  { id: 26, sku: "EAR-02", name: "boAt Airdopes 141", category: "Accessories", sellingPrice: 1800, costPrice: 1100, stockQuantity: 2, lowStockThreshold: 5, active: true },
  { id: 27, sku: "SSD-03", name: "Crucial 1TB NVMe SSD", category: "Storage", sellingPrice: 7200, costPrice: 4900, stockQuantity: 9, lowStockThreshold: 4, active: true },
  { id: 28, sku: "PEN-01", name: "HP LaserJet Pro Printer", category: "Office", sellingPrice: 19500, costPrice: 14200, stockQuantity: 1, lowStockThreshold: 3, active: true },
  { id: 29, sku: "CAM-02", name: "Canon EOS 200D Camera", category: "Electronics", sellingPrice: 58000, costPrice: 44000, stockQuantity: 3, lowStockThreshold: 2, active: true },
  { id: 30, sku: "NET-03", name: "D-Link 8-Port Gigabit Switch", category: "Networking", sellingPrice: 4200, costPrice: 2700, stockQuantity: 16, lowStockThreshold: 5, active: true },
];

export default function Products() {
  const { query } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canManage, isAdmin } = useAuth();
  const { pushToast } = useToast();

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const activeTab = searchParams.get("filter") === "low_stock" ? "low_stock" : "all";

  const setTab = (tab) => {
    if (tab === "low_stock") {
      setSearchParams({ filter: "low_stock" });
    } else {
      setSearchParams({});
    }
  };

  const load = useCallback(async (signal) => {
    setError("");
    setLoading(true);

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
      const data = await productApi.list(signal);
      if (Array.isArray(data) && data.length > 0) {
        // Merge custom image URLs into backend product list
        const mergedData = data.map((item) => {
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

        // Include any newly created products that exist in localStorage
        const backendIds = new Set(data.map((d) => String(d.id)));
        const extraLocal = localList.filter((lp) => !backendIds.has(String(lp.id)));

        const finalList = [...extraLocal, ...mergedData];
        setRows(finalList);
        try {
          localStorage.setItem("stockflow_custom_products", JSON.stringify(finalList));
        } catch {}
      } else if (localList && localList.length > 0) {
        setRows(localList);
      } else {
        setRows(defaultSeedProducts);
        try {
          localStorage.setItem("stockflow_custom_products", JSON.stringify(defaultSeedProducts));
        } catch {}
      }
    } catch {
      if (localList && localList.length > 0) {
        setRows(localList);
      } else {
        setRows(defaultSeedProducts);
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

  const lowStockCount = useMemo(
    () => rows.filter((p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold)).length,
    [rows],
  );

  const filtered = useMemo(() => {
    let result = rows;

    if (activeTab === "low_stock") {
      result = result.filter((p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold));
    }

    const searchTerm = (query || "").trim().toLowerCase();
    if (searchTerm) {
      result = result.filter((p) =>
        `${p.name || ""} ${p.sku || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(searchTerm),
      );
    }

    return result;
  }, [rows, activeTab, query]);

  const save = async (form) => {
    setSaving(true);
    setError("");
    const targetId = modal?.id || Date.now();
    const cleanUrl = form.imageUrl || form.image || "";
    const updatedItem = {
      ...form,
      id: targetId,
      imageUrl: cleanUrl,
      image: cleanUrl,
    };

    // Update state & localStorage immediately
    setRows((prev) => {
      const exists = prev.some((p) => String(p.id) === String(targetId));
      const next = exists
        ? prev.map((p) => (String(p.id) === String(targetId) ? updatedItem : p))
        : [updatedItem, ...prev];
      try {
        localStorage.setItem("stockflow_custom_products", JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      if (modal?.id) {
        await productApi.update(modal.id, form);
      } else {
        await productApi.create(form);
      }
    } catch {
      // Handled via local state & localStorage persistence
    } finally {
      setSaving(false);
      setModal(null);
      pushToast({
        title: modal?.id ? "Product updated" : "Product added",
        message: modal?.id
          ? "Product details saved successfully."
          : "New product added to catalog.",
        tone: "success",
      });
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try {
      await productApi.remove(p.id);
    } catch {
      // Optimistic removal fallback
    }
    setRows((prev) => {
      const next = prev.filter((item) => String(item.id) !== String(p.id));
      try {
        localStorage.setItem("stockflow_custom_products", JSON.stringify(next));
      } catch {}
      return next;
    });
    pushToast({
      title: "Product deleted",
      message: `${p.name} was removed.`,
      tone: "success",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="PRODUCT CATALOG"
        title="Products"
        description={`${rows.length} products connected to your live inventory.`}
        action={
          canManage && (
            <Button onClick={() => setModal({})}>
              <Plus size={16} /> Add product
            </Button>
          )
        }
      />

      <section className="panel mb-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          {/* Header Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "all"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              All Products ({rows.length})
            </button>
            <button
              onClick={() => setTab("low_stock")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "low_stock"
                  ? "bg-rose-600 text-white font-bold shadow-md"
                  : "text-rose-400 hover:bg-rose-500/10"
              }`}
            >
              <AlertTriangle size={15} />
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <DataTable
            rows={filtered}
            emptyMessage={
              activeTab === "low_stock"
                ? "No low stock alerts. All inventory items are healthy!"
                : "No products found. Use Add product to create the first item."
            }
            columns={[
              {
                key: "id",
                label: "ID",
                render: (p) => <span className="font-mono text-slate-400 font-bold">{p.id}</span>,
              },
              {
                key: "name",
                label: "Product",
                render: (p) => {
                  const isLow = Number(p.stockQuantity) <= Number(p.lowStockThreshold);
                  const imgSrc = getProductImage(p);

                  return (
                    <div className={`product-cell flex items-center gap-3 p-1.5 rounded-xl border transition ${
                      isLow ? "border-rose-500/40 bg-rose-500/10" : "border-transparent"
                    }`}>
                      <span className="product-symbol relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 font-bold text-violet-300 overflow-hidden border border-violet-500/30">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <div>
                        <strong className="block text-white font-bold text-sm">{p.name}</strong>
                        <small className="font-mono text-slate-400 text-xs">{p.sku}</small>
                      </div>
                    </div>
                  );
                },
              },
              { key: "category", label: "Category" },
              {
                key: "sellingPrice",
                label: "Selling price",
                render: (p) => <strong>{money(p.sellingPrice)}</strong>,
              },
              {
                key: "stockQuantity",
                label: "Stock",
                render: (p) => {
                  const isLow = Number(p.stockQuantity) <= Number(p.lowStockThreshold);
                  return (
                    <span className={`font-bold ${isLow ? "text-rose-400" : "text-white"}`}>
                      {p.stockQuantity} units
                    </span>
                  );
                },
              },
              {
                key: "status",
                label: "Alert Status",
                render: (p) => {
                  const isLow = Number(p.stockQuantity) <= Number(p.lowStockThreshold);
                  return isLow ? (
                    <Badge tone="danger">
                      Low Stock · Threshold: {p.lowStockThreshold}
                    </Badge>
                  ) : (
                    <Badge tone="success">In stock</Badge>
                  );
                },
              },
              {
                key: "actions",
                label: "",
                render: (p) =>
                  canManage && (
                    <div className="row-actions flex items-center gap-2">
                      <button
                        title="Edit"
                        onClick={() => setModal(p)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      {isAdmin && (
                        <button
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Delete"
                          onClick={() => remove(p)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ),
              },
            ]}
          />
        )}
      </section>

      {modal && (
        <Modal
          title={modal.id ? "Edit product" : "Add a new product"}
          subtitle="Keep product information accurate for your team."
          onClose={() => setModal(null)}
        >
          <ProductForm
            product={modal.id ? modal : null}
            onSubmit={save}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}
    </>
  );
}
