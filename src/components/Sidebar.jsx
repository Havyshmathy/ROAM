
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useRoam } from "../context/useRoam";

const navItems = [
  { name: "Discover", path: "/discover", icon: "✳️" },
  { name: "My Atlas", path: "/atlas", icon: "🌍" },
  { name: "Trips", path: "/trips", icon: "🧳" },
  { name: "Diaries", path: "/diaries", icon: "📔" },
  { name: "Saved", path: "/saved", icon: "♡" },
];

function Sidebar() {
  const navigate = useNavigate();
  const { savedPlaces, user, logout } = useRoam();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">
      <Link className="brand" to="/discover">
        <span className="brand-icon">✳</span>
        <span>
          roam<span className="brand-period">.</span>
        </span>
      </Link>

      <div className="profile-card">
        <div className="avatar">🧃</div>
        <div>
          <p className="profile-name">
            {user?.name || "Little explorer"}
          </p>
          <p className="profile-subtitle">Collector of moments</p>
        </div>
        <span className="profile-sparkle">✦</span>
      </div>

      <p className="sidebar-label">YOUR LITTLE WORLD</p>

      <nav className="side-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>

            {item.name === "Saved" && savedPlaces.length > 0 && (
              <span className="nav-count">{savedPlaces.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note">
        <span className="note-doodle">✷</span>
        <p className="note-title">A gentle reminder</p>
        <p>
          You don't have to go far to find something wonderful.
        </p>
        <span className="note-bottom">— your future self</span>
      </div>

      <div className="sidebar-footer">
        <span>Made for the wanderers</span>
        <span>♡</span>
      </div>

      <button
        type="button"
        className="secondary-button"
        onClick={handleLogout}
      >
        Log out ↗
      </button>
    </aside>
  );
}

export default Sidebar;
