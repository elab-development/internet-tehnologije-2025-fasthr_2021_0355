import { FaSitemap } from "react-icons/fa";
import PageUnderDevelopment from "../components/PageUnderDevelopment";

export default function AdminDepartments() {
  return (
    <div className="app-container page-wrap">
      <PageUnderDevelopment
        title="Departments"
        subtitle="CRUD for departments will be added here."
        icon={<FaSitemap />}
      />
    </div>
  );
}
