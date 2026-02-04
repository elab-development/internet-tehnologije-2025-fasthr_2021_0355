import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import axios from "axios";
import useUploadImage from "../hooks/useUploadImage";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

function getToken() {
  return sessionStorage.getItem("fast_hr_token");
}

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("fast_hr_user") || "null");
  } catch {
    return null;
  }
}

export default function MyProfile() {
  const token = useMemo(() => getToken(), []);
  const sessionUser = useMemo(() => getSessionUser(), []);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [user, setUser] = useState(sessionUser);
  const [form, setForm] = useState({
    name: sessionUser?.name || "",
  });

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

  function authHeaders() {
    return { Authorization: `Bearer ${token}` };
  }

  async function fetchMe() {
    if (!sessionUser?.id) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await API.get(`/users/${sessionUser.id}`, {
        headers: authHeaders(),
      });

      const u = res.data?.data?.user;
      if (u) {
        setUser(u);
        setForm({ name: u.name || "" });
        sessionStorage.setItem("fast_hr_user", JSON.stringify(u));
      } else {
        setErrorMsg("Could not load user data.");
      }
    } catch {
      setErrorMsg("Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSaving(true);

    try {
      // Decide final avatar URL:
      // - If user chose a file and didn't upload yet -> upload first.
      // - If already uploaded -> use uploadedUrl.
      // - Else keep existing.
      let finalImageUrl = user?.image_url || null;

      if (file && !uploadedUrl) {
        const url = await upload();
        if (!url) {
          setErrorMsg("Upload the image first (or remove it), then save.");
          setSaving(false);
          return;
        }
        finalImageUrl = url;
      }

      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }

      const payload = {
        name: form.name.trim(),
        image_url: finalImageUrl,
      };

      const res = await API.put(`/users/${user.id}`, payload, {
        headers: authHeaders(),
      });

      const updated = res.data?.data?.user;
      if (updated) {
        setUser(updated);
        sessionStorage.setItem("fast_hr_user", JSON.stringify(updated));
        setSuccessMsg("Profile updated.");
        reset();
      } else {
        setErrorMsg("Update failed.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.name?.[0] ||
        "Update failed.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  const avatarSrc =
    previewUrl || user?.image_url || "https://via.placeholder.com/120?text=Avatar";

  return (
    <Container className="app-container page-wrap">
      <Row className="g-3">
        {/* Left: Profile card */}
        <Col lg={7}>
          <div className="hr-card hr-card--padded">
            <h2 className="hr-page-title">My Profile</h2>
            <p className="hr-page-subtitle">View and update your basic information.</p>

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

            {successMsg && (
              <Alert variant="light" className="hr-alert mt-18">
                {successMsg}
              </Alert>
            )}

            {!loading && user && (
              <Card className="profile-card mt-18">
                <Card.Body className="profile-card-body">
                  <img src={avatarSrc} alt="Avatar" className="profile-avatar" />

                  <div className="profile-meta">
                    <div className="profile-name">{user.name}.</div>
                    <div className="profile-email">{user.email}.</div>

                    <div className="profile-pill-row">
                      <span className="hr-pill">Role: {user.role}.</span>
                      <span className="hr-pill">
                        Status: {user.status ? "active" : "inactive"}.
                      </span>
                    </div>

                    {/* Optional: show position if API returns it (UserResource may include it). */}
                    {user.position?.name && (
                      <div className="profile-hint">
                        Position: <b>{user.position.name}</b>.
                      </div>
                    )}

                    {user.position?.department?.name && (
                      <div className="profile-hint">
                        Department: <b>{user.position.department.name}</b>.
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>

        {/* Right: Edit form */}
        <Col lg={5}>
          <div className="hr-card hr-card--padded">
            <h3 className="auth-title">Edit profile</h3>
            <p className="auth-subtitle">Simple updates only.</p>

            <Form onSubmit={onSave}>
              <Form.Group className="mb-3">
                <Form.Label>Name.</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Profile image (optional).</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => chooseFile(e.target.files?.[0] || null)}
                />

                <div className="hint">Upload to imgBB, then we store the URL.</div>

                {uploadError && (
                  <Alert variant="light" className="hr-alert mt-18">
                    {uploadError}
                  </Alert>
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
                    {uploadLoading ? "Uploading..." : "Upload"}
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

              <Button className="w-100 hr-btn-primary" type="submit" disabled={saving}>
                {saving ? (
                  <span className="btn-loading">
                    <Spinner size="sm" /> Saving...
                  </span>
                ) : (
                  "Save changes."
                )}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
