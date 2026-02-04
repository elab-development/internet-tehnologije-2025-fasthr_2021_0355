import { FaUserShield } from "react-icons/fa";
import PageUnderDevelopment from "../components/PageUnderDevelopment";

export default function UsersAdmin() {
  return (
    <div className="app-container page-wrap">
      <PageUnderDevelopment
        title="User Management"
        subtitle="CRUD for users will be added here."
        icon={<FaUserShield />}
      />
    </div>
  );
}
