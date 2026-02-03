import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AboutCards from "../components/AboutCards";
import useUploadImage from "../hooks/useUploadImage";

import logo from "../assets/images/logo-large.png";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    position_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Positions dropdown state.
  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsError, setPositionsError] = useState("");

  const showPosition = useMemo(() => form.role === "employee", [form.role]);

  // Image upload hook (imgBB).
  const {
    file,
    previewUrl,
    uploadedUrl,
    loading: uploadLoading,
    error: uploadError,
    chooseFile,
    upload,
    cancel,
    reset,
  } = useUploadImage();

  function onChange(e) {
    const { name, value } = e.target;

    // If user changes role away from employee, clear position.
    if (name === "role" && value !== "employee") {
      setForm((p) => ({ ...p, role: value, position_id: "" }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  }

  async function loadPositions() {
    setPositionsError("");
    setPositionsLoading(true);

    try {
      const res = await API.get("/positions");
      const items = res.data?.data?.items || [];
      setPositions(items);
    } catch (err) {
      setPositions([]);
      setPositionsError("Could not load positions. Please try again.");
    } finally {
      setPositionsLoading(false);
    }
  }

  // Load positions once.
  useEffect(() => {
    loadPositions();
  }, []);

  // If user switches to employee and list is empty, fetch again.
  useEffect(() => {
    if (showPosition && positions.length === 0 && !positionsLoading) {
      loadPositions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPosition]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // If user picked a file but didn't upload yet -> upload during submit.
      let finalImageUrl = uploadedUrl || null;

      if (file && !uploadedUrl) {
        const url = await upload();
        if (!url) {
          setErrorMsg("Please upload the image (or remove it) before registering.");
          setLoading(false);
          return;
        }
        finalImageUrl = url;
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        status: true,
        image_url: finalImageUrl,
        position_id: form.role === "employee" ? Number(form.position_id) : null,
      };

      if (payload.role === "employee" && (!payload.position_id || Number.isNaN(payload.position_id))) {
        setErrorMsg("Position is required for employee.");
        setLoading(false);
        return;
      }

      const res = await API.post("/auth/register", payload);

      if (res.data?.success) {
        navigate("/login", { state: { email: payload.email } });
        return;
      }

      setErrorMsg(res.data?.message || "Registration failed.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.auth?.[0] ||
        "Registration failed.";
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

              <h3 className="auth-title">Create your account</h3>
              <p className="auth-subtitle">Register and start using Fast HR.</p>

              {errorMsg && (
                <Alert variant="light" className="hr-alert">
                  {errorMsg}
                </Alert>
              )}

              <Form onSubmit={onSubmit} className="auth-form">
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="e.g. Ana Petrović"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </Form.Group>

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
                    placeholder="Minimum 6 characters"
                    type="password"
                    required
                    minLength={6}
                    maxLength={255}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={form.role} onChange={onChange}>
                    <option value="employee">employee</option>
                    <option value="hr_worker">hr_worker</option>
                    <option value="admin">admin</option>
                  </Form.Select>
                  <div className="hint">Employee requires a position.</div>
                </Form.Group>

                {showPosition && (
                  <Form.Group className="mb-3">
                    <Form.Label>Position</Form.Label>

                    {positionsLoading ? (
                      <div className="hint">
                        <Spinner size="sm" /> Loading positions...
                      </div>
                    ) : positionsError ? (
                      <div className="hint">
                        {positionsError}{" "}
                        <button type="button" className="link-btn" onClick={loadPositions}>
                          Retry
                        </button>
                        .
                      </div>
                    ) : (
                      <Form.Select name="position_id" value={form.position_id} onChange={onChange} required>
                        <option value="">Choose a position...</option>
                        {positions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.seniority_level ? ` — ${p.seniority_level}` : ""}
                            {p.department?.name ? ` (${p.department.name})` : ""}
                          </option>
                        ))}
                      </Form.Select>
                    )}

                    <div className="hint">Pick an existing position from the system.</div>
                  </Form.Group>
                )}

                {/* Image upload (imgBB) */}
                <Form.Group className="mb-3">
                  <Form.Label>Profile image (optional)</Form.Label>

                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => chooseFile(e.target.files?.[0] || null)}
                  />

                  <div className="hint">Choose an image and upload it to imgBB. We save the URL.</div>

                  {uploadError && (
                    <div className="hint" style={{ marginTop: 6 }}>
                      {uploadError}
                    </div>
                  )}

                  {previewUrl && (
                    <div className="image-preview-wrap">
                      <img src={previewUrl} alt="Preview" className="image-preview" />
                      <div className="image-preview-meta">
                        {uploadedUrl ? (
                          <div className="hint">Uploaded ✅</div>
                        ) : (
                          <div className="hint">Not uploaded yet.</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="image-actions">
                    <Button
                      type="button"
                      className="hr-btn-ghost"
                      disabled={!file || uploadLoading}
                      onClick={upload}
                    >
                      {uploadLoading ? "Uploading..." : "Upload to imgBB"}
                    </Button>

                    <Button
                      type="button"
                      className="hr-btn-ghost"
                      disabled={!uploadLoading}
                      onClick={cancel}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      className="hr-btn-ghost"
                      disabled={!file && !uploadedUrl}
                      onClick={reset}
                    >
                      Remove
                    </Button>
                  </div>
                </Form.Group>

                <Button type="submit" className="w-100 hr-btn-primary" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading">
                      <Spinner size="sm" /> Creating...
                    </span>
                  ) : (
                    "Register."
                  )}
                </Button>

                <div className="auth-footer">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate("/login", { state: { email: form.email.trim() } })}
                  >
                    Login.
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
