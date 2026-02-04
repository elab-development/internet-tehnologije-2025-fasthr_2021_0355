import { useEffect, useMemo, useState } from "react";
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

function shortDate(d) {
  if (!d) return "";
  return String(d).slice(0, 10);
}

function safeNum(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export default function PerformanceReviews() {
  const loggedUser = getLoggedInUser();
  const hrWorkerId = loggedUser?.id || null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  // Dropdown data
  const [employees, setEmployees] = useState([]);
  const [payrollOptions, setPayrollOptions] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    employee_id: "",
    hasSalaryImpact: "",
  });

  // Details
  const [showModal, setShowModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState(null);

  // Create/Update
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    employee_id: "",
    payroll_record_id: "",
    period_start: "",
    period_end: "",
    overall_score: "",
    comments: "",
    goals: "",
    hasSalaryImpact: false,
  });

  const selectedEmployeeId = useMemo(() => safeNum(form.employee_id), [form.employee_id]);

  function onFilterChange(e) {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  }

  function onFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      employee_id: "",
      payroll_record_id: "",
      period_start: "",
      period_end: "",
      overall_score: "",
      comments: "",
      goals: "",
      hasSalaryImpact: false,
    });
  }

  async function loadEmployees() {
    try {
      // If your backend supports role filter, it's fine. We also filter on frontend.
      const res = await API.get("/users", { headers: authHeaders() });

      const all = res.data?.data?.items || res.data?.data?.users || res.data?.data || [];
      const onlyEmployees = Array.isArray(all) ? all.filter((u) => u?.role === "employee") : [];
      setEmployees(onlyEmployees);
    } catch {
      setEmployees([]);
    }
  }

  async function loadPayrollOptionsForEmployee(employeeId) {
    if (!employeeId) {
      setPayrollOptions([]);
      return;
    }

    try {
      const res = await API.get("/payroll-records", {
        params: { employee_id: employeeId },
        headers: authHeaders(),
      });

      setPayrollOptions(res.data?.data?.items || []);
    } catch {
      setPayrollOptions([]);
    }
  }

  async function loadStats() {
    try {
      const res = await API.get("/performance-reviews/stats", { headers: authHeaders() });
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
      if (filters.hasSalaryImpact !== "") params.hasSalaryImpact = filters.hasSalaryImpact === "true";

      const res = await API.get("/performance-reviews", { params, headers: authHeaders() });
      setItems(res.data?.data?.items || []);
    } catch {
      setItems([]);
      setErrorMsg("Could not load performance reviews.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(row) {
    setShowModal(true);
    setDetails(null);
    setDetailsLoading(true);

    try {
      const res = await API.get(`/performance-reviews/${row.id}`, { headers: authHeaders() });
      setDetails(res.data?.data?.performance_review || null);
    } catch {
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function startEdit(row) {
    const empId = row.employee_id || row.employee?.id || "";
    const prId = row.payroll_record_id || row.payrollRecord?.id || "";

    setEditingId(row.id);
    setForm({
      employee_id: empId ? String(empId) : "",
      payroll_record_id: prId ? String(prId) : "",
      period_start: shortDate(row.period_start),
      period_end: shortDate(row.period_end),
      overall_score: row.overall_score ?? "",
      comments: row.comments ?? "",
      goals: row.goals ?? "",
      hasSalaryImpact: !!row.hasSalaryImpact,
    });

    const empNum = safeNum(empId);
    if (empNum) await loadPayrollOptionsForEmployee(empNum);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveReview() {
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
        payroll_record_id: form.payroll_record_id ? Number(form.payroll_record_id) : null,

        // REQUIRED (from session)
        hr_worker_id: Number(hrWorkerId),

        period_start: form.period_start || null,
        period_end: form.period_end || null,
        overall_score: form.overall_score !== "" ? Number(form.overall_score) : null,
        comments: form.comments || null,
        goals: form.goals || null,
        hasSalaryImpact: !!form.hasSalaryImpact,
      };

      if (!payload.employee_id || Number.isNaN(payload.employee_id)) {
        setErrorMsg("Employee is required.");
        setSaving(false);
        return;
      }

      if (editingId) {
        await API.put(`/performance-reviews/${editingId}`, payload, { headers: authHeaders() });
      } else {
        await API.post("/performance-reviews", payload, { headers: authHeaders() });
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

  async function deleteReview(id) {
    if (!window.confirm("Delete this performance review?")) return;

    setErrorMsg("");
    try {
      await API.delete(`/performance-reviews/${id}`, { headers: authHeaders() });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employee_id, filters.hasSalaryImpact]);

  useEffect(() => {
    loadPayrollOptionsForEmployee(selectedEmployeeId);
    setForm((p) => ({ ...p, payroll_record_id: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId]);

  const payrollLabel = (pr) => {
    const y = pr?.period_year;
    const m = pr?.period_month;
    const label = y && m ? `${y}-${String(m).padStart(2, "0")}` : "Unknown period";
    const net = pr?.net_amount != null ? ` | net ${Number(pr.net_amount).toFixed(2)}` : "";
    return `#${pr.id} | ${label}${net}`;
  };

  // Inline styles to guarantee visible action buttons on white table rows
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
    {
      key: "employee",
      label: "Employee",
      render: (r) => r.employee?.name || r.employee_id || "—",
    },
    {
      key: "period",
      label: "Period",
      render: (r) => `${shortDate(r.period_start) || "—"} → ${shortDate(r.period_end) || "—"}`,
    },
    { key: "overall_score", label: "Score" },
    {
      key: "hasSalaryImpact",
      label: "Salary impact",
      render: (r) => (r.hasSalaryImpact ? "yes" : "no"),
    },
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
              deleteReview(r.id);
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
        <h2 className="hr-page-title">Performance Reviews</h2>
        <p className="hr-page-subtitle">HR worker: CRUD + stats + details.</p>

        <div style={{ marginTop: 10, opacity: 0.92, fontWeight: 800 }}>
          Logged HR worker:{" "}
          {loggedUser?.name ? `${loggedUser.name} (#${loggedUser.id}).` : `#${loggedUser?.id || "—"}.`}
        </div>

        {stats && (
          <StatsRow
            items={[
              { label: "Total reviews", value: stats.total_reviews },
              { label: "Average score", value: stats.average_overall_score },
              { label: "With salary impact", value: stats.reviews_with_salary_impact },
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
              {editingId ? `Edit review #${editingId}.` : "Create new review."}
            </div>

            {editingId && (
              <Button className="hr-btn-ghost" onClick={resetForm}>
                <FaTimes className="me-2" />
                Cancel.
              </Button>
            )}
          </div>

          <Row className="g-3 mt-1">
            <Col md={3}>
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

            <Col md={3}>
              <Form.Label>Payroll record (optional).</Form.Label>
              <Form.Select
                name="payroll_record_id"
                value={form.payroll_record_id}
                onChange={onFormChange}
                disabled={!form.employee_id}
              >
                <option value="">
                  {form.employee_id ? "Choose payroll..." : "Choose employee first..."}
                </option>
                {payrollOptions.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {payrollLabel(pr)}
                  </option>
                ))}
              </Form.Select>
              <div className="hint">Pick by payroll period date.</div>
            </Col>

            <Col md={3}>
              <Form.Label>Period start.</Form.Label>
              <Form.Control type="date" name="period_start" value={form.period_start} onChange={onFormChange} />
            </Col>

            <Col md={3}>
              <Form.Label>Period end.</Form.Label>
              <Form.Control type="date" name="period_end" value={form.period_end} onChange={onFormChange} />
            </Col>

            <Col md={3}>
              <Form.Label>Score.</Form.Label>
              <Form.Control
                name="overall_score"
                value={form.overall_score}
                onChange={onFormChange}
                placeholder="0-5"
              />
            </Col>

            <Col md={9}>
              <Form.Label>Comments.</Form.Label>
              <Form.Control as="textarea" rows={2} name="comments" value={form.comments} onChange={onFormChange} />
            </Col>

            <Col md={9}>
              <Form.Label>Goals.</Form.Label>
              <Form.Control as="textarea" rows={2} name="goals" value={form.goals} onChange={onFormChange} />
            </Col>

            <Col md={3}>
              <Form.Label>Salary impact.</Form.Label>
              <Form.Check
                type="checkbox"
                name="hasSalaryImpact"
                checked={form.hasSalaryImpact}
                onChange={onFormChange}
                label="Has salary impact."
              />
              <div className="hint">HR worker ID is taken from session storage.</div>
            </Col>
          </Row>

          <div className="mt-18">
            <Button className="hr-btn-primary" onClick={saveReview} disabled={saving}>
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
          <Col md={3}>
            <Form.Select name="employee_id" value={filters.employee_id} onChange={onFilterChange}>
              <option value="">All employees</option>
              {employees.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (#{u.id})
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Select name="hasSalaryImpact" value={filters.hasSalaryImpact} onChange={onFilterChange}>
              <option value="">All</option>
              <option value="true">Salary impact only</option>
              <option value="false">No salary impact only</option>
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
            No reviews found.
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
        title={details?.id ? `Review #${details.id}.` : "Review details."}
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
            <div>
              <b>Period.</b> {shortDate(details.period_start) || "—"} → {shortDate(details.period_end) || "—"}.
            </div>
            <div>
              <b>Score.</b> {details.overall_score ?? "N/A"}.
            </div>
            <div>
              <b>Salary impact.</b> {details.hasSalaryImpact ? "yes" : "no"}.
            </div>
            <div>
              <b>Employee.</b> {details.employee?.name || details.employee_id || "—"}.
            </div>
            <div>
              <b>HR worker.</b> {details.hrWorker?.name || details.hr_worker_id || "—"}.
            </div>
            <div>
              <b>Payroll record.</b>{" "}
              {details.payrollRecord
                ? `#${details.payrollRecord.id} | ${details.payrollRecord.period_year}-${String(
                    details.payrollRecord.period_month
                  ).padStart(2, "0")}`
                : details.payroll_record_id || "—"}
              .
            </div>

            {details.comments && (
              <div className="details-block">
                <div className="details-title">Comments.</div>
                <div className="details-text">{details.comments}</div>
              </div>
            )}

            {details.goals && (
              <div className="details-block">
                <div className="details-title">Goals.</div>
                <div className="details-text">{details.goals}</div>
              </div>
            )}
          </div>
        )}
      </DetailsModal>
    </Container>
  );
}
