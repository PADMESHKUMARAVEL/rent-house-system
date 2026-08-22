import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_FRONTEND_API_URL;
import {  useNavigate } from "react-router-dom";
function HouseDetails() {
  const { id } = useParams();

const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [showCustomers, setShowCustomers] = useState(false);

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const response = await fetch(`${API_URL}/houses/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch house details");
        }

        const data = await response.json();

        setHouse(data);
      } catch (error) {
        console.error("Error fetching house details:", error);
      }
    };

    fetchHouse();
  }, [id]);

  const handleShowCustomers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/houses/customer/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suitable customers");
      }

      const data = await response.json();

      setCustomers(data);
      setShowCustomers(true);
    } catch (error) {
      console.error("Error fetching suitable customers:", error);
    }
  };

  if (!house) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>House Details</h1>

      <p>
        <strong>Street:</strong> {house.street_name}
      </p>

      <p>
        <strong>Region:</strong> {house.region_name}
      </p>

      <p>
        <strong>Bedrooms:</strong>{" "}
        {house.no_of_bedrooms ?? "-"}
      </p>

      <p>
        <strong>Property Type:</strong>{" "}
        {house.property_category}
      </p>

      <p>
        <strong>Rental Type:</strong>{" "}
        {house.rental_type}
      </p>

      <p>
        <strong>Rent:</strong>{" "}
        ₹{house.rent_amount ?? "-"}
      </p>

      <p>
        <strong>Advance:</strong>{" "}
        ₹{house.rent_advance_amount ?? "-"}
      </p>

      <p>
        <strong>Bokkiyam:</strong>{" "}
        ₹{house.bokkiyam_amount ?? "-"}
      </p>

      <p>
        <strong>Owner:</strong>{" "}
        {house.owner_name}
      </p>

      <p>
        <strong>Phone:</strong>{" "}
        {house.phone_number}
      </p>

      <p>
        <strong>Other Phone:</strong>{" "}
        {house.other_phone_number ?? "-"}
      </p>

      <p>
        <strong>Car Parking:</strong>{" "}
        {house.car_parking ? "Yes" : "No"}
      </p>

      <p>
        <strong>Tenant Preference:</strong>{" "}
        {house.tenant_preference}
      </p>

      <p>
        <strong>Available:</strong>{" "}
        {house.is_available ? "Yes" : "No"}
      </p>

      <p>
        <strong>Other Preferences:</strong>{" "}
        {house.other_preferences ?? "-"}
      </p>

      {house.image_link && (
        <div>
          <img
            src={house.image_link}
            alt="House"
            width="300"
          />
        </div>
      )}

      <br />
      <button
  onClick={() =>
    navigate("/houses/edit", {
      state: { house: house },
    })
  }
>
  Edit House
</button>
      <button onClick={handleShowCustomers}>
        Show Suitable Customers
      </button>

      {showCustomers && (
        <div>
          <h2>Suitable Customers</h2>

          {customers.length === 0 ? (
            <p>No suitable customers found.</p>
          ) : (
            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_name}</td>

                    <td>{customer.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default HouseDetails;