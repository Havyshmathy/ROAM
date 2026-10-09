
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const pageNames = {
  "/discover": "Discover",
  "/atlas": "My Atlas",
  "/trips": "Trips",
  "/diaries": "Diaries",
  "/saved": "Saved",
};

function Layout() {
  const location = useLocation();
  const activePage = pageNames[location.pathname] || "Discover";

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            YOUR WORLD <span>/</span> {activePage.toUpperCase()}
          </div>

          <div className="topbar-right">
            <span className="local-badge">
              <span className="status-dot" />
              YOUR PERSONAL ATLAS
            </span>
            <div className="mini-avatar">🧃</div>
          </div>
        </header>

        <Outlet />

        <footer className="page-footer">
          <span>roam. © 2026</span>
          <span>
            Collect places, not just plans. <b>♡</b>
          </span>
        </footer>
      </main>
    </div>
  );
}

export default Layout;