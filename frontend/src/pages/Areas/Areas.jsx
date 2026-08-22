import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_FRONTEND_API_URL;

function Areas() {
  const [regions, setRegions] = useState([]);
  const [streets, setStreets] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStreet, setSelectedStreet] = useState("");

  const [regionMode, setRegionMode] = useState(null);
  const [streetMode, setStreetMode] = useState(null);

  const [regionName, setRegionName] = useState("");
  const [streetName, setStreetName] = useState("");

  // =========================
  // FETCH REGIONS
  // =========================

  const fetchRegions = async () => {
    try {
      const response = await fetch(`${API_URL}/regions`);
      const data = await response.json();

      if (response.ok) {
        setRegions(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  // =========================
  // FETCH STREETS
  // =========================

  const fetchStreets = async (regionId) => {
    try {
      const response = await fetch(
        `${API_URL}/streets/region/${regionId}`
      );

      const data = await response.json();

      if (response.ok) {
        setStreets(data);
      } else {
        setStreets([]);
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching streets:", error);
    }
  };

  // =========================
  // REGION SELECT
  // =========================

  const handleRegionChange = (e) => {
    const regionId = e.target.value;

    setSelectedRegion(regionId);
    setSelectedStreet("");
    setStreets([]);

    setRegionMode(null);
    setStreetMode(null);

    if (regionId) {
      fetchStreets(regionId);
    }
  };

  // =========================
  // STREET SELECT
  // =========================

  const handleStreetChange = (e) => {
    const streetId = e.target.value;

    setSelectedStreet(streetId);
    setStreetMode(null);
  };

  // =========================
  // ADD REGION
  // =========================

  const handleAddRegion = async () => {
    if (!regionName.trim()) {
      alert("Enter a region name");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/regions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          region_name: regionName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchRegions();

        // Select newly created region
        setSelectedRegion(data.region_id);

        setStreets([]);
        setSelectedStreet("");

        setRegionName("");
        setRegionMode(null);

        alert(data.message);
      } else {
        alert(data.message || "Failed to add region");
      }
    } catch (error) {
      console.error("Error adding region:", error);
    }
  };

  // =========================
  // EDIT REGION
  // =========================

  const startEditRegion = () => {
    if (!selectedRegion) {
      alert("Select a region first");
      return;
    }

    const region = regions.find(
      (r) => String(r.region_id) === String(selectedRegion)
    );

    setRegionName(region?.region_name || "");
    setRegionMode("edit");
  };

  const handleUpdateRegion = async () => {
    if (!regionName.trim()) {
      alert("Enter a region name");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/regions/${selectedRegion}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            region_name: regionName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchRegions();

        setRegionName("");
        setRegionMode(null);

        alert(data.message);
      } else {
        alert(data.message || "Failed to update region");
      }
    } catch (error) {
      console.error("Error updating region:", error);
    }
  };

  // =========================
  // ADD STREET
  // =========================

  const handleAddStreet = async () => {
    if (!selectedRegion) {
      alert("Select a region first");
      return;
    }

    if (!streetName.trim()) {
      alert("Enter a street name");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/streets/region/${selectedRegion}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            street_name: streetName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchStreets(selectedRegion);

        setSelectedStreet(data.street_id || "");

        setStreetName("");
        setStreetMode(null);

        alert(data.message);
      } else {
        alert(data.message || "Failed to add street");
      }
    } catch (error) {
      console.error("Error adding street:", error);
    }
  };

  // =========================
  // EDIT STREET
  // =========================

  const startEditStreet = () => {
    if (!selectedStreet) {
      alert("Select a street first");
      return;
    }

    const street = streets.find(
      (s) => String(s.street_id) === String(selectedStreet)
    );

    setStreetName(street?.street_name || "");
    setStreetMode("edit");
  };

  const handleUpdateStreet = async () => {
    if (!streetName.trim()) {
      alert("Enter a street name");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/streets/${selectedStreet}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            street_name: streetName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchStreets(selectedRegion);

        setStreetName("");
        setStreetMode(null);

        alert(data.message);
      } else {
        alert(data.message || "Failed to update street");
      }
    } catch (error) {
      console.error("Error updating street:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h1>Areas</h1>

      {/* ================= REGION ================= */}

      <div style={{ marginBottom: "40px" }}>
        <h3>Region</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            style={{ flex: 1, padding: "10px" }}
          >
            <option value="">Select Region</option>

            {regions.map((region) => (
              <option
                key={region.region_id}
                value={region.region_id}
              >
                {region.region_name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setRegionName("");
              setRegionMode("add");
            }}
          >
            + Add
          </button>

          <button onClick={startEditRegion}>
            Edit
          </button>
        </div>

        {regionMode && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={regionName}
              placeholder="Region name"
              onChange={(e) => setRegionName(e.target.value)}
              style={{ flex: 1, padding: "10px" }}
            />

            <button
              onClick={
                regionMode === "add"
                  ? handleAddRegion
                  : handleUpdateRegion
              }
            >
              {regionMode === "add" ? "Add" : "Update"}
            </button>

            <button
              onClick={() => {
                setRegionMode(null);
                setRegionName("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ================= STREET ================= */}

      <div>
        <h3>Street</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={selectedStreet}
            onChange={handleStreetChange}
            disabled={!selectedRegion}
            style={{ flex: 1, padding: "10px" }}
          >
            <option value="">
              {selectedRegion
                ? "Select Street"
                : "Select a region first"}
            </option>

            {streets.map((street) => (
              <option
                key={street.street_id}
                value={street.street_id}
              >
                {street.street_name}
              </option>
            ))}
          </select>

          <button
            disabled={!selectedRegion}
            onClick={() => {
              setStreetName("");
              setStreetMode("add");
            }}
          >
            + Add
          </button>

          <button
            disabled={!selectedStreet}
            onClick={startEditStreet}
          >
            Edit
          </button>
        </div>

        {streetMode && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={streetName}
              placeholder="Street name"
              onChange={(e) => setStreetName(e.target.value)}
              style={{ flex: 1, padding: "10px" }}
            />

            <button
              onClick={
                streetMode === "add"
                  ? handleAddStreet
                  : handleUpdateStreet
              }
            >
              {streetMode === "add" ? "Add" : "Update"}
            </button>

            <button
              onClick={() => {
                setStreetMode(null);
                setStreetName("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Areas;