import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { API_BASE_URL, Endpoints, deleteJSON, getJSON, postJSON, putJSON, uploadFile } from "./api";

// Lightweight icon set
const Icons = {
  candidate: "👤",
  interview: "🗓️",
  client: "🏢",
  rate: "📈",
  upload: "📤",
  bell: "🔔",
  search: "🔎",
  edit: "✏️",
  trash: "🗑️",
};

function useTheme() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return { theme, setTheme };
}

function Loading({ text = "Loading..." }) {
  return <div className="badge">{text}</div>;
}

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="notice" style={{ borderLeftColor: "var(--color-error)" }}>
      <p>{typeof error === "string" ? error : error.message}</p>
      <span className="meta">Check API at {API_BASE_URL}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
export function KpiCard({ icon, title, value, diff }) {
  /** Displays a KPI metric tile */
  return (
    <div className="card kpi-card">
      <div className="kpi-icon" aria-hidden>{icon}</div>
      <div>
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{value}</div>
      </div>
      <div className="kpi-diff">{diff}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Tabs({ value, onChange, tabs }) {
  /** Switch between Candidate, Interview, Client */
  return (
    <div className="tabs" role="tablist" aria-label="Data panels">
      {tabs.map((t) => (
        <button
          key={t.value}
          className={`tab ${value === t.value ? "active" : ""}`}
          onClick={() => onChange(t.value)}
          role="tab"
          aria-selected={value === t.value}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Shared filter bar
function FiltersBar({ filters, onChange, onReset, onRefresh }) {
  return (
    <div className="card panel">
      <div className="panel-header">
        <div className="panel-title">Filters</div>
        <div className="toolbar">
          <button className="btn" onClick={onReset}>Reset</button>
          <button className="btn primary" onClick={onRefresh}>Apply</button>
        </div>
      </div>
      <div className="filters">
        <input
          className="input"
          placeholder="Search..."
          value={filters.q || ""}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          aria-label="Search"
        />
        <select
          className="select"
          value={filters.status || ""}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          aria-label="Status filter"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="select"
          value={filters.range || ""}
          onChange={(e) => onChange({ ...filters, range: e.target.value })}
          aria-label="Date range"
        >
          <option value="">Any time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
    </div>
  );
}

// Table with inline actions
function DataTable({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="card panel">
      <div className="panel-header">
        <div className="panel-title">Data</div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.title}</th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="badge">No records</div>
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id || JSON.stringify(r)}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}</td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      {onEdit && (
                        <button className="btn" onClick={() => onEdit(r)} title="Edit">
                          {Icons.edit}
                        </button>
                      )}
                      {onDelete && (
                        <button className="btn" onClick={() => onDelete(r)} title="Delete" style={{ marginLeft: 6 }}>
                          {Icons.trash}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Chart placeholder component
function ChartsPanel({ data }) {
  return (
    <div className="card panel">
      <div className="panel-header">
        <div className="panel-title">Analytics</div>
        <span className="badge">Interactive</span>
      </div>
      <div className="chart">Charts render here (bar/line/pie via backend data)</div>
    </div>
  );
}

// Notifications panel
function NotificationsPanel({ items = [], onMarkRead }) {
  return (
    <div className="card panel">
      <div className="panel-header">
        <div className="panel-title">Notifications</div>
        <span className="badge">{Icons.bell} {items.filter(i => !i.read).length} new</span>
      </div>
      <div className="notifications">
        {items.length === 0 ? <div className="badge">No notifications</div> : null}
        {items.map((n) => (
          <div className="notice" key={n.id}>
            <div>
              <p>{n.message}</p>
              <div className="meta">{n.type} • {new Date(n.created_at || n.createdAt || Date.now()).toLocaleString()}</div>
            </div>
            {!n.read && (
              <button className="btn" onClick={() => onMarkRead(n.id)}>Mark read</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Upload Excel
function UploadExcel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleUpload() {
    if (!file) return;
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadFile(Endpoints.files.uploadExcel(), fd);
      onUploaded?.(res);
    } catch (e) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="upload">
      <input
        id="excel-file"
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
      />
      <label htmlFor="excel-file" className="btn">
        {Icons.upload} Choose Excel
      </label>
      <button className="btn primary" disabled={!file || busy} onClick={handleUpload}>
        {busy ? "Uploading..." : "Upload"}
      </button>
      {file && <span className="badge">{file.name}</span>}
      {err && <span className="badge" style={{ color: "var(--color-error)" }}>{err}</span>}
    </div>
  );
}

// Panel containers for each tab
function CandidatesPanel({ filters }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => ([
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "status", title: "Status" },
    { key: "source", title: "Source" },
  ]), []);

  async function load() {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      if (filters.range) params.set("range", filters.range);
      const data = await getJSON(Endpoints.candidates.list(params.toString()));
      setRows(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function onEdit(rec) {
    const newStatus = window.prompt("Update status", rec.status || "");
    if (newStatus == null) return;
    try {
      const payload = { ...rec, status: newStatus };
      await putJSON(Endpoints.candidates.update(rec.id), payload);
      load();
    } catch (e) {
      alert(e.message || "Update failed");
    }
  }

  async function onDelete(rec) {
    if (!window.confirm(`Delete ${rec.name}?`)) return;
    try {
      await deleteJSON(Endpoints.candidates.remove(rec.id));
      load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <>
      <ErrorBanner error={error} />
      {loading ? <Loading /> : null}
      <DataTable columns={columns} rows={rows} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}

function InterviewsPanel({ filters }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => ([
    { key: "candidate_name", title: "Candidate" },
    { key: "client_name", title: "Client" },
    { key: "stage", title: "Stage" },
    { key: "date", title: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "" },
  ]), []);

  async function load() {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      if (filters.range) params.set("range", filters.range);
      const data = await getJSON(Endpoints.interviews.list(params.toString()));
      setRows(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function onEdit(rec) {
    const stage = window.prompt("Update stage", rec.stage || "");
    if (stage == null) return;
    try {
      await putJSON(Endpoints.interviews.update(rec.id), { ...rec, stage });
      load();
    } catch (e) {
      alert(e.message || "Update failed");
    }
  }

  async function onDelete(rec) {
    if (!window.confirm(`Delete interview with ${rec.candidate_name}?`)) return;
    try {
      await deleteJSON(Endpoints.interviews.remove(rec.id));
      load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <>
      <ErrorBanner error={error} />
      {loading ? <Loading /> : null}
      <DataTable columns={columns} rows={rows} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}

function ClientsPanel({ filters }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => ([
    { key: "name", title: "Client" },
    { key: "open_roles", title: "Open Roles" },
    { key: "sla_days", title: "SLA (days)" },
  ]), []);

  async function load() {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      if (filters.range) params.set("range", filters.range);
      const data = await getJSON(Endpoints.clients.list(params.toString()));
      setRows(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function onEdit(rec) {
    const openRoles = window.prompt("Update open roles", rec.open_roles ?? 0);
    if (openRoles == null) return;
    try {
      await putJSON(Endpoints.clients.update(rec.id), { ...rec, open_roles: Number(openRoles) });
      load();
    } catch (e) {
      alert(e.message || "Update failed");
    }
  }

  async function onDelete(rec) {
    if (!window.confirm(`Delete client ${rec.name}?`)) return;
    try {
      await deleteJSON(Endpoints.clients.remove(rec.id));
      load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <>
      <ErrorBanner error={error} />
      {loading ? <Loading /> : null}
      <DataTable columns={columns} rows={rows} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}

// PUBLIC_INTERFACE
function Dashboard() {
  /** Root dashboard container implementing layout, KPIs, charts, filters and three tabs. */
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("candidates");
  const [filters, setFilters] = useState({ q: "", status: "", range: "" });
  const [kpis, setKpis] = useState({ candidates: 0, interviews: 0, clients: 0, rate: "0%" });
  const [chartData, setChartData] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [error, setError] = useState("");

  async function loadKpisAndCharts() {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.set("range", filters.range);
      const res = await getJSON(Endpoints.metrics.kpis(params.toString()));
      setKpis({
        candidates: res?.candidates ?? 0,
        interviews: res?.interviews ?? 0,
        clients: res?.clients ?? 0,
        rate: res?.conversion_rate ?? "0%",
      });
    } catch (e) {
      setError(e.message || "Failed to load KPIs");
    }
    try {
      const params = new URLSearchParams();
      if (filters.range) params.set("range", filters.range);
      const res = await getJSON(Endpoints.metrics.charts(params.toString()));
      setChartData(res || {});
    } catch (e) {
      // non-fatal
    }
  }

  async function loadNotifications() {
    try {
      const res = await getJSON(Endpoints.notifications.list());
      setNotifs(Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []);
    } catch (e) {
      // non-fatal
    }
  }

  useEffect(() => {
    loadKpisAndCharts();
    loadNotifications();
    // eslint-disable-next-line
  }, []);

  function resetFilters() {
    setFilters({ q: "", status: "", range: "" });
  }

  async function refreshFilters() {
    await loadKpisAndCharts();
  }

  async function markRead(id) {
    try {
      await postJSON(Endpoints.notifications.markRead(id), {});
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="App">
      <div className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark" />
            <div>
              <div className="brand-title">Recruitment Dashboard</div>
              <div className="meta" style={{ color: "var(--muted)", fontSize: 12 }}>
                Ocean Professional • {API_BASE_URL}
              </div>
            </div>
          </div>
          <div className="toolbar">
            <UploadExcel onUploaded={() => { loadKpisAndCharts(); }} />
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <ErrorBanner error={error} />

        <div className="kpi-grid">
          <KpiCard icon={Icons.candidate} title="Candidates" value={kpis.candidates} diff="+12%" />
          <KpiCard icon={Icons.interview} title="Interviews" value={kpis.interviews} diff="+4%" />
          <KpiCard icon={Icons.client} title="Clients" value={kpis.clients} diff="+1%" />
          <KpiCard icon={Icons.rate} title="Conversion Rate" value={kpis.rate} diff="+0.8%" />
        </div>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { value: "candidates", label: "Candidates" },
            { value: "interviews", label: "Interviews" },
            { value: "clients", label: "Clients" },
          ]}
        />

        <div className="panels">
          <div className="left">
            <FiltersBar
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
              onRefresh={refreshFilters}
            />
            {activeTab === "candidates" && <CandidatesPanel filters={filters} />}
            {activeTab === "interviews" && <InterviewsPanel filters={filters} />}
            {activeTab === "clients" && <ClientsPanel filters={filters} />}

            <ChartsPanel data={chartData} />
          </div>
          <div className="right">
            <NotificationsPanel items={notifs} onMarkRead={markRead} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * App entry renders the Dashboard shell
 */
export default function App() {
  return <Dashboard />;
}
