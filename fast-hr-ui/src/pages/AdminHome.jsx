import { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Lottie from "lottie-react";

import adminImg from "../assets/images/admin.png";
import adminAnim from "../assets/animations/admin.json";

export default function AdminHome() {
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("fast_hr_user") || "null");
    } catch {
      return null;
    }
  }, []);

  return (
    <div className="home-page">
      <Container className="app-container">
        <div className="hr-card hr-card--padded">
          <Row className="home-hero">
            <Col lg={7}>
              <h2 className="hr-page-title">Admin dashboard</h2>
              <p className="hr-page-subtitle">
                Welcome {user?.name ? `${user.name}.` : "to Fast HR."}
              </p>

              <div className="home-text">
                <p>
                  As an <b>admin</b>, you control access and stability. You manage users, roles,
                  account status, and ensure the system stays consistent and safe.
                </p>

                <p>
                  Fast HR uses a clean structure: departments and positions define the organization,
                  employees connect to positions, and HR workers handle reviews and payroll processing.
                  Your role is to keep everything working smoothly.
                </p>

                <p>
                  You’ll also work with simple metrics: how many users exist, how many are active,
                  payroll processing progress, and review activity - so you always have a clear overview.
                </p>
              </div>
            </Col>

            <Col lg={5} className="home-right">
              <img src={adminImg} alt="Admin" className="home-image" />
            </Col>
          </Row>

          <div className="home-divider" />

          <Row>
            <Col lg={12}>
              <Card className="home-lottie-card">
                <Card.Body className="home-lottie-body">
                  <div>
                    <h4 className="home-section-title">Control & overview</h4>
                    <p className="home-section-text">
                      Admin keeps the system clean: set roles, manage statuses, and make sure the data is ready
                      for HR work and reporting. Simple rules, clear structure, stable results.
                    </p>
                  </div>

                  <Lottie style={{height:"300px", width:"600px"}} animationData={adminAnim} loop className="home-lottie" />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
