import { useNavigate } from "react-router-dom";

function HousesMenu() {
  const navigate = useNavigate();

  return (
    <div className="page-shell menu-page">
      <div className="page-header content-width">
        <div><p className="eyebrow">Your property desk</p><h1>Houses</h1><p className="page-subtitle">Keep every listing, owner, and location in view.</p></div>
      </div>

      <div className="menu-grid content-width">
        <button className="menu-card menu-card-primary" onClick={() => navigate("/houses/list")}><span className="menu-number">01</span><strong>View houses</strong><small>Browse available listings and refine the search.</small><span className="menu-arrow">↗</span></button>
        <button className="menu-card" onClick={() => navigate("/owners")}><span className="menu-number">02</span><strong>View owners</strong><small>Keep owner contacts and property relationships current.</small><span className="menu-arrow">↗</span></button>
        <button className="menu-card" onClick={() => navigate("/areas")}><span className="menu-number">03</span><strong>Manage areas</strong><small>Organize regions and the streets inside them.</small><span className="menu-arrow">↗</span></button>
      </div>
    </div>
  );
}

export default HousesMenu;