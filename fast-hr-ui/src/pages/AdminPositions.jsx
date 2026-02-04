import { FaBriefcase } from "react-icons/fa";
import PageUnderDevelopment from "../components/PageUnderDevelopment";

export default function AdminPositions() {
  return (
    <div className="app-container page-wrap">
      <PageUnderDevelopment
        title="Positions"
        subtitle="CRUD for positions will be added here."
        icon={<FaBriefcase />}
      />
    </div>
  );
}
