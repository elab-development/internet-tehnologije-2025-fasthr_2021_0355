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

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function toNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function parseBenefits(text) {
  const raw = (text || "").trim();
  if (!raw) return null;

  const arr = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return arr.length ? arr : null;
}

export default function HrPositions() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Filter.
  const [filters, setFilters] = useState({ department_id: "" });

  // Details modal.
  const [showModal, setShowModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState(null);

  // Create/Edit.
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    department_id: "",
    name: "",
    seniority_level: "",
    min_salary: "",
    max_salary: "",
    default_benefits_text: "",
  });

  const deptNameById = useMemo(() => {
    const m = new Map();
    departments.forEach((d) => m.set(d.id, d.name));
    return m;
  }, [departments]);

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
      department_id: "",
      name: "",
      seniority_level: "",
      min_salary: "",
      max_salary: "",
      default_benefits_text: "",
    });
  }

  async function loadDepartments() {
    try {
      // GET /departments (protected) - used for labels + dropdown.
      const res = await API.get("/departments", { headers: authHeaders() });
      setDepartments(asArray(res.data?.data?.items));
    } catch {
      setDepartments([]);
    }
  }

  async function loadList() {
    setErrorMsg("");
    setLoading(true);

    try {
      const params = {};
      if (filters.department_id) params.department_id = Number(filters.department_id);

      // GET /positions (public route, but token is fine).
      const res = await API.get("/positions", { params, headers: authHeaders() });
      setItems(asArray(res.data?.data?.items));
    } catch {
      setItems([]);
      setErrorMsg("Could not load positions.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      // GET /stats/positions (protected).
      const res = await API.get("/stats/positions", { headers: authHeaders() });
      setStats(res.data?.data || null);
    } catch {
      setStats(null);
    }
  }

  async function openDetails(row) {
    setShowModal(true);
    setDetails(null);
    setDetailsLoading(true);

    try {
      // GET /positions/{id} (public).
      const res = await API.get(`/positions/${row.id}`, { headers: authHeaders() });
      setDetails(res.data?.data?.position || null);
    } catch {
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  function startEdit(row) {
    setEditingId(row.id);

    const benefits = Array.isArray(row.default_benefits) ? row.default_benefits.join(", ") : "";

    setForm({
      department_id: String(row.department_id || row.department?.id || ""),
      name: row.name || "",
      seniority_level: row.seniority_level || "",
      min_salary: row.min_salary ?? "",
      max_salary: row.max_salary ?? "",
      default_benefits_text: benefits,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePosition() {
    setErrorMsg("");
    setSaving(true);

    try {
      const payload = {
        department_id: toNumber(form.department_id),
        name: form.name?.trim(),
        seniority_level: form.seniority_level?.trim(),
        min_salary: toNumber(form.min_salary),
        max_salary: toNumber(form.max_salary),
      };

      if (!payload.department_id) {
        setErrorMsg("Department is required.");
        setSaving(false);
        return;
      }

      if (!payload.name) {
        setErrorMsg("Name is required.");
        setSaving(false);
        return;
      }

      if (!payload.seniority_level) {
        setErrorMsg("Seniority level is required.");
        setSaving(false);
        return;
      }

      if (payload.min_salary === null) {
        setErrorMsg("Min salary is required.");
        setSaving(false);
        return;
      }

      if (payload.max_salary === null) {
        setErrorMsg("Max salary is required.");
        setSaving(false);
        return;
      }

      const benefits = parseBenefits(form.default_benefits_text);
      if (benefits) payload.default_benefits = benefits;

      if (editingId) {
        // PUT /positions/{id} (public).
        await API.put(`/positions/${editingId}`, payload, { headers: authHeaders() });
      } else {
        // POST /positions (public).
        await API.post("/positions", payload, { headers: authHeaders() });
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

  async function deletePosition(id) {
    if (!window.confirm("Delete this position?")) return;

    setErrorMsg("");
    try {
      // DELETE /positions/{id} (public).
      await API.delete(`/positions/${id}`, { headers: authHeaders() });
      await loadList();
      await loadStats();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Delete failed.");
    }
  }

  useEffect(() => {
    loadDepartments();
    loadList();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department_id]);

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "department",
      label: "Department",
      render: (r) => r.department?.name || deptNameById.get(r.department_id) || r.department_id || "—",
    },
    { key: "name", label: "Name" },
    { key: "seniority_level", label: "Level" },
    { key: "min_salary", label: "Min", render: (r) => Number(r.min_salary).toFixed(2) },
    { key: "max_salary", label: "Max", render: (r) => Number(r.max_salary).toFixed(2) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", minWidth: 220 }}>
          <Button
            size="sm"
            className="hr-btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              startEdit(r);
            }}
          >
            Edit.
          </Button>

          <Button
            size="sm"
            className="hr-btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              deletePosition(r.id);
            }}
          >
            <FaTrash className="me-2" />
            Delete.
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container className="app-container page-wrap">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">Positions</h2>
        <p className="hr-page-subtitle">HR worker: CRUD + stats + details.</p>

        {stats && (
          <StatsRow
            items={[
              { label: "Total positions", value: stats.total_positions },
              { label: "Loaded rows", value: items.length },
              { label: "Departments", value: departments.length },
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
              {editingId ? `Edit position #${editingId}.` : "Create new position."}
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
              <Form.Label>Department.</Form.Label>
              <Form.Select name="department_id" value={form.department_id} onChange={onFormChange}>
                <option value="">Choose department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (#{d.id})
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Name.</Form.Label>
              <Form.Control name="name" value={form.name} onChange={onFormChange} placeholder="e.g. Backend Developer" />
            </Col>

            <Col md={4}>
              <Form.Label>Seniority level.</Form.Label>
              <Form.Control
                name="seniority_level"
                value={form.seniority_level}
                onChange={onFormChange}
                placeholder="e.g. junior / mid / senior"
              />
            </Col>

            <Col md={4}>
              <Form.Label>Min salary.</Form.Label>
              <Form.Control name="min_salary" value={form.min_salary} onChange={onFormChange} placeholder="e.g. 900" />
            </Col>

            <Col md={4}>
              <Form.Label>Max salary.</Form.Label>
              <Form.Control name="max_salary" value={form.max_salary} onChange={onFormChange} placeholder="e.g. 1800" />
            </Col>

            <Col md={4}>
              <Form.Label>Default benefits (optional).</Form.Label>
              <Form.Control
                name="default_benefits_text"
                value={form.default_benefits_text}
                onChange={onFormChange}
                placeholder="Comma separated. e.g. Health insurance, Gym"
              />
            </Col>
          </Row>

          <div className="mt-18">
            <Button className="hr-btn-primary" onClick={savePosition} disabled={saving}>
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
          <Col md={6}>
            <Form.Select name="department_id" value={filters.department_id} onChange={onFilterChange}>
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (#{d.id})
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Button className="hr-btn-ghost" onClick={() => { loadDepartments(); loadList(); loadStats(); }}>
              Refresh.
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="mt-18">
            <Spinner size="sm" /> Loading...
          </div>
        )}

        {!loading && items.length === 0 && (
          <Alert variant="light" className="hr-alert mt-18">
            No positions found.
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
        title={details?.id ? `Position #${details.id}.` : "Position details."}
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
              <b>ID.</b> {details.id}.
            </div>
            <div>
              <b>Department.</b> {details.department?.name || deptNameById.get(details.department_id) || details.department_id || "—"}.
            </div>
            <div>
              <b>Name.</b> {details.name}.
            </div>
            <div>
              <b>Level.</b> {details.seniority_level}.
            </div>
            <div>
              <b>Min salary.</b> {Number(details.min_salary).toFixed(2)}.
            </div>
            <div>
              <b>Max salary.</b> {Number(details.max_salary).toFixed(2)}.
            </div>
            <div>
              <b>Default benefits.</b>{" "}
              {Array.isArray(details.default_benefits) && details.default_benefits.length
                ? details.default_benefits.join(", ")
                : "—"}
              .
            </div>
          </div>
        )}
      </DetailsModal>
    </Container>
  );
}
