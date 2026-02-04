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

function shortDate(d) {
  if (!d) return "N/A";
  return String(d).slice(0, 10);
}

export default function MyReviews() {
  const token = useMemo(() => getToken(), []);
  const user = useMemo(() => getUser(), []);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    hasSalaryImpact: "",
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
      const params = { employee_id: user?.id };

      if (filters.hasSalaryImpact !== "") {
        params.hasSalaryImpact = filters.hasSalaryImpact === "true";
      }

      const res = await API.get("/performance-reviews", { params, headers: headers() });
      setItems(res.data?.data?.items || []);
    } catch {
      setItems([]);
      setErrorMsg("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await API.get("/performance-reviews/stats", { headers: headers() });
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
      const res = await API.get(`/performance-reviews/${row.id}`, { headers: headers() });
      setDetails(res.data?.data?.performance_review || null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.hasSalaryImpact]);

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "period_end",
      label: "Period",
      render: (r) => `${shortDate(r.period_start)} → ${shortDate(r.period_end)}`,
    },
    { key: "overall_score", label: "Score" },
    {
      key: "hasSalaryImpact",
      label: "Salary impact",
      render: (r) => (r.hasSalaryImpact ? "yes" : "no"),
    },
    {
      key: "hrWorker",
      label: "HR worker",
      render: (r) => r.hrWorker?.name || "—",
    },
  ];

  return (
    <Container className="app-container page-wrap">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">My Reviews</h2>
        <p className="hr-page-subtitle">List, stats, and details.</p>

        {/* Stats (GET /performance-reviews/stats) */}
        {stats && (
          <StatsRow
            items={[
              { label: "Total reviews", value: stats.total_reviews },
              { label: "Average score", value: stats.average_overall_score },
              { label: "With salary impact", value: stats.reviews_with_salary_impact },
            ]}
          />
        )}

        {/* Filter (GET /performance-reviews?employee_id&hasSalaryImpact=) */}
        <Row className="g-2 mt-18">
          <Col md={4}>
            <Form.Select
              name="hasSalaryImpact"
              value={filters.hasSalaryImpact}
              onChange={onFilterChange}
            >
              <option value="">All reviews</option>
              <option value="true">Only salary impact</option>
              <option value="false">Only no salary impact</option>
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
            No reviews found.
          </Alert>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-18">
            <div className="hint">Tip: click a row to open details.</div>
            <DataTable columns={columns} rows={items} onRowClick={openDetails} />
          </div>
        )}
      </div>

      {/* Details (GET /performance-reviews/{id}) */}
      <DetailsModal
        show={showModal}
        title={selectedId ? `Review #${selectedId}.` : "Review details."}
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
            <div><b>Period.</b> {shortDate(details.period_start)} → {shortDate(details.period_end)}.</div>
            <div><b>Score.</b> {details.overall_score}.</div>
            <div><b>Salary impact.</b> {details.hasSalaryImpact ? "yes" : "no"}.</div>

            <div><b>Employee.</b> {details.employee?.name || "—"}.</div>
            <div><b>HR worker.</b> {details.hrWorker?.name || "—"}.</div>
            <div><b>Payroll record ID.</b> {details.payrollRecord?.id || "—"}.</div>

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
