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

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

export default function HrDepartments() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  // Details modal.
  const [showModal, setShowModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState(null);

  // Create/Edit.
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", description: "" });
  }

  async function loadList() {
    setErrorMsg("");
    setLoading(true);
    try {
      // GET /departments (protected).
      const res = await API.get("/departments", { headers: authHeaders() });
      setItems(asArray(res.data?.data?.items));
    } catch {
      setItems([]);
      setErrorMsg("Could not load departments.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      // GET /stats/departments (protected).
      const res = await API.get("/stats/departments", { headers: authHeaders() });
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
      // GET /departments/{id} (protected).
      const res = await API.get(`/departments/${row.id}`, { headers: authHeaders() });
      setDetails(res.data?.data?.department || null);
    } catch {
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      description: row.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveDepartment() {
    setErrorMsg("");
    setSaving(true);

    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
      };

      if (!payload.name) {
        setErrorMsg("Name is required.");
        setSaving(false);
        return;
      }

      if (editingId) {
        // PUT /departments/{id} (protected).
        await API.put(`/departments/${editingId}`, payload, { headers: authHeaders() });
      } else {
        // POST /departments (protected).
        await API.post("/departments", payload, { headers: authHeaders() });
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

  async function deleteDepartment(id) {
    if (!window.confirm("Delete this department?")) return;

    setErrorMsg("");
    try {
      // DELETE /departments/{id} (protected).
      await API.delete(`/departments/${id}`, { headers: authHeaders() });
      await loadList();
      await loadStats();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Delete failed.");
    }
  }

  useEffect(() => {
    loadList();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    {
      key: "description",
      label: "Description",
      render: (r) => (r.description ? r.description : "—"),
    },
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
              deleteDepartment(r.id);
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
        <h2 className="hr-page-title">Departments</h2>
        <p className="hr-page-subtitle">HR worker: CRUD + stats + details.</p>

        {stats && (
          <StatsRow
            items={[
              { label: "Total departments", value: stats.total_departments },
              { label: "Loaded rows", value: items.length },
              { label: "Status", value: loading ? "Loading..." : "Ready" },
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
              {editingId ? `Edit department #${editingId}.` : "Create new department."}
            </div>

            {editingId && (
              <Button className="hr-btn-ghost" onClick={resetForm}>
                <FaTimes className="me-2" />
                Cancel.
              </Button>
            )}
          </div>

          <Row className="g-3 mt-1">
            <Col md={6}>
              <Form.Label>Name.</Form.Label>
              <Form.Control name="name" value={form.name} onChange={onFormChange} placeholder="e.g. Human Resources" />
            </Col>

            <Col md={6}>
              <Form.Label>Description.</Form.Label>
              <Form.Control
                name="description"
                value={form.description}
                onChange={onFormChange}
                placeholder="Optional short description"
              />
            </Col>
          </Row>

          <div className="mt-18">
            <Button className="hr-btn-primary" onClick={saveDepartment} disabled={saving}>
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

        {/* List */}
        {loading && (
          <div className="mt-18">
            <Spinner size="sm" /> Loading...
          </div>
        )}

        {!loading && items.length === 0 && (
          <Alert variant="light" className="hr-alert mt-18">
            No departments found.
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
        title={details?.id ? `Department #${details.id}.` : "Department details."}
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
              <b>Name.</b> {details.name}.
            </div>
            <div>
              <b>Description.</b> {details.description || "—"}.
            </div>
          </div>
        )}
      </DetailsModal>
    </Container>
  );
}
