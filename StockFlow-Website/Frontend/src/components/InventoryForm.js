import { useState } from "react";
import { Button, Field } from "./UI";
export default function InventoryForm({
  products,
  mode = "IN",
  onSubmit,
  onCancel,
  saving,
}) {
  const [form, setForm] = useState({ productId: "", quantity: 1, note: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          productId: Number(form.productId),
          quantity: Number(form.quantity),
        });
      }}
      className="form-grid"
    >
      <Field label="Product">
        <select
          required
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.stockQuantity} in stock
            </option>
          ))}
        </select>
      </Field>
      <Field label="Quantity">
        <input
          required
          min="1"
          type="number"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
      </Field>
      <Field label="Note">
        <textarea
          rows="3"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder={
            mode === "IN"
              ? "Supplier delivery, return…"
              : "Order fulfillment, damage…"
          }
        />
      </Field>
      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={saving}>
          {saving ? "Updating…" : mode === "IN" ? "Add stock" : "Remove stock"}
        </Button>
      </div>
    </form>
  );
}
