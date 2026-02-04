import { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Lottie from "lottie-react";

import hrWorkerImg from "../assets/images/hr-worker.png";
import hrWorkerAnim from "../assets/animations/hr-worker.json";

export default function HrWorkerHome() {
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
              <h2 className="hr-page-title">HR Worker dashboard</h2>
              <p className="hr-page-subtitle">
                Welcome {user?.name ? `${user.name}.` : "to Fast HR."}
              </p>

              <div className="home-text">
                <p>
                  As an <b>HR worker</b>, you keep the system accurate and up-to-date. Your job is to
                  manage people data, positions, performance reviews, and payroll records with a clear process.
                </p>

                <p>
                  Fast HR is designed to make HR work structured and trackable: you can create and update
                  performance reviews, connect them to payroll records when needed, and ensure monthly payroll
                  is processed cleanly.
                </p>

                <p>
                  This dashboard focuses on clarity. You’ll see data grouped logically and you’ll be able to
                  move through tasks without confusion - simple UI, readable forms, and consistent rules.
                </p>
              </div>
            </Col>

            <Col lg={5} className="home-right">
              <img src={hrWorkerImg} alt="HR Worker" className="home-image" />
            </Col>
          </Row>

          <div className="home-divider" />

          <Row>
            <Col lg={12}>
              <Card className="home-lottie-card">
                <Card.Body className="home-lottie-body">
                  <div>
                    <h4 className="home-section-title">Structured HR flow</h4>
                    <p className="home-section-text">
                      Create reviews, manage payroll status (draft, approved, paid), and keep positions and
                      departments organized. Everything stays connected and easy to audit.
                    </p>
                  </div>

                  <Lottie style={{height:"300px", width:"600px"}} animationData={hrWorkerAnim} loop className="home-lottie" />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
