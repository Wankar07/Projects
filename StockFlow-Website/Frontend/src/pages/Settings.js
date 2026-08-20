import { useEffect, useState } from "react";
import { BellRing, Building2, CheckCircle2, Save } from "lucide-react";
import { Button, Loading, PageHeader } from "../components/UI";
import { errorMessage, settingsApi } from "../services/api";

const defaults = {
  companyName: "StockFlow Inventory",
  gstin: "",
  phone: "",
  address: "",
  lowStockThreshold: 10,
  criticalStockThreshold: 5,
  reorderLeadDays: 7,
  defaultGst: 18,
  emailLowStock: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaults),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [savedSection, setSavedSection] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    settingsApi
      .get(controller.signal)
      .then((data) => setSettings({ ...defaults, ...data }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setSettings(defaults);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const update = (event) => {
    const { name, type, checked, value } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSavedSection("");
  };
  const save = async (event, section) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...settings,
        lowStockThreshold: Number(settings.lowStockThreshold),
        criticalStockThreshold: Number(settings.criticalStockThreshold),
        reorderLeadDays: Number(settings.reorderLeadDays),
        defaultGst: Number(settings.defaultGst),
      };
      const saved = await settingsApi.save(payload);
      setSettings({ ...defaults, ...saved });
      setSavedSection(section);
    } catch (error) {
      setError(errorMessage(error, "Unable to save settings to the database."));
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading />;
  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE CONTROL"
        title="Settings"
        description="Manage company details, inventory defaults, and low-stock notifications."
      />
      {error && <div className="inline-error">{error}</div>}
      <div className="settings-grid">
        <form
          className="settings-card"
          onSubmit={(event) => save(event, "company")}
        >
          <header className="settings-card-head">
            <span className="settings-icon">
              <Building2 />
            </span>
            <div>
              <h3>Company Info</h3>
              <p>Details stored in the shared StockFlow database.</p>
            </div>
          </header>
          <div className="settings-fields">
            <label className="settings-field">
              <span>Company Name</span>
              <input
                name="companyName"
                value={settings.companyName}
                onChange={update}
                placeholder="Enter company name"
                required
              />
            </label>
            <label className="settings-field">
              <span>GSTIN</span>
              <input
                name="gstin"
                value={settings.gstin || ""}
                onChange={update}
                placeholder="27ABCDE1234F1Z5"
                maxLength="15"
              />
            </label>
            <label className="settings-field">
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                value={settings.phone || ""}
                onChange={update}
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="settings-field settings-wide">
              <span>Address</span>
              <textarea
                name="address"
                rows="4"
                value={settings.address || ""}
                onChange={update}
                placeholder="Enter the complete business address"
              />
            </label>
          </div>
          <footer className="settings-actions">
            {savedSection === "company" && (
              <span className="save-confirmation">
                <CheckCircle2 /> Saved to database
              </span>
            )}
            <Button type="submit" disabled={saving}>
              <Save /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </footer>
        </form>
        <form
          className="settings-card"
          onSubmit={(event) => save(event, "alerts")}
        >
          <header className="settings-card-head">
            <span className="settings-icon red">
              <BellRing />
            </span>
            <div>
              <h3>Alert Thresholds</h3>
              <p>Control warnings, reorder timing, and tax defaults.</p>
            </div>
          </header>
          <div className="settings-fields">
            <label className="settings-field">
              <span>Low Stock Threshold</span>
              <input
                name="lowStockThreshold"
                type="number"
                min="1"
                step="1"
                value={settings.lowStockThreshold}
                onChange={update}
                required
              />
              <small>Warn when stock reaches this level.</small>
            </label>
            <label className="settings-field">
              <span>Critical Stock Threshold</span>
              <input
                name="criticalStockThreshold"
                type="number"
                min="0"
                step="1"
                max={settings.lowStockThreshold}
                value={settings.criticalStockThreshold}
                onChange={update}
                required
              />
              <small>Highlight items needing urgent action.</small>
            </label>
            <label className="settings-field">
              <span>Reorder Lead Days</span>
              <input
                name="reorderLeadDays"
                type="number"
                min="0"
                step="1"
                value={settings.reorderLeadDays}
                onChange={update}
                required
              />
              <small>Expected supplier delivery time.</small>
            </label>
            <label className="settings-field">
              <span>Default GST (%)</span>
              <input
                name="defaultGst"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.defaultGst}
                onChange={update}
                required
              />
              <small>Applied when creating new sales.</small>
            </label>
            <label className="settings-toggle settings-wide">
              <input
                name="emailLowStock"
                type="checkbox"
                checked={Boolean(settings.emailLowStock)}
                onChange={update}
              />
              <span className="toggle-control" aria-hidden="true" />
              <span>
                <strong>Email notifications for low stock</strong>
                <small>
                  Receive an email when inventory reaches its warning threshold.
                </small>
              </span>
            </label>
          </div>
          <footer className="settings-actions">
            {savedSection === "alerts" && (
              <span className="save-confirmation">
                <CheckCircle2 /> Saved to database
              </span>
            )}
            <Button type="submit" disabled={saving}>
              <Save /> {saving ? "Saving..." : "Save Settings"}
            </Button>
          </footer>
        </form>
      </div>
    </>
  );
}
