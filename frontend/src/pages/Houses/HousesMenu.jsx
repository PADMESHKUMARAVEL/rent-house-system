import { useNavigate } from "react-router-dom";

function HousesMenu() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Houses Page</h1>

      <button onClick={() => navigate("/houses/list")}>
        View Houses
      </button>

      <button onClick={() => navigate("/owners")}>
        View Owners
      </button>

      <button onClick={() => navigate("/areas")}>
        View Areas
      </button>
    </div>
  );
}

export default HousesMenu;