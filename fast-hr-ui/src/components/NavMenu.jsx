// src/components/NavMenu.jsx
import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { OverlayTrigger, Tooltip, Button, Image } from "react-bootstrap";

import {
  FaBars,
  FaHome,
  FaUsers,
  FaSitemap,
  FaBriefcase,
  FaStar,
  FaMoneyCheckAlt,
  FaChartPie,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";

import logoSmall from "../assets/images/logo-small.png";
import logoLarge from "../assets/images/logo-large.png";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

function safeUser() {
  try {
    return JSON.parse(sessionStorage.getItem("fast_hr_user") || "null");
  } catch {
    return null;
  }
}

function getToken() {
  return sessionStorage.getItem("fast_hr_token");
}

export default function NavMenu() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = useMemo(() => safeUser(), []);
  const role = user?.role || "employee";

  const homeRoute =
    role === "employee" ? "/worker" : role === "hr_worker" ? "/hr-worker" : "/admin";

  const navItems = useMemo(() => {
    const common = [{ to: homeRoute, label: "Home", icon: <FaHome /> }];

    const employee = [
      ...common,
      { to: "/my-profile", label: "My Profile", icon: <FaUsers /> },
      { to: "/my-reviews", label: "My Reviews", icon: <FaStar /> },
      { to: "/my-payroll", label: "My Payroll", icon: <FaMoneyCheckAlt /> },
    ];

    const hrWorker = [
      ...common,
      { to: "/users", label: "Users", icon: <FaUsers /> },
      { to: "/departments", label: "Departments", icon: <FaSitemap /> },
      { to: "/positions", label: "Positions", icon: <FaBriefcase /> },
      { to: "/performance-reviews", label: "Performance Reviews", icon: <FaStar /> },
      { to: "/payroll-records", label: "Payroll Records", icon: <FaMoneyCheckAlt /> },
    ];

    const admin = [
      ...common,
      { to: "/admin/users", label: "User Management", icon: <FaUserShield /> },
      { to: "/admin/departments", label: "Departments", icon: <FaSitemap /> },
      { to: "/admin/positions", label: "Positions", icon: <FaBriefcase /> },
      { to: "/metrics", label: "Metrics", icon: <FaChartPie /> },
    ];

    if (role === "hr_worker") return hrWorker;
    if (role === "admin") return admin;
    return employee;
  }, [role, homeRoute]);

  function renderNavItem(item) {
    const content = (
      <div className="nav-item-inner">
        <span className="nav-icon">{item.icon}</span>
        {!collapsed && <span className="nav-label">{item.label}</span>}
      </div>
    );

    if (!collapsed) {
      return (
        <NavLink key={item.to} to={item.to} className="nav-item">
          {content}
        </NavLink>
      );
    }

    return (
      <OverlayTrigger
        key={item.to}
        placement="right"
        overlay={<Tooltip>{item.label}</Tooltip>}
        delay={{ show: 150, hide: 0 }}
      >
        <NavLink to={item.to} className="nav-item">
          {content}
        </NavLink>
      </OverlayTrigger>
    );
  }

  async function logout() {
    const token = getToken();

    try {
      if (token) {
        await API.post(
          "/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // ok
    } finally {
      sessionStorage.removeItem("fast_hr_token");
      sessionStorage.removeItem("fast_hr_user");
      navigate("/login", { replace: true });
    }
  }

  const avatarTooltip = (
    <Tooltip>
      <div style={{ fontWeight: 900 }}>{user?.name || "User"}</div>
      <div style={{ fontSize: 12, opacity: 0.9 }}>{user?.email || ""}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{user?.role || ""}</div>
    </Tooltip>
  );

  return (
    <div className="app-layout">
      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
        <div className="sidebar-top">
          {/* Expanded: hamburger only */}
          {!collapsed && (
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse menu"
              title="Collapse"
            >
              <FaBars />
            </button>
          )}

          {/* Logo always visible and acts as toggle (collapsed shows small logo) */}
          <button
            type="button"
            className="sidebar-logo-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <img
              src={collapsed ? logoSmall : logoLarge}
              alt="Fast HR"
              className={collapsed ? "logo-small" : "logo-large"}
            />
          </button>
        </div>

        <div className="sidebar-links">{navItems.map(renderNavItem)}</div>

        <div className="sidebar-bottom">
          <div className="user-box hr-card">
            {/* Collapsed: tooltip on avatar */}
            {collapsed ? (
              <OverlayTrigger placement="right" overlay={avatarTooltip} delay={{ show: 150, hide: 0 }}>
                <div className="user-box-inner">
                  <Image
                    src={user?.image_url || "https://via.placeholder.com/64"}
                    roundedCircle
                    className="user-avatar"
                    alt="Avatar"
                  />
                </div>
              </OverlayTrigger>
            ) : (
              <div className="user-box-inner">
                <Image
                  src={user?.image_url || "https://via.placeholder.com/64"}
                  roundedCircle
                  className="user-avatar"
                  alt="Avatar"
                />
                <div className="user-meta">
                  <div className="user-name">{user?.name || "User"}</div>
                  <div className="user-email">{user?.email || ""}</div>
                  <div className="user-role">{user?.role || ""}</div>
                </div>
              </div>
            )}
          </div>

          <Button type="button" className="hr-btn-primary w-100 logout-btn" onClick={logout}>
            <FaSignOutAlt className="me-2" />
            {!collapsed ? "Logout" : ""}
          </Button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
