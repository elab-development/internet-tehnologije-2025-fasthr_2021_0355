import { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Lottie from "lottie-react";

import workerImg from "../assets/images/worker.png";
import workerAnim from "../assets/animations/worker.json";

export default function WorkerHome() {
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
              <h2 className="hr-page-title">Worker dashboard</h2>
              <p className="hr-page-subtitle">
                Welcome {user?.name ? `${user.name}.` : "to Fast HR."}
              </p>

              <div className="home-text">
                <p>
                  As an <b>employee</b>, your main goal is to keep your work profile clear and accurate.
                  Fast HR helps you understand your position, your department, and how the company tracks
                  progress and payroll in a friendly way.
                </p>

                <p>
                  Here you can quickly review the data that HR maintains for you: your current position,
                  your performance reviews, and your payroll records per month. Everything is organized
                  so you don’t waste time searching.
                </p>

                <p>
                  Your experience is designed to be simple: read your information, stay informed, and
                  focus on your work. When something needs changing, HR can update it in a controlled way.
                </p>
              </div>
            </Col>

            <Col lg={5} className="home-right">
              <img style={{height:"300px", width:"600px"}} src={workerImg} alt="Worker" className="home-image" />
            </Col>
          </Row>

          <div className="home-divider" />

          <Row>
            <Col lg={12}>
              <Card className="home-lottie-card">
                <Card.Body className="home-lottie-body">
                  <div>
                    <h4 className="home-section-title">Your work, organized</h4>
                    <p className="home-section-text">
                      Your role page is a calm place where information is clear and easy to understand.
                      Fast HR keeps everything structured: departments, positions, people, reviews, payroll.
                    </p>
                  </div>

                  <Lottie style={{height:"300px", width:"600px"}} animationData={workerAnim} loop className="home-lottie" />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
