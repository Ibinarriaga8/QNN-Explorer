import { NavLink, Outlet } from "react-router-dom";
import { navItems } from "../data/content";

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="container nav-bar">
          <NavLink className="brand" to="/">
            <div className="brand-mark">
              <span>QN</span>
            </div>
            <div>
              <div>Quantum Neural Networks Explorer</div>
              <div className="mono-label">Farhi &amp; Neven circuit + training lab</div>
            </div>
          </NavLink>
          <nav className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : undefined)}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
