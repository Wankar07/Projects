import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button, Field } from "./UI";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n || 0,
  );

export default function SaleForm({ products = [], onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => ({
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: "",
    customerPhone: "",
    paymentStatus: "PAID",
    taxRate: 18, // 18% GST
    items: [{ productId: "", quantity: 1 }],
  }));

  const setItem = (i, k, v) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((x, j) => (j === i ? { ...x, [k]: v } : x)),
    }));

  const subtotal = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const prod = products.find((p) => String(p.id) === String(item.productId));
      const price = Number(prod?.sellingPrice || 0);
      return sum + price * Number(item.quantity || 0);
    }, 0);
  }, [form.items, products]);

  const taxAmount = useMemo(() => {
    return (subtotal * (Number(form.taxRate) || 0)) / 100;
  }, [subtotal, form.taxRate]);

  const totalAmount = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.items.some((i) => i.productId)) {
      alert("Please select at least one product for the sale.");
      return;
    }
    onSubmit({
      ...form,
      subtotal,
      taxAmount,
      totalAmount,
      saleDate: new Date().toISOString(),
      items: form.items
        .filter((i) => i.productId)
        .map((i) => {
          const prod = products.find((p) => String(p.id) === String(i.productId));
          return {
            productId: Number(i.productId),
            productName: prod?.name || "Product",
            quantity: Number(i.quantity),
            price: Number(prod?.sellingPrice || 0),
            totalAmount: Number(prod?.sellingPrice || 0) * Number(i.quantity),
          };
        }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Invoice Number">
          <input
            required
            readOnly
            className="font-mono bg-white/5 cursor-not-allowed"
            value={form.invoiceNumber}
          />
        </Field>

        <Field label="Customer Name">
          <input
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="e.g. Rahul Sharma"
          />
        </Field>

        <Field label="Customer Phone">
          <input
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="Payment Status">
          <select
            value={form.paymentStatus}
            onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
          >
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="PARTIAL">PARTIAL</option>
          </select>
        </Field>
      </div>

      <div className="line-items space-y-3 mb-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h4 className="text-sm font-bold text-slate-200">Line Items</h4>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
            onClick={() =>
              setForm({
                ...form,
                items: [...form.items, { productId: "", quantity: 1 }],
              })
            }
          >
            <Plus size={14} /> Add Product
          </button>
        </div>

        {form.items.map((item, i) => {
          const selectedProd = products.find((p) => String(p.id) === String(item.productId));
          const lineTotal = (selectedProd?.sellingPrice || 0) * (item.quantity || 1);

          return (
            <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/10" key={i}>
              <select
                required
                className="flex-1"
                value={item.productId}
                onChange={(e) => setItem(i, "productId", e.target.value)}
              >
                <option value="">Select product from stock...</option>
                {products
                  .filter((p) => p.active !== false && p.stockQuantity > 0)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {currency(p.sellingPrice)} [{p.stockQuantity} in stock]
                    </option>
                  ))}
              </select>

              <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-white"
                  onClick={() => setItem(i, "quantity", Math.max(1, item.quantity - 1))}
                >
                  <Minus size={14} />
                </button>
                <input
                  min="1"
                  type="number"
                  className="w-12 text-center bg-transparent text-xs font-bold focus:outline-none"
                  value={item.quantity}
                  onChange={(e) => setItem(i, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-white"
                  onClick={() => setItem(i, "quantity", Number(item.quantity) + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="w-28 text-right font-bold text-sm text-violet-300">
                {currency(lineTotal)}
              </div>

              <button
                type="button"
                className="text-rose-400 hover:text-rose-300 p-1 disabled:opacity-30"
                disabled={form.items.length === 1}
                onClick={() =>
                  setForm({
                    ...form,
                    items: form.items.filter((_, j) => j !== i),
                  })
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoice Calculation Summary Box */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-2 text-sm mb-6">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal:</span>
          <span className="font-semibold">{currency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Tax (18% GST):</span>
          <span className="font-semibold">{currency(taxAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-extrabold text-white">
          <span>Total Amount:</span>
          <span className="text-violet-300">{currency(totalAmount)}</span>
        </div>
      </div>

      <div className="modal-actions flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={saving}>
          {saving ? "Creating Invoice…" : "Complete Sale & Generate Invoice"}
        </Button>
      </div>
    </form>
  );
}
