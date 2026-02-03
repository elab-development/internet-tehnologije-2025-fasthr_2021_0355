import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AboutCards from "../components/AboutCards";

import logo from "../assets/images/logo-large.png";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Prefill email from Register success.
  useEffect(() => {
    const emailFromState = location?.state?.email;
    if (emailFromState) {
      setForm((p) => ({ ...p, email: emailFromState }));
    }
  }, [location?.state]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function routeByRole(role) {
    if (role === "employee") return "/worker";
    if (role === "hr_worker") return "/hr-worker";
    if (role === "admin") return "/admin";
    return "/login";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      const res = await API.post("/auth/login", payload);

      if (!res.data?.success) {
        setErrorMsg(res.data?.message || "Login failed.");
        setLoading(false);
        return;
      }

      const token = res.data?.data?.token;
      const user = res.data?.data?.user;

      if (!token || !user) {
        setErrorMsg("Login response missing token or user.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("fast_hr_token", token);
      sessionStorage.setItem("fast_hr_user", JSON.stringify(user));

      navigate(routeByRole(user.role), { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.auth?.[0] ||
        "Login failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Container className="app-container">
        <Row className="auth-grid">
          <Col lg={7} className="auth-left">
            <AboutCards />
          </Col>

          <Col lg={5} className="auth-right">
            <div className="auth-card hr-card hr-card--padded">
              <div className="auth-logo-wrap">
                <img src={logo} alt="Fast HR" className="auth-logo" />
              </div>

              <h3 className="auth-title">Welcome back</h3>
              <p className="auth-subtitle">Login and continue to your dashboard.</p>

              {errorMsg && (
                <Alert variant="light" className="hr-alert">
                  {errorMsg}
                </Alert>
              )}

              <Form onSubmit={onSubmit} className="auth-form">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="e.g. ana@email.com"
                    type="email"
                    required
                    maxLength={150}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Your password"
                    type="password"
                    required
                    maxLength={255}
                  />
                </Form.Group>

                <Button type="submit" className="w-100 hr-btn-primary" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading">
                      <Spinner size="sm" /> Logging in...
                    </span>
                  ) : (
                    "Login."
                  )}
                </Button>

                <div className="auth-footer">
                  New here?{" "}
                  <button type="button" className="link-btn" onClick={() => navigate("/register")}>
                    Create an account.
                  </button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
