import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTools, FaArrowLeft } from "react-icons/fa";

export default function PageUnderDevelopment({
  title = "Page under development.",
  subtitle = "This feature will be added soon.",
  backTo = null,
}) {
  const navigate = useNavigate();

  return (
    <Container className="app-container page-wrap">
      <div className="hr-card hr-card--padded">
        <span className="hr-pill">
          <FaTools style={{ marginRight: 8 }} />
          Under construction.
        </span>

        <h2 className="hr-page-title" style={{ marginTop: 14 }}>
          {title}
        </h2>

        <p className="hr-page-subtitle">{subtitle}</p>

        {backTo && (
          <div className="mt-18">
            <Button className="hr-btn-ghost" onClick={() => navigate(backTo)}>
              <FaArrowLeft className="me-2" />
              Back.
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}
