import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  Copy,
  Database,
  Mic,
  MicOff,
  PackageCheck,
  PackageX,
  RefreshCw,
  RotateCcw,
  Send,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Badge, Button, PageHeader } from "../components/UI";
import { getProductImage } from "../utils/imageMapper";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const defaultSeedProducts = [
  { id: 1, name: "Apple AirPods Pro", sku: "APP-AIR-01", category: "Audio", sellingPrice: 24900, costPrice: 18000, stockQuantity: 3, lowStockThreshold: 5, active: true },
  { id: 2, name: "Sony WF-1000XM4 Earbuds", sku: "SNY-EAR-02", category: "Audio", sellingPrice: 19990, costPrice: 14500, stockQuantity: 12, lowStockThreshold: 4, active: true },
  { id: 3, name: "1TB NVMe Solid State Drive", sku: "SSD-1TB-03", category: "Storage", sellingPrice: 8500, costPrice: 5800, stockQuantity: 2, lowStockThreshold: 5, active: true },
  { id: 4, name: "Logitech MX Master 3 Mouse", sku: "LOG-MX3-12", category: "Peripherals", sellingPrice: 8995, costPrice: 6200, stockQuantity: 14, lowStockThreshold: 5, active: true },
  { id: 5, name: "HP LaserJet Desktop Printer", sku: "HPL-PRN-06", category: "Office", sellingPrice: 16500, costPrice: 12000, stockQuantity: 1, lowStockThreshold: 3, active: true },
];

const defaultSeedSales = [
  { id: 101, invoiceNumber: "INV-8021", customerName: "Rahul Sharma", totalAmount: 48500, paymentStatus: "PAID" },
  { id: 102, invoiceNumber: "INV-8022", customerName: "Priya Patel", totalAmount: 12900, paymentStatus: "PAID" },
  { id: 103, invoiceNumber: "INV-8023", customerName: "Anita Verma", totalAmount: 34200, paymentStatus: "PENDING" },
  { id: 104, invoiceNumber: "INV-8024", customerName: "Vikram Malhotra", totalAmount: 89000, paymentStatus: "PAID" },
  { id: 105, invoiceNumber: "INV-8025", customerName: "Suresh Kumar", totalAmount: 15400, paymentStatus: "PAID" },
];

const promptCategories = [
  {
    title: "Inventory & Restock",
    icon: PackageX,
    prompts: [
      "Which items are critically low?",
      "List out-of-stock products",
      "Calculate inventory valuation",
    ],
  },
  {
    title: "Sales & Revenue",
    icon: TrendingUp,
    prompts: [
      "Summarize sales performance",
      "Which category brings top sales?",
      "Show pending invoice balances",
    ],
  },
  {
    title: "Daily Operations",
    icon: Zap,
    prompts: [
      "Give me 3 actions for today",
      "Which items need supplier POs?",
      "Show inventory health summary",
    ],
  },
];

