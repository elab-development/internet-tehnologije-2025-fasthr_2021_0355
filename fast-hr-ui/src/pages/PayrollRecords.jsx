import { useEffect, useState } from "react";
import { Alert, Button, Container, Form, Row, Col, Spinner } from "react-bootstrap";
import { FaPlus, FaSave, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";

import DataTable from "../components/DataTable";
import DetailsModal from "../components/DetailsModal";
import StatsRow from "../components/StatsRow";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

function authHeaders() {
  const token = sessionStorage.getItem("fast_hr_token");
  return { Authorization: `Bearer ${token}` };
}

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("fast_hr_user") || "null");
  } catch {
    return null;
  }
}

function money(v) {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toFixed(2);
}

function periodLabel(y, m) {
  if (!y || !m) return "N/A";
  return `${y}-${String(m).padStart(2, "0")}`;
}

export default function PayrollRecords() {
  const loggedUser = getLoggedInUser();
  const hrWorkerId = loggedUser?.id || null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  // Dropdown: employees (instead of typing employee_id)
  const [employees, setEmployees] = useState([]);

  // Filters (GET /payroll-records)
  const [filters, setFilters] = useState({
    employee_id: "",
    period_year: String(new Date().getFullYear()),
    status: "",
  });

  // Details (GET /payroll-records/{id})
  const [showModal, setShowModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState(null);

  // Create/Update (POST/PUT)
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    employee_id: "",
    period_year: String(new Date().getFullYear()),
    period_month: "",
    base_salary: "",
    bonus_amount: "",
    overtime_amount: "",
    benefits_amount: "",
    deductions_amount: "",
    net_amount: "",
    status: "draft",
  });

  function onFilterChange(e) {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      employee_id: "",
      period_year: String(new Date().getFullYear()),
      period_month: "",
      base_salary: "",
      bonus_amount: "",
      overtime_amount: "",
      benefits_amount: "",
      deductions_amount: "",
      net_amount: "",
      status: "draft",
    });
  }

  async function loadEmployees() {
    try {
      const res = await API.get("/users", { headers: authHeaders() });
      const all = res.data?.data?.items || res.data?.data?.users || res.data?.data || [];
      const onlyEmployees = Array.isArray(all) ? all.filter((u) => u?.role === "employee") : [];
      setEmployees(onlyEmployees);
    } catch {
      setEmployees([]);
    }
  }

  async function loadStats() {
    try {
      const year = filters.period_year ? Number(filters.period_year) : new Date().getFullYear();

      // GET /payroll-records/stats?year=YYYY
      const res = await API.get("/payroll-records/stats", {
        params: { year },
        headers: authHeaders(),
      });

      setStats(res.data?.data || null);
    } catch {
      setStats(null);
    }
  }

  async function loadList() {
    setErrorMsg("");
    setLoading(true);

    try {
      const params = {};
      if (filters.employee_id) params.employee_id = Number(filters.employee_id);
      if (filters.period_year) params.period_year = Number(filters.period_year);
      if (filters.status) params.status = filters.status;

      // GET /payroll-records
      const res = await API.get("/payroll-records", { params, headers: authHeaders() });
      setItems(res.data?.data?.items || []);
    } catch {
      setItems([]);
      setErrorMsg("Could not load payroll records.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(row) {
    setShowModal(true);
    setDetails(null);
    setDetailsLoading(true);

    try {
      // GET /payroll-records/{id}
      const res = await API.get(`/payroll-records/${row.id}`, { headers: authHeaders() });
      setDetails(res.data?.data?.payroll_record || null);
    } catch {
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      employee_id: row.employee_id || row.employee?.id ? String(row.employee_id || row.employee?.id) : "",
      period_year: String(row.period_year || ""),
      period_month: String(row.period_month || ""),
      base_salary: row.base_salary ?? "",
      bonus_amount: row.bonus_amount ?? "",
      overtime_amount: row.overtime_amount ?? "",
      benefits_amount: row.benefits_amount ?? "",
      deductions_amount: row.deductions_amount ?? "",
      net_amount: row.net_amount ?? "",
      status: row.status || "draft",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveRecord() {
    setErrorMsg("");
    setSaving(true);

    try {
      if (!hrWorkerId) {
        setErrorMsg("Missing HR worker session. Please login again.");
        setSaving(false);
        return;
      }

      const payload = {
        employee_id: Number(form.employee_id),
        hr_worker_id: Number(hrWorkerId), // required - from session

        period_year: Number(form.period_year),
        period_month: Number(form.period_month),

        base_salary: Number(form.base_salary || 0),
        bonus_amount: Number(form.bonus_amount || 0),
        overtime_amount: Number(form.overtime_amount || 0),
        benefits_amount: Number(form.benefits_amount || 0),
        deductions_amount: Number(form.deductions_amount || 0),
        net_amount: Number(form.net_amount || 0),
        status: form.status,
      };

      if (!payload.employee_id || Number.isNaN(payload.employee_id)) {
        setErrorMsg("Employee is required.");
        setSaving(false);
        return;
      }

      if (!payload.period_year || Number.isNaN(payload.period_year)) {
        setErrorMsg("Year is required.");
        setSaving(false);
        return;
      }

      if (!payload.period_month || Number.isNaN(payload.period_month)) {
        setErrorMsg("Month is required.");
        setSaving(false);
        return;
      }

      if (editingId) {
        // PUT /payroll-records/{id}
        await API.put(`/payroll-records/${editingId}`, payload, { headers: authHeaders() });
      } else {
        // POST /payroll-records
        await API.post("/payroll-records", payload, { headers: authHeaders() });
      }

      resetForm();
      await loadList();
      await loadStats();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm("Delete this payroll record?")) return;

    setErrorMsg("");
    try {
      // DELETE /payroll-records/{id}
      await API.delete(`/payroll-records/${id}`, { headers: authHeaders() });
      await loadList();
      await loadStats();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Delete failed.");
    }
  }

  useEffect(() => {
    loadEmployees();
    loadList();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadList();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employee_id, filters.period_year, filters.status]);

  // Inline styles so action buttons are always visible on white table rows
  const actionWrapStyle = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    minWidth: 220,
  };

  const editBtnStyle = {
    background: "rgba(255, 74, 33, 0.95)",
    border: "2px solid rgba(255,255,255,0.35)",
    color: "#fff",
    fontWeight: 900,
    borderRadius: 14,
    padding: "6px 12px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    whiteSpace: "nowrap",
  };

  const deleteBtnStyle = {
    background: "rgba(255, 59, 31, 0.95)",
    border: "2px solid rgba(255,255,255,0.35)",
    color: "#fff",
    fontWeight: 900,
    borderRadius: 14,
    padding: "6px 12px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    whiteSpace: "nowrap",
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "employee", label: "Employee", render: (r) => r.employee?.name || r.employee_id || "—" },
    { key: "period", label: "Period", render: (r) => periodLabel(r.period_year, r.period_month) },
    { key: "status", label: "Status" },
    { key: "base_salary", label: "Base", render: (r) => money(r.base_salary) },
    { key: "net_amount", label: "Net", render: (r) => <b>{money(r.net_amount)}</b> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div style={actionWrapStyle}>
          <Button
            size="sm"
            style={editBtnStyle}
            onClick={(e) => {
              e.stopPropagation();
              startEdit(r);
            }}
          >
            Edit.
          </Button>

          <Button
            size="sm"
            style={deleteBtnStyle}
            onClick={(e) => {
              e.stopPropagation();
              deleteRecord(r.id);
            }}
          >
            <FaTrash style={{ marginRight: 6 }} />
            Delete.
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container className="app-container page-wrap">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">Payroll Records</h2>
        <p className="hr-page-subtitle">HR worker: CRUD + stats + details.</p>

        <div style={{ marginTop: 10, opacity: 0.92, fontWeight: 800 }}>
          Logged HR worker: {loggedUser?.name ? `${loggedUser.name} (#${loggedUser.id}).` : `#${loggedUser?.id || "—"}.`}
        </div>

        {stats && (
          <StatsRow
            items={[
              { label: "Records count", value: stats.records_count },
              { label: "Sum base salary", value: money(stats.sum_base_salary) },
              { label: "Sum net amount", value: money(stats.sum_net_amount) },
            ]}
          />
        )}

        {errorMsg && (
          <Alert variant="light" className="hr-alert mt-18">
            {errorMsg}
          </Alert>
        )}

        {/* Create / Edit */}
        <div className="hr-card hr-card--padded mt-18">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {editingId ? `Edit payroll #${editingId}.` : "Create new payroll record."}
            </div>

            {editingId && (
              <Button className="hr-btn-ghost" onClick={resetForm}>
                <FaTimes className="me-2" />
                Cancel.
              </Button>
            )}
          </div>

          <Row className="g-3 mt-1">
            <Col md={4}>
              <Form.Label>Employee.</Form.Label>
              <Form.Select name="employee_id" value={form.employee_id} onChange={onFormChange}>
                <option value="">Choose employee...</option>
                {employees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (#{u.id})
                  </option>
                ))}
              </Form.Select>
              <div className="hint">Pick by name (ID shown too).</div>
            </Col>

            <Col md={4}>
              <Form.Label>Year.</Form.Label>
              <Form.Control name="period_year" value={form.period_year} onChange={onFormChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Month.</Form.Label>
              <Form.Control name="period_month" value={form.period_month} onChange={onFormChange} placeholder="1-12" />
            </Col>

            <Col md={4}>
              <Form.Label>Status.</Form.Label>
              <Form.Select name="status" value={form.status} onChange={onFormChange}>
                <option value="draft">draft</option>
                <option value="approved">approved</option>
                <option value="paid">paid</option>
              </Form.Select>
              <div className="hint">HR worker ID is taken from session storage.</div>
            </Col>

            <Col md={4}>
              <Form.Label>Base.</Form.Label>
              <Form.Control name="base_salary" value={form.base_salary} onChange={onFormChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Net.</Form.Label>
              <Form.Control name="net_amount" value={form.net_amount} onChange={onFormChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Bonus.</Form.Label>
              <Form.Control name="bonus_amount" value={form.bonus_amount} onChange={onFormChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Overtime.</Form.Label>
              <Form.Control name="overtime_amount" value={form.overtime_amount} onChange={onFormChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Benefits.</Form.Label>
              <Form.Control name="benefits_amount" value={form.benefits_amount} onChange={onFormChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Deductions.</Form.Label>
              <Form.Control name="deductions_amount" value={form.deductions_amount} onChange={onFormChange} />
            </Col>
          </Row>

          <div className="mt-18">
            <Button className="hr-btn-primary" onClick={saveRecord} disabled={saving}>
              {saving ? (
                <span className="btn-loading">
                  <Spinner size="sm" /> Saving...
                </span>
              ) : (
                <>
                  {editingId ? <FaSave className="me-2" /> : <FaPlus className="me-2" />}
                  {editingId ? "Update." : "Create."}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Row className="g-2 mt-18">
          <Col md={4}>
            <Form.Select name="employee_id" value={filters.employee_id} onChange={onFilterChange}>
              <option value="">All employees</option>
              {employees.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (#{u.id})
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Control name="period_year" value={filters.period_year} onChange={onFilterChange} placeholder="Filter by year" />
          </Col>

          <Col md={4}>
            <Form.Select name="status" value={filters.status} onChange={onFilterChange}>
              <option value="">All statuses</option>
              <option value="draft">draft</option>
              <option value="approved">approved</option>
              <option value="paid">paid</option>
            </Form.Select>
          </Col>
        </Row>

        {loading && (
          <div className="mt-18">
            <Spinner size="sm" /> Loading...
          </div>
        )}

        {!loading && items.length === 0 && (
          <Alert variant="light" className="hr-alert mt-18">
            No payroll records found.
          </Alert>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-18">
            <div className="hint">Click a row to open details.</div>
            <DataTable columns={columns} rows={items} onRowClick={openDetails} />
          </div>
        )}
      </div>

      {/* Details */}
      <DetailsModal
        show={showModal}
        title={details?.id ? `Payroll #${details.id}.` : "Payroll details."}
        onClose={() => setShowModal(false)}
      >
        {detailsLoading && (
          <div>
            <Spinner size="sm" /> Loading details...
          </div>
        )}

        {!detailsLoading && !details && (
          <Alert variant="light" className="hr-alert">
            Could not load details.
          </Alert>
        )}

        {!detailsLoading && details && (
          <div className="details-grid">
            <div><b>Period.</b> {periodLabel(details.period_year, details.period_month)}.</div>
            <div><b>Status.</b> {details.status}.</div>
            <div><b>Base salary.</b> {money(details.base_salary)}.</div>
            <div><b>Bonus.</b> {money(details.bonus_amount)}.</div>
            <div><b>Overtime.</b> {money(details.overtime_amount)}.</div>
            <div><b>Benefits.</b> {money(details.benefits_amount)}.</div>
            <div><b>Deductions.</b> {money(details.deductions_amount)}.</div>
            <div><b>Net.</b> <b>{money(details.net_amount)}</b>.</div>
            <div><b>Employee.</b> {details.employee?.name || details.employee_id || "—"}.</div>
            <div><b>HR worker.</b> {details.hrWorker?.name || details.hr_worker_id || "—"}.</div>
          </div>
        )}
      </DetailsModal>
    </Container>
  );
}
