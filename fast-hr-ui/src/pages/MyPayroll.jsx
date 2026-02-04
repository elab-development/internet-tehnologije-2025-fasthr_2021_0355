import { useEffect, useMemo, useState } from "react";
import { Alert, Container, Form, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

import DataTable from "../components/DataTable";
import DetailsModal from "../components/DetailsModal";
import StatsRow from "../components/StatsRow";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

function getToken() {
  return sessionStorage.getItem("fast_hr_token");
}

function getUser() {
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

export default function MyPayroll() {
  const token = useMemo(() => getToken(), []);
  const user = useMemo(() => getUser(), []);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState({
    year: String(currentYear),
    status: "",
  });

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState(null);

  function headers() {
    return { Authorization: `Bearer ${token}` };
  }

  function onFilterChange(e) {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  }

  async function loadList() {
    setErrorMsg("");
    setLoading(true);

    try {
      const params = {
        employee_id: user?.id,
      };

      if (filters.year) params.period_year = Number(filters.year);
      if (filters.status) params.status = filters.status;

      const res = await API.get("/payroll-records", { params, headers: headers() });
      setItems(res.data?.data?.items || []);
    } catch {
      setItems([]);
      setErrorMsg("Could not load payroll records.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const year = filters.year ? Number(filters.year) : currentYear;
      const res = await API.get("/payroll-records/stats", {
        params: { year },
        headers: headers(),
      });
      setStats(res.data?.data || null);
    } catch {
      setStats(null);
    }
  }

  async function openDetails(row) {
    setSelectedId(row.id);
    setShowModal(true);
    setDetails(null);
    setDetailsLoading(true);

    try {
      const res = await API.get(`/payroll-records/${row.id}`, { headers: headers() });
      setDetails(res.data?.data?.payroll_record || null);
    } catch {
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  useEffect(() => {
    loadList();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadList();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year, filters.status]);

  const columns = [
    { key: "id", label: "ID" },
    { key: "period", label: "Period", render: (p) => periodLabel(p.period_year, p.period_month) },
    { key: "status", label: "Status" },
    { key: "base_salary", label: "Base", render: (p) => money(p.base_salary) },
    { key: "bonus_amount", label: "Bonus", render: (p) => money(p.bonus_amount) },
    { key: "overtime_amount", label: "Overtime", render: (p) => money(p.overtime_amount) },
    { key: "benefits_amount", label: "Benefits", render: (p) => money(p.benefits_amount) },
    { key: "deductions_amount", label: "Deductions", render: (p) => money(p.deductions_amount) },
    { key: "net_amount", label: "Net", render: (p) => <b>{money(p.net_amount)}</b> },
  ];

  return (
    <Container className="app-container page-wrap">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">My Payroll</h2>
        <p className="hr-page-subtitle">List, stats, and details.</p>

        {/* Stats (GET /payroll-records/stats?year=YYYY) */}
        {stats && (
          <StatsRow
            items={[
              { label: "Records count", value: stats.records_count },
              { label: "Sum base salary", value: money(stats.sum_base_salary) },
              { label: "Sum net amount", value: money(stats.sum_net_amount) },
            ]}
          />
        )}

        {/* Filters (GET /payroll-records?employee_id&period_year&status) */}
        <Row className="g-2 mt-18">
          <Col md={3}>
            <Form.Control
              name="year"
              value={filters.year}
              onChange={onFilterChange}
              placeholder="Year, e.g. 2026"
            />
          </Col>

          <Col md={3}>
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

        {errorMsg && (
          <Alert variant="light" className="hr-alert mt-18">
            {errorMsg}
          </Alert>
        )}

        {!loading && !errorMsg && items.length === 0 && (
          <Alert variant="light" className="hr-alert mt-18">
            No payroll records found.
          </Alert>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-18">
            <div className="hint">Tip: click a row to open details.</div>
            <DataTable columns={columns} rows={items} onRowClick={openDetails} />
          </div>
        )}
      </div>

      {/* Details (GET /payroll-records/{id}) */}
      <DetailsModal
        show={showModal}
        title={selectedId ? `Payroll record #${selectedId}.` : "Payroll details."}
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

            <div><b>Employee.</b> {details.employee?.name || "—"}.</div>
            <div><b>HR worker.</b> {details.hrWorker?.name || "—"}.</div>
          </div>
        )}
      </DetailsModal>
    </Container>
  );
}
