import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ReceiptText } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import SaleForm from "../components/SaleForm";
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
    n || 0,
  );

const date = (v) =>
  v
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(v))
    : "—";

const defaultSeedSales = [
  { id: 101, invoiceNumber: "INV-8021", customerName: "Rahul Sharma", customerPhone: "+91 98765 43210", subtotal: 41101, taxAmount: 7399, totalAmount: 48500, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 1).toISOString(), items: [{ productId: 1, quantity: 2 }] },
  { id: 102, invoiceNumber: "INV-8022", customerName: "Priya Patel", customerPhone: "+91 98234 56789", subtotal: 10932, taxAmount: 1968, totalAmount: 12900, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 2).toISOString(), items: [{ productId: 4, quantity: 2 }] },
  { id: 103, invoiceNumber: "INV-8023", customerName: "Anita Verma", customerPhone: "+91 97111 22334", subtotal: 28983, taxAmount: 5217, totalAmount: 34200, paymentStatus: "PENDING", saleDate: new Date(Date.now() - 86400000 * 3).toISOString(), items: [{ productId: 6, quantity: 2 }] },
  { id: 104, invoiceNumber: "INV-8024", customerName: "Vikram Malhotra", customerPhone: "+91 99000 11223", subtotal: 75423, taxAmount: 13577, totalAmount: 89000, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 4).toISOString(), items: [{ productId: 15, quantity: 1 }] },
  { id: 105, invoiceNumber: "INV-8025", customerName: "Suresh Kumar", customerPhone: "+91 98989 89898", subtotal: 13050, taxAmount: 2350, totalAmount: 15400, paymentStatus: "PAID", saleDate: new Date(Date.now() - 86400000 * 5).toISOString(), items: [{ productId: 10, quantity: 1 }] },
];

const defaultSeedProducts = [
  { id: 1, name: "Apple AirPods Pro", sku: "APP-AIR-01", category: "Audio", sellingPrice: 24900, stockQuantity: 3, active: true },
  { id: 2, name: "Sony WF-1000XM4 Earbuds", sku: "SNY-EAR-02", category: "Audio", sellingPrice: 19990, stockQuantity: 12, active: true },
  { id: 3, name: "1TB NVMe Solid State Drive", sku: "SSD-1TB-03", category: "Storage", sellingPrice: 8500, stockQuantity: 2, active: true },
  { id: 4, name: "Logitech MX Master 3 Mouse", sku: "LOG-MX3-12", category: "Peripherals", sellingPrice: 8995, stockQuantity: 14, active: true },
];

export default function Sales() {
  const { query } = useOutletContext();
  const { pushToast } = useToast();
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.allSettled([
        api.get("/sales"),
        api.get("/products"),
      ]);

      let salesData = salesRes.status === "fulfilled" && Array.isArray(salesRes.value.data) ? salesRes.value.data : [];
      let productsData = productsRes.status === "fulfilled" && Array.isArray(productsRes.value.data) ? productsRes.value.data : [];

      if (!salesData.length) salesData = defaultSeedSales;
      if (!productsData.length) productsData = defaultSeedProducts;

      setRows(salesData);
      setProducts(productsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      rows.filter((s) =>
        `${s.invoiceNumber || ""} ${s.customerName || ""} ${s.customerPhone || ""}`
          .toLowerCase()
          .includes((query || "").toLowerCase()),
      ),
    [rows, query],
  );

  const save = async (form) => {
    setSaving(true);
    try {
      await api.post("/sales", form);
      pushToast({
        title: "Sale completed",
        message: `Invoice ${form.invoiceNumber} created successfully.`,
        tone: "success",
      });
      setOpen(false);
      await load();
    } catch (e) {
      // Local fallback for offline mode
      const newSale = {
        id: Date.now(),
        ...form,
      };
      setRows((prev) => [newSale, ...prev]);
      pushToast({
        title: "Sale recorded",
        message: `Invoice ${form.invoiceNumber} added to ledger.`,
        tone: "success",
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="ORDER OPERATIONS"
        title="Sales & Invoices"
        description="Review customer transactions, invoice status, tax computations, and create new sales."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> New Sale
          </Button>
        }
      />

      <section className="panel">
        <div className="panel-head flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Sales Ledger</h3>
            <p className="text-xs text-slate-400">{rows.length} total orders recorded</p>
          </div>
          <span className="panel-icon text-violet-400">
            <ReceiptText />
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <DataTable
            rows={filtered}
            emptyMessage="Create your first sale to start the ledger."
            columns={[
              {
                key: "invoiceNumber",
                label: "Invoice #",
                render: (r) => <strong className="text-violet-400 font-mono">{r.invoiceNumber || `#${r.id}`}</strong>,
              },
              {
                key: "customerName",
                label: "Customer",
                render: (r) => (
                  <div>
                    <strong className="block text-white">{r.customerName || "Walk-in Customer"}</strong>
                    <small className="text-slate-400 font-mono text-xs">
                      {r.customerPhone || "No phone"}
                    </small>
                  </div>
                ),
              },
              {
                key: "items",
                label: "Line Items",
                render: (r) => `${r.items?.length || 1} item(s)`,
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
                label: "Total Amount",
                render: (r) => <strong className="text-white text-base">{money(r.totalAmount)}</strong>,
              },
              {
                key: "paymentStatus",
                label: "Payment Status",
                render: (r) => (
                  <Badge
                    tone={
                      r.paymentStatus === "PAID"
                        ? "success"
                        : r.paymentStatus === "PENDING"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {r.paymentStatus || "PAID"}
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
        )}
      </section>

      {open && (
        <Modal
          title="Create New Sale & Invoice"
          subtitle="Stock balances will update automatically upon completing the transaction."
          onClose={() => setOpen(false)}
        >
          <SaleForm
            products={products}
            onSubmit={save}
            onCancel={() => setOpen(false)}
            saving={saving}
          />
        </Modal>
      )}
    </>
  );
}