export default function AIInsights() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "👋 Welcome to StockFlow AI Executive Intelligence!\n\nI analyze your live inventory balances, revenue inflows, and threshold alerts in real-time. Ask me anything or select a prompt below to get started.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const nextId = useRef(2);
  const messagesEndRef = useRef(null);

  // Read live snapshot or local storage
  const loadSnapshot = useCallback(async () => {
    let localList = [];
    try {
      const saved = localStorage.getItem("stockflow_custom_products");
      if (saved) {
        localList = JSON.parse(saved);
      }
    } catch {}

    try {
      const [pRes, sRes] = await Promise.allSettled([
        api.get("/products"),
        api.get("/sales"),
      ]);

      let pData = pRes.status === "fulfilled" && Array.isArray(pRes.value.data) && pRes.value.data.length ? pRes.value.data : (localList.length ? localList : defaultSeedProducts);
      let sData = sRes.status === "fulfilled" && Array.isArray(sRes.value.data) && sRes.value.data.length ? sRes.value.data : defaultSeedSales;

      setProducts(pData);
      setSales(sData);
    } catch {
      setProducts(localList.length ? localList : defaultSeedProducts);
      setSales(defaultSeedSales);
    }
  }, []);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Executive Metrics Computations
  const stats = useMemo(() => {
    const totalCount = products.length;
    const lowStockList = products.filter(
      (p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold)
    );
    const outOfStockList = products.filter((p) => Number(p.stockQuantity) === 0);
    const healthyCount = Math.max(0, totalCount - lowStockList.length);
    const healthPercentage = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100;

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const valuation = products.reduce(
      (sum, p) => sum + Number(p.costPrice || p.sellingPrice || 0) * Number(p.stockQuantity || 0),
      0
    );

    return {
      totalCount,
      lowStockCount: lowStockList.length,
      outOfStockCount: outOfStockList.length,
      healthPercentage,
      totalRevenue,
      valuation,
      lowStockList,
    };
  }, [products, sales]);

  // Voice Input Speech Recognition Handler
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          ask(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  /**
   * Supercharged Intelligence Engine (Offline Fallback Handler)
   */
  const handleOfflineQueryEngine = (question) => {
    const q = question.toLowerCase();

    // Query 1: Out of stock
    if (q.includes("out of stock") || q.includes("zero stock") || q.includes("empty")) {
      const outList = products.filter((p) => Number(p.stockQuantity) === 0);
      if (!outList.length) {
        return {
          text: "✅ **Stock Status Excellent:** No products are currently out of stock (0 units). All items in your catalog have available units.",
          type: "status",
        };
      }

      const listStr = outList
        .map((p) => `• 🚨 **${p.name}** (${p.sku}) — Category: ${p.category}`)
        .join("\n");

      return {
        text: `🚨 **Critical Out-Of-Stock Alert (${outList.length} Item(s)):**\n\nThe following items have reached 0 inventory:\n\n${listStr}\n\n💡 *Recommendation:* Reorder immediately from your supplier to minimize order fulfillment delay.`,
        action: { label: "View Products", path: "/products?filter=low_stock" },
      };
    }

    // Query 2: Low Stock / Restock / Replenish
    if (q.includes("restock") || q.includes("low stock") || q.includes("replenish") || q.includes("threshold") || q.includes("po")) {
      const lowList = products.filter(
        (p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold)
      );

      if (!lowList.length) {
        return {
          text: "🎉 **Catalog Healthy!** All products are above their minimum low stock thresholds. No immediate reorders required.",
          type: "status",
        };
      }

      const listStr = lowList
        .map(
          (p) =>
            `• ⚠️ **${p.name}** (${p.sku}): **${p.stockQuantity} units** remaining (Threshold: ${p.lowStockThreshold} units)`
        )
        .join("\n");

      return {
        text: `⚠️ **Low Stock Replenishment Alert (${lowList.length} Product(s)):**\n\nThe following items need urgent purchase orders:\n\n${listStr}\n\n💡 *Action:* Generate purchase orders immediately to avoid stockouts.`,
        action: { label: "Review Low Stock Filter", path: "/products?filter=low_stock" },
        items: lowList.slice(0, 4),
      };
    }

    // Query 3: Sales / Revenue / Performance
    if (q.includes("summarize sales") || q.includes("sales") || q.includes("revenue") || q.includes("income") || q.includes("invoice")) {
      const totalRev = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
      const totalOrders = sales.length;
      const paidOrders = sales.filter((s) => s.paymentStatus === "PAID").length;
      const pendingOrders = sales.filter((s) => s.paymentStatus === "PENDING").length;
      const pendingAmount = sales
        .filter((s) => s.paymentStatus === "PENDING")
        .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
      const avgOrder = totalOrders > 0 ? totalRev / totalOrders : 0;

      return {
        text: `📊 **Financial & Sales Analytics Summary:**\n\n• **Gross Recorded Revenue:** ${money(totalRev)}\n• **Total Invoices:** ${totalOrders} orders\n• **Average Order Value:** ${money(avgOrder)}\n• **Paid Invoices:** ${paidOrders} completed transactions\n• **Pending Receivables:** ${pendingOrders} invoice(s) totaling ${money(pendingAmount)}\n\n📈 *Insight:* Cashflow momentum remains solid across recent customer purchases.`,
        action: { label: "View All Sales Invoices", path: "/sales" },
      };
    }

    // Query 4: Inventory Valuation / Asset Value
    if (q.includes("valuation") || q.includes("value") || q.includes("worth") || q.includes("asset")) {
      const totalUnits = products.reduce((sum, p) => sum + Number(p.stockQuantity || 0), 0);
      const costValue = products.reduce(
        (sum, p) => sum + Number(p.costPrice || p.sellingPrice || 0) * Number(p.stockQuantity || 0),
        0
      );
      const retailValue = products.reduce(
        (sum, p) => sum + Number(p.sellingPrice || 0) * Number(p.stockQuantity || 0),
        0
      );
      const profitMargin = retailValue - costValue;

      return {
        text: `💰 **Inventory Asset Valuation Breakdown:**\n\n• **Total Physical Units:** ${totalUnits.toLocaleString()} items in stock\n• **Estimated Inventory Cost:** ${money(costValue)}\n• **Retail Valuation:** ${money(retailValue)}\n• **Projected Gross Margin:** ${money(profitMargin)}\n\n🏢 *Asset Health:* Your warehouse inventory represents strong liquid capital.`,
        action: { label: "View Inventory Movements", path: "/inventory" },
      };
    }

    // Query 5: Category analysis
    if (q.includes("category") || q.includes("categories") || q.includes("department")) {
      const catCounts = {};
      products.forEach((p) => {
        const cat = p.category || "Uncategorized";
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });

      const listStr = Object.entries(catCounts)
        .map(([cat, count]) => `• **${cat}:** ${count} product(s)`)
        .join("\n");

      return {
        text: `📂 **Product Category Distribution (${Object.keys(catCounts).length} Categories):**\n\n${listStr}\n\n💡 *Tip:* Maintain high turnover rates in your dominant categories.`,
        action: { label: "Open Products Catalog", path: "/products" },
      };
    }

    // Query 6: Daily Actions / Recommendations
    if (q.includes("actions") || q.includes("action") || q.includes("today") || q.includes("todo") || q.includes("task")) {
      const lowList = products.filter(
        (p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold)
      );
      const pendingSales = sales.filter((s) => s.paymentStatus === "PENDING");

      return {
        text: `⚡ **Recommended Executive Actions for Today:**\n\n1. 🚨 **Urgent Restock:** Issue Purchase Orders for ${lowList.length} low-stock products (${lowList.slice(0, 3).map((i) => i.name).join(", ") || "None"}).\n2. 💳 **Accounts Receivable:** Collect payment for ${pendingSales.length} pending invoice(s).\n3. 📊 **Audit & Reconciliation:** Review stock movements on recent high-value hardware.`,
        action: { label: "View Low Stock Alerts", path: "/products?filter=low_stock" },
      };
    }

    // Default Intelligence Summary Response
    return {
      text: `🤖 **StockFlow AI Analysis:**\n\n• **Active Catalog:** ${products.length} registered products\n• **Stock Health Score:** ${stats.healthPercentage}%\n• **Low Stock Items:** ${stats.lowStockCount} alert(s)\n• **Recorded Sales Revenue:** ${money(stats.totalRevenue)}\n\nHow else can I assist you? Try selecting one of the suggested query prompts below!`,
    };
  };

  const ask = async (question) => {
    const text = String(question || input).trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", text, timestamp: timeStr },
    ]);

    try {
      const response = await api.post("/ai/chat", { message: text });
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text: response.data.answer || response.data.message,
          model: response.data.model || "StockFlow AI Engine",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // Offline / Live DB Engine fallback
      const offlineResult = handleOfflineQueryEngine(text);
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text: offlineResult.text,
          model: "Grounded Live Database Engine",
          action: offlineResult.action,
          items: offlineResult.items,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const copyText = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        text: "👋 Chat reset. Ask me anything about your products, revenue, or inventory restock schedules!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const submit = (event) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <>
      <PageHeader
        eyebrow="LIVE INVENTORY INTELLIGENCE"
        title="StockFlow AI Assistant"
        description="Grounded executive assistant powered by live inventory balances, revenue calculations, and threshold alerts."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={resetChat}>
              <RotateCcw size={15} /> Reset Chat
            </Button>
            <Button onClick={loadSnapshot}>
              <RefreshCw size={15} /> Refresh Context
            </Button>
          </div>
        }
      />

      {/* Top Executive Health & Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Stock Health Score</span>
            <strong className={`text-2xl font-black ${stats.healthPercentage > 80 ? "text-emerald-400" : stats.healthPercentage > 50 ? "text-amber-400" : "text-rose-400"}`}>
              {stats.healthPercentage}%
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <PackageCheck size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Low Stock Alerts</span>
            <strong className={`text-2xl font-black ${stats.lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {stats.lowStockCount} items
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Recorded Revenue</span>
            <strong className="text-2xl font-black text-violet-400">
              {money(stats.totalRevenue)}
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">Inventory Asset Value</span>
            <strong className="text-2xl font-black text-cyan-400">
              {money(stats.valuation)}
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Database size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left Suggestions & Context Panel */}
        <aside className="space-y-4">
          <div className="panel p-5 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Suggested Prompts</h3>
                <p className="text-xs text-slate-400">Click any topic to query AI</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {promptCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.title} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
                      <Icon size={14} className="text-violet-400" />
                      <span>{cat.title}</span>
                    </div>
                    <div className="space-y-1">
                      {cat.prompts.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => ask(chip)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs ai-prompt-btn transition flex items-center justify-between group"
                        >
                          <span className="truncate">{chip}</span>
                          <ArrowRight size={12} className="text-slate-400 group-hover:text-violet-500 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Query Sync Active
              </p>
              <p>🛡️ All context queries are read-only & instant.</p>
            </div>
          </div>
        </aside>

        {/* Main Interactive Chat Section */}
        <section className="panel flex flex-col justify-between h-[650px] p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/50">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  StockFlow AI Executive Intelligence
                  <Badge tone="success">Active</Badge>
                </h3>
                <p className="text-xs text-slate-400">Powered by Live Database Analysis & Reorder Rules</p>
              </div>
            </div>

            <button
              onClick={resetChat}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1.5"
              title="Clear Conversation"
            >
              <RotateCcw size={14} /> Clear
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      <Bot size={18} />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative group ${
                    isUser
                      ? "ai-msg-bubble-user font-medium"
                      : "ai-msg-bubble-assistant"
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/5 pb-1">
                      <span className="text-[11px] font-bold text-violet-400">
                        {isUser ? "You" : "StockFlow AI"}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">
                        {message.timestamp}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap">{message.text}</p>

                    {/* Preview Cards for Low Stock Items if attached */}
                    {message.items && message.items.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-white/10">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Urgent Reorder Preview:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.items.map((item) => (
                            <div key={item.id} className="p-2 rounded-xl ai-preview-item border flex items-center justify-between text-xs">
                              <div>
                                <strong className="block font-bold">{item.name}</strong>
                                <span>{item.stockQuantity} left (Threshold: {item.lowStockThreshold})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Embedded Action Button inside Response */}
                    {message.action && (
                      <div className="mt-3 pt-2 border-t border-white/10 flex justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(message.action.path)}
                          className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                          {message.action.label} <ArrowRight size={13} />
                        </Button>
                      </div>
                    )}

                    {/* Copy button */}
                    {!isUser && (
                      <button
                        onClick={() => copyText(message.id, message.text)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded transition"
                        title="Copy message"
                      >
                        {copiedId === message.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    )}

                    {message.model && (
                      <span className="block mt-2 text-[10px] text-slate-400 font-mono">
                        Source: {message.model}
                      </span>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white font-bold shadow-md">
                      <UserRound size={18} />
                    </div>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300">
                  <Bot size={18} />
                </div>
                <div className="rounded-2xl bg-[#161224] border border-white/10 px-4 py-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-400 font-medium ml-1">Analyzing database context...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Composer Form */}
          <form className="flex items-center gap-2 pt-3 border-t border-white/10" onSubmit={submit}>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-xl border transition ${
                isListening
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                  : "bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10"
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice Query (Hands-free)"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about restock alerts, sales summaries, or daily operational tasks..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none"
            />
            <Button disabled={sending || !input.trim()} type="submit" className="px-5">
              <Send size={16} />
            </Button>
          </form>
        </section>
      </div>
    </>
  );
}
