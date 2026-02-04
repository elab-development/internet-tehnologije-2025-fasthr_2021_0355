import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaChartPie } from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function authHeaders() {
  const token = sessionStorage.getItem("fast_hr_token");
  return { Authorization: `Bearer ${token}` };
}

function money(v) {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [year, setYear] = useState(String(new Date().getFullYear()));

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);

  async function loadAll() {
    setLoading(true);
    setErrorMsg("");

    try {
      const [uRes, dRes, pRes, prRes] = await Promise.all([
        API.get("/users", { headers: authHeaders() }),
        API.get("/departments", { headers: authHeaders() }),
        API.get("/positions", { headers: authHeaders() }),
        API.get("/payroll-records", {
          params: { period_year: Number(year) },
          headers: authHeaders(),
        }),
      ]);

      // Accept multiple possible backend shapes.
      const u = uRes.data?.data?.items || uRes.data?.data?.users || uRes.data?.data || [];
      const d = dRes.data?.data?.items || dRes.data?.data?.departments || dRes.data?.data || [];
      const p = pRes.data?.data?.items || pRes.data?.data?.positions || pRes.data?.data || [];
      const pr = prRes.data?.data?.items || prRes.data?.data?.payroll_records || prRes.data?.data || [];

      setUsers(Array.isArray(u) ? u : []);
      setDepartments(Array.isArray(d) ? d : []);
      setPositions(Array.isArray(p) ? p : []);
      setPayrollRecords(Array.isArray(pr) ? pr : []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Could not load metrics.");
      setUsers([]);
      setDepartments([]);
      setPositions([]);
      setPayrollRecords([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const userCounts = useMemo(() => {
    const counts = { employee: 0, hr_worker: 0, admin: 0 };
    for (const u of users) {
      if (u?.role === "employee") counts.employee += 1;
      if (u?.role === "hr_worker") counts.hr_worker += 1;
      if (u?.role === "admin") counts.admin += 1;
    }
    return counts;
  }, [users]);

  const payrollNetSum = useMemo(() => {
    let sum = 0;
    for (const r of payrollRecords) sum += Number(r?.net_amount || 0);
    return sum;
  }, [payrollRecords]);

  const payrollByMonthChart = useMemo(() => {
    const map = {};
    for (let m = 1; m <= 12; m++) map[m] = 0;

    for (const r of payrollRecords) {
      const m = Number(r?.period_month);
      if (!m || m < 1 || m > 12) continue;
      map[m] += Number(r?.net_amount || 0);
    }

    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      return {
        month: String(m).padStart(2, "0"),
        net: Number(map[m].toFixed(2)),
      };
    });
  }, [payrollRecords]);

  return (
    <Container className="app-container page-wrap">
      <div className="hr-card hr-card--padded">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.10)",
              display: "grid",
              placeItems: "center",
              fontSize: 20,
            }}
          >
            <FaChartPie />
          </div>

          <div>
            <h2 className="hr-page-title" style={{ fontSize: 28, margin: 0 }}>
              Metrics
            </h2>
            <p className="hr-page-subtitle" style={{ margin: "6px 0 0 0" }}>
              Simple overview + payroll net trend by month.
            </p>
          </div>
        </div>

        <Row className="g-3 mt-3" style={{ alignItems: "end" }}>
          <Col md={3}>
            <Form.Label style={{ fontWeight: 900 }}>Year.</Form.Label>
            <Form.Control
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2026"
            />
          </Col>
        </Row>

        {errorMsg && (
          <Alert variant="light" className="hr-alert mt-18">
            {errorMsg}
          </Alert>
        )}

        {loading && (
          <div className="mt-18">
            <Spinner size="sm" /> Loading...
          </div>
        )}

        {!loading && (
          <>
            {/* SIMPLE STAT CARDS */}
            <div
              className="mt-18"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <div className="hr-card hr-card--padded">
                <div style={{ fontWeight: 900, opacity: 0.9 }}>Users total.</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                  {users.length}.
                </div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>
                  Employees: {userCounts.employee}. HR workers: {userCounts.hr_worker}. Admins: {userCounts.admin}.
                </div>
              </div>

              <div className="hr-card hr-card--padded">
                <div style={{ fontWeight: 900, opacity: 0.9 }}>Departments.</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                  {departments.length}.
                </div>
              </div>

              <div className="hr-card hr-card--padded">
                <div style={{ fontWeight: 900, opacity: 0.9 }}>Positions.</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                  {positions.length}.
                </div>
              </div>

              <div className="hr-card hr-card--padded">
                <div style={{ fontWeight: 900, opacity: 0.9 }}>
                  Payroll net (sum) for {year}.
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                  {money(payrollNetSum)}.
                </div>
              </div>
            </div>

            {/* SIMPLE CHART */}
            <div className="hr-card hr-card--padded mt-18">
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                Payroll Net by Month.
              </div>
              <div style={{ opacity: 0.85, marginTop: 6 }}>
                Based on payroll records for year {year}.
              </div>

              <div style={{ width: "100%", height: 280, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payrollByMonthChart}>
                    <CartesianGrid stroke="rgba(255,255,255,0.22)" />
                    <XAxis dataKey="month" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.15)",
                        border: "2px solid rgba(255,255,255,0.22)",
                        borderRadius: 14,
                        color: "#fff",
                        fontWeight: 800,
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="net" fill="rgba(255,255,255,0.85)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
