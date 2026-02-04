import { Card, Col, Row } from "react-bootstrap";

export default function StatsRow({ items }) {
  return (
    <Row className="g-3 mt-18">
      {items.map((it) => (
        <Col md={4} key={it.label}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label">{it.label}</div>
              <div className="stat-value">{it.value}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
