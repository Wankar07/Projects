import { useEffect, useState } from "react";
import { Button, Field } from "./UI";

const blank = {
  sku: "",
  name: "",
  category: "",
  sellingPrice: "",
  costPrice: "",
  stockQuantity: "",
  lowStockThreshold: 5,
  imageUrl: "",
  active: true,
};

export default function ProductForm({ product, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(blank);

  useEffect(
    () => setForm(product ? { ...blank, ...product } : blank),
    [product],
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const cleanUrl = form.imageUrl?.trim() || "";
    onSubmit({
      ...form,
      sellingPrice: Number(form.sellingPrice),
      costPrice: Number(form.costPrice),
      stockQuantity: Number(form.stockQuantity),
      lowStockThreshold: Number(form.lowStockThreshold),
      imageUrl: cleanUrl,
      image: cleanUrl,
    });
  };

  return (
    <form onSubmit={submit} className="form-grid">
      <Field label="Product Name">
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Apple AirPods Pro"
        />
      </Field>
      <Field label="SKU Code">
        <input
          required
          value={form.sku}
          onChange={(e) => set("sku", e.target.value)}
          placeholder="e.g. APP-AIR-01"
        />
      </Field>
      <Field label="Category">
        <input
          required
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="e.g. Audio / Electronics"
        />
      </Field>
      <Field label="Stock Quantity">
        <input
          required
          min="0"
          type="number"
          value={form.stockQuantity}
          onChange={(e) => set("stockQuantity", e.target.value)}
        />
      </Field>
      <Field label="Selling Price (₹)">
        <input
          required
          min="0"
          step="0.01"
          type="number"
          value={form.sellingPrice}
          onChange={(e) => set("sellingPrice", e.target.value)}
        />
      </Field>
      <Field label="Cost Price (₹)">
        <input
          required
          min="0"
          step="0.01"
          type="number"
          value={form.costPrice}
          onChange={(e) => set("costPrice", e.target.value)}
        />
      </Field>
      <Field label="Low Stock Threshold">
        <input
          required
          min="0"
          type="number"
          value={form.lowStockThreshold}
          onChange={(e) => set("lowStockThreshold", e.target.value)}
        />
      </Field>
      <Field label="Custom Image URL (Optional)">
        <input
          type="text"
          value={form.imageUrl || ""}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="Paste image link from Amazon, Flipkart, Unsplash, etc."
        />
      </Field>
      <label className="toggle-field col-span-2 flex items-center gap-2 cursor-pointer mt-2">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
        />
        <span>Product is active for sales</span>
      </label>
      <div className="modal-actions col-span-2 flex justify-end gap-3 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={saving}>
          {saving ? "Saving…" : product ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}
