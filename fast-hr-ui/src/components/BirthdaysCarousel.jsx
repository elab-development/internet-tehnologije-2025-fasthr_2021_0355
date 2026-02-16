import { useMemo } from "react";
import { Alert, Button, Carousel, Spinner } from "react-bootstrap";
import { FaSyncAlt } from "react-icons/fa";
import useRandomUsers from "../hooks/useRandomUsers";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDob(dobIso) {
  if (!dobIso) return "—";
  const d = new Date(dobIso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
}

function nextBirthdayInfo(dobIso) {
  if (!dobIso) return { next: null, daysLeft: null, isToday: false };

  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return { next: null, daysLeft: null, isToday: false };

  const now = new Date();
  const year = now.getFullYear();

  const thisYear = new Date(year, dob.getMonth(), dob.getDate());
  const next = thisYear >= stripTime(now) ? thisYear : new Date(year + 1, dob.getMonth(), dob.getDate());

  const ms = stripTime(next).getTime() - stripTime(now).getTime();
  const daysLeft = Math.round(ms / (1000 * 60 * 60 * 24));

  return { next, daysLeft, isToday: daysLeft === 0 };
}

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function safeText(v) {
  return v ? String(v) : "—";
}

export default function BirthdaysCarousel({
  title = "Upcoming birthdays",
  results = 10,
  nat = "", // e.g. "rs,gb,us"
  interval = 5000,
  autoPlay = true,
  showControls = true,
  showIndicators = false,
}) {
  const { users, loading, error, reload } = useRandomUsers({ results, nat });

  const slides = useMemo(() => {
    return (users || []).map((u) => {
      const fullName = `${u?.name?.first || ""} ${u?.name?.last || ""}`.trim() || "Unknown";
      const dobIso = u?.dob?.date;
      const age = u?.dob?.age;
      const { next, daysLeft, isToday } = nextBirthdayInfo(dobIso);

      const nextLabel = next
        ? `${pad2(next.getDate())}.${pad2(next.getMonth() + 1)}.${next.getFullYear()}`
        : "—";

      return {
        key: u?.login?.uuid || `${fullName}-${dobIso}`,
        fullName,
        picture: u?.picture?.large || u?.picture?.medium || "",
        dobLabel: formatDob(dobIso),
        age: typeof age === "number" ? age : null,
        nextLabel,
        daysLeft,
        isToday,
        email: u?.email,
        phone: u?.phone || u?.cell,
        location: `${u?.location?.city || ""}${u?.location?.country ? `, ${u.location.country}` : ""}`.trim(),
        username: u?.login?.username,
      };
    });
  }, [users]);

  return (
    <div className="hr-card hr-card--padded">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="hr-page-title" style={{ marginBottom: 4 }}>
            {title}.
          </div>
          <div className="hr-page-subtitle" style={{ marginBottom: 0 }}>
            Random profiles from randomuser.me.
          </div>
        </div>

        <Button className="hr-btn-ghost" onClick={reload} disabled={loading} title="Reload random users">
          <FaSyncAlt className="me-2" />
          Refresh.
        </Button>
      </div>

      {loading && (
        <div className="mt-18">
          <Spinner size="sm" /> Loading...
        </div>
      )}

      {!loading && error && (
        <Alert variant="light" className="hr-alert mt-18">
          {error}
        </Alert>
      )}

      {!loading && !error && slides.length === 0 && (
        <Alert variant="light" className="hr-alert mt-18">
          No users to display.
        </Alert>
      )}

      {!loading && !error && slides.length > 0 && (
        <div className="mt-18">
          <Carousel
            controls={showControls}
            indicators={showIndicators}
            interval={autoPlay ? interval : null}
            touch
          >
            {slides.map((s) => (
              <Carousel.Item key={s.key}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 18,
                    alignItems: "center",
                    padding: 18,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: "999px",
                        overflow: "hidden",
                        margin: "0 auto",
                        border: "2px solid rgba(255,255,255,0.25)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                      }}
                    >
                      {s.picture ? (
                        <img
                          src={s.picture}
                          alt={s.fullName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                          —
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 10, fontWeight: 900 }}>{s.fullName}.</div>
                    <div style={{ opacity: 0.85, fontSize: 13 }}>
                      @{safeText(s.username)}.
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                      <span className="pill">
                        <b>DOB:</b> {s.dobLabel}.
                      </span>

                      <span className="pill">
                        <b>Age:</b> {s.age ?? "—"}.
                      </span>

                      <span className="pill">
                        <b>Next birthday:</b> {s.nextLabel}.
                      </span>

                      <span className="pill">
                        <b>Days left:</b>{" "}
                        {s.daysLeft === null ? "—" : s.daysLeft}.
                        {s.isToday ? " 🎉" : ""}.
                      </span>
                    </div>

                    <div className="details-grid">
                      <div>
                        <b>Email.</b> {safeText(s.email)}.
                      </div>
                      <div>
                        <b>Phone.</b> {safeText(s.phone)}.
                      </div>
                      <div>
                        <b>Location.</b> {safeText(s.location)}.
                      </div>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}
    </div>
  );
}
