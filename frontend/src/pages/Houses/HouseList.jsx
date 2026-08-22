import { useEffect, useState } from "react";

const API_URL = import.meta.env.FRONTEND_API_URL;

function HouseList() {
  const [houses, setHouses] = useState([]);
  const [regions, setRegions] = useState([]);
  const [streets, setStreets] = useState([]);

  const [region, setRegion] = useState("");
  const [street, setStreet] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [category, setCategory] = useState("");
  const [rentalType, setRentalType] = useState("");

 
  const fetchHouses = async () => {
    try {
      const response = await fetch(`${API_URL}/houses`);
      const data = await response.json();

      setHouses(data);
    } catch (error) {
      console.error("Error fetching houses:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await fetch(`${API_URL}/regions`);
      const data = await response.json();

      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchHouses(), fetchRegions()]);
    };

    loadInitialData();
  }, []);
  const handleRegionChange = async (e) => {
    const selectedRegion = e.target.value;

    setRegion(selectedRegion);
    setStreet("");
    setStreets([]);

    if (selectedRegion !== "") {
      try {
        const response = await fetch(
          `${API_URL}/streets/region/${selectedRegion}`
        );

        const data = await response.json();

        setStreets(data);
      } catch (error) {
        console.error("Error fetching streets:", error);
      }
    }
  };

  const filteredHouses = houses.filter((house) => {
    if (
      region !== "" &&
      house.region_id !== Number(region)
    ) {
      return false;
    }

    if (
      street !== "" &&
      house.street_id !== Number(street)
    ) {
      return false;
    }

    if (bedrooms !== "") {
      if (
        bedrooms === "4+" &&
        house.no_of_bedrooms < 4
      ) {
        return false;
      }

      if (
        bedrooms !== "4+" &&
        house.no_of_bedrooms !== Number(bedrooms)
      ) {
        return false;
      }
    }

    if (
      category !== "" &&
      house.property_category !== category
    ) {
      return false;
    }

    if (
      rentalType !== "" &&
      house.rental_type !== rentalType
    ) {
      return false;
    }

    return true;
  });

  const getAmount = (house) => {
    if (house.rental_type === "RENT") {
      return `₹${house.rent_amount}`;
    }

    if (house.rental_type === "BOKKIYAM") {
      return `₹${house.bokkiyam_amount}`;
    }

    if (house.rental_type === "ANY") {
      return `Rent: ₹${house.rent_amount || "-"} | Bokkiyam: ₹${
        house.bokkiyam_amount || "-"
      }`;
    }

    return "-";
  };

  const clearFilters = () => {
    setRegion("");
    setStreet("");
    setBedrooms("");
    setCategory("");
    setRentalType("");
    setStreets([]);
  };

  return (
    <div>
      <h1>Houses</h1>

      {/* Filters */}
      <div>
        <select
          value={region}
          onChange={handleRegionChange}
        >
          <option value="">All Regions</option>

          {regions.map((region) => (
            <option
              key={region.region_id}
              value={region.region_id}
            >
              {region.region_name}
            </option>
          ))}
        </select>

        <select
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          disabled={region === ""}
        >
          <option value="">All Streets</option>

          {streets.map((street) => (
            <option
              key={street.street_id}
              value={street.street_id}
            >
              {street.street_name}
            </option>
          ))}
        </select>

        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
        >
          <option value="">All Bedrooms</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4+">4+ Bedrooms</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="NORMAL">Normal</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>

        <select
          value={rentalType}
          onChange={(e) => setRentalType(e.target.value)}
        >
          <option value="">Rent / Bokkiyam</option>
          <option value="RENT">Rent</option>
          <option value="BOKKIYAM">Bokkiyam</option>
          <option value="ANY">Any</option>
        </select>

        <button onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <br />

      {/* Houses Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Street</th>
            <th>Region</th>
            <th>Bedrooms</th>
            <th>Type</th>
            <th>Rent / Bokkiyam</th>
            <th>Rent</th>
          </tr>
        </thead>

        <tbody>
          {filteredHouses.length > 0 ? (
            filteredHouses.map((house) => (
              <tr key={house.house_id}>
                <td>{house.street_name}</td>

                <td>{house.region_name}</td>

                <td>{house.no_of_bedrooms ?? "-"}</td>

                <td>{house.property_category}</td>

                <td>{house.rental_type}</td>

                <td>{getAmount(house)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">
                No houses found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HouseList;