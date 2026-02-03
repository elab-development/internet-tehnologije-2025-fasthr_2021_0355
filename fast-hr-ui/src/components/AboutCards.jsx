import { Card } from "react-bootstrap";
import Lottie from "lottie-react";
import { FaBullseye, FaLightbulb, FaEye, FaAward } from "react-icons/fa";

import targetAnim from "../assets/animations/target.json";
import ideaAnim from "../assets/animations/idea.json";
import visionAnim from "../assets/animations/vision.json";
import awardAnim from "../assets/animations/award.json";

const cards = [
  {
    key: "target",
    title: "Target",
    text: "Fast HR helps teams organize people data, roles, and payroll records with clarity and speed.",
    icon: <FaBullseye className="hr-icon" />,
    anim: targetAnim,
  },
  {
    key: "idea",
    title: "Idea",
    text: "A friendly HR dashboard that feels simple, playful, and easy to use for everyone.",
    icon: <FaLightbulb className="hr-icon" />,
    anim: ideaAnim,
  },
  {
    key: "vision",
    title: "Vision",
    text: "Turn HR processes into clean workflows with strong structure: departments, positions, reviews, payroll.",
    icon: <FaEye className="hr-icon" />,
    anim: visionAnim,
  },
  {
    key: "award",
    title: "Award mindset",
    text: "Be proud of good work: track performance, goals, and salary impact in a transparent way.",
    icon: <FaAward className="hr-icon" />,
    anim: awardAnim,
  },
];

export default function AboutCards() {
  return (
    <div className="about-panel hr-card hr-card--padded">
      <div className="about-header">
        <h2 className="hr-page-title">Welcome guest!</h2>
        <p className="hr-page-subtitle">
          A warm HR space in orange & white. Simple, cartoonish, and modern.
        </p>
      </div>

      <div className="about-cards">
        {cards.map((c) => (
          <Card key={c.key} className="about-card">
            <Card.Body className="about-card-body">
              <div className="about-card-left">
                <div className="about-card-title">
                  <span className="about-card-icon">{c.icon}</span>
                  <span>{c.title}</span>
                </div>
                <div className="about-card-text">{c.text}</div>
              </div>

              <div className="about-card-right">
                <Lottie animationData={c.anim} loop className="about-lottie" />
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}
