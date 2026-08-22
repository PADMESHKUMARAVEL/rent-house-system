import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_FRONTEND_API_URL;

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [regions, setRegions] = useState([]);
const [suitableHouses, setSuitableHouses] = useState([]);
const [showSuitableHouses, setShowSuitableHouses] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [filters, setFilters] = useState({
    rent: "",
    type: "",
    occupation: "",
    members: "",
  });

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_type: "FAMILY",
    no_of_persons: "",
    phone_number: "",
    job: "",
    salary: "",
    preferred_rental_type: "ANY",
    preferred_rent_price: "",
    preferred_bokkiyam_amount: "",
    other_preferences: "",
    preferred_region_ids: [],
  });

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      const data = await response.json();

      if (response.ok) {
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
  const loadData = async () => {
    try {
      const [customersResponse, regionsResponse] = await Promise.all([
        fetch(`${API_URL}/customers`),
        fetch(`${API_URL}/regions`),
      ]);

      const customersData = await customersResponse.json();
      const regionsData = await regionsResponse.json();

      if (customersResponse.ok) {
        setCustomers(customersData);
      }

      if (regionsResponse.ok) {
        setRegions(regionsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  loadData();
}, []);

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAddCustomer = () => {
    setEditingCustomer(null);

    setFormData({
      customer_name: "",
      customer_type: "FAMILY",
      no_of_persons: "",
      phone_number: "",
      job: "",
      salary: "",
      preferred_rental_type: "ANY",
      preferred_rent_price: "",
      preferred_bokkiyam_amount: "",
      other_preferences: "",
      preferred_region_ids: [],
    });

    setShowForm(true);
  };

  // =========================
  // VIEW CUSTOMER DETAILS
  // =========================

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/customers/${id}`);
      const data = await response.json();

      if (response.ok) {
        setCustomerDetails(data);
      } else {
        alert(data.message || "Failed to fetch customer details");
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================

  const handleEdit = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      customer_name: customer.customer_name || "",
      customer_type: customer.customer_type || "FAMILY",
      no_of_persons: customer.no_of_persons || "",
      phone_number: customer.phone_number || "",
      job: customer.job || "",
      salary: customer.salary || "",
      preferred_rental_type:
        customer.preferred_rental_type || "ANY",
      preferred_rent_price:
        customer.preferred_rent_price || "",
      preferred_bokkiyam_amount:
        customer.preferred_bokkiyam_amount || "",
      other_preferences:
        customer.other_preferences || "",
      preferred_region_ids:
        customer.preferred_regions
          ? customer.preferred_regions.map(
              (region) => region.region_id
            )
          : [],
    });

    setCustomerDetails(null);
    setShowForm(true);
  };

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // PREFERRED REGION CHANGE
  // =========================

  const handleRegionChange = (regionId) => {
    const exists =
      formData.preferred_region_ids.includes(regionId);

    let updatedRegions;

    if (exists) {
      updatedRegions =
        formData.preferred_region_ids.filter(
          (id) => id !== regionId
        );
    } else {
      updatedRegions = [
        ...formData.preferred_region_ids,
        regionId,
      ];
    }

    setFormData({
      ...formData,
      preferred_region_ids: updatedRegions,
    });
  };

  // =========================
  // ADD / UPDATE CUSTOMER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = `${API_URL}/customers`;
      let method = "POST";

      if (editingCustomer) {
        url = `${API_URL}/customers/${editingCustomer.customer_id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        setShowForm(false);
        setEditingCustomer(null);

        fetchCustomers();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  // =========================
  // DELETE CUSTOMER
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchCustomers();
      } else {
        alert(data.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  // =========================
  // SHOW SUITABLE HOUSES
  // =========================

  const handleSuitableHouses = async () => {
  if (!customerDetails) return;

  try {
    const response = await fetch(
      `${API_URL}/customers/${customerDetails.customer_id}/suitable-houses`
    );

    const data = await response.json();

    if (response.ok) {
      setSuitableHouses(data);
      setShowSuitableHouses(true);
    } else {
      alert(data.message || "Failed to fetch suitable houses");
    }
  } catch (error) {
    console.error("Error fetching suitable houses:", error);
  }
};

  // =========================
  // FILTER CUSTOMERS
  // =========================

  const filteredCustomers = customers.filter((customer) => {
    const rentMatch =
      !filters.rent ||
      Number(customer.preferred_rent_price || 0) >=
        Number(filters.rent);

    const typeMatch =
      !filters.type ||
      customer.customer_type === filters.type;

    const occupationMatch =
      !filters.occupation ||
      customer.job
        ?.toLowerCase()
        .includes(filters.occupation.toLowerCase());

    const membersMatch =
      !filters.members ||
      Number(customer.no_of_persons) ===
        Number(filters.members);

    return (
      rentMatch &&
      typeMatch &&
      occupationMatch &&
      membersMatch
    );
  });

  return (
    <div className="customer-page" style={{ padding: "20px" }}>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h1>Customers</h1>

        <button onClick={handleAddCustomer}>
          + Add Customer
        </button>
      </div>

      {/* FILTERS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="number"
          placeholder="Preferred rent ≥"
          value={filters.rent}
          onChange={(e) =>
            setFilters({
              ...filters,
              rent: e.target.value,
            })
          }
        />

        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({
              ...filters,
              type: e.target.value,
            })
          }
        >
          <option value="">All Types</option>
          <option value="FAMILY">Family</option>
          <option value="BACHELOR">Bachelor</option>
        </select>

        <input
          type="text"
          placeholder="Occupation"
          value={filters.occupation}
          onChange={(e) =>
            setFilters({
              ...filters,
              occupation: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="No. of members"
          value={filters.members}
          onChange={(e) =>
            setFilters({
              ...filters,
              members: e.target.value,
            })
          }
        />
      </div>

      {/* CUSTOMER TABLE */}

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Preferred Rent</th>
            <th>Type</th>
             <th>Phone</th>
            <th>Occupation</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan="7" align="center">
                No customers found
              </td>
            </tr>
          ) : (
            filteredCustomers.map((customer) => (
              <tr key={customer.customer_id}>
                <td>{customer.customer_name}</td>

                <td>{customer.phone_number}</td>

                <td>
                  {customer.preferred_rent_price
                    ? `₹${customer.preferred_rent_price}`
                    : "-"}
                </td>

                <td>{customer.customer_type}</td>

                <td>{customer.job || "-"}</td>

                <td>{customer.no_of_persons}</td>

                <td>
                  <button
                    onClick={() =>
                      handleViewDetails(
                        customer.customer_id
                      )
                    }
                    style={{ marginRight: "8px" }}
                  >
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(customer.customer_id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* VIEW DETAILS MODAL */}

      {customerDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="customer-modal"
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "8px",
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2>Customer Details</h2>

            <p>
              <b>Name:</b>{" "}
              {customerDetails.customer_name}
            </p>

            <p>
              <b>Type:</b>{" "}
              {customerDetails.customer_type}
            </p>

            <p>
              <b>No. of Persons:</b>{" "}
              {customerDetails.no_of_persons}
            </p>

            <p>
              <b>Phone:</b>{" "}
              {customerDetails.phone_number}
            </p>

            <p>
              <b>Occupation:</b>{" "}
              {customerDetails.job || "-"}
            </p>

            <p>
              <b>Salary:</b>{" "}
              {customerDetails.salary
                ? `₹${customerDetails.salary}`
                : "-"}
            </p>

            <p>
              <b>Preferred Rental Type:</b>{" "}
              {customerDetails.preferred_rental_type}
            </p>

            <p>
              <b>Preferred Rent:</b>{" "}
              {customerDetails.preferred_rent_price
                ? `₹${customerDetails.preferred_rent_price}`
                : "-"}
            </p>

            <p>
              <b>Preferred Bokkiyam:</b>{" "}
              {customerDetails.preferred_bokkiyam_amount
                ? `₹${customerDetails.preferred_bokkiyam_amount}`
                : "-"}
            </p>

            <p>
              <b>Other Preferences:</b>{" "}
              {customerDetails.other_preferences || "-"}
            </p>

            <h3>Preferred Locations</h3>

            {customerDetails.preferred_regions?.length > 0 ? (
              <ul>
                {customerDetails.preferred_regions.map(
                  (region) => (
                    <li key={region.region_id}>
                      {region.region_name}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>No preferred locations</p>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button onClick={handleSuitableHouses}>
                Show Suitable Houses
              </button>

              <button
                onClick={() =>
                  handleEdit(customerDetails)
                }
              >
                Edit
              </button>

              <button
                onClick={() =>
                  setCustomerDetails(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        {showSuitableHouses && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1100,
    }}
  >
    <div className="customer-modal"
      style={{
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "8px",
        width: "800px",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <h2>Suitable Houses</h2>

      {suitableHouses.length === 0 ? (
        <p>No suitable houses found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>House</th>
              <th>Region</th>
              <th>Street</th>
              <th>Rental Type</th>
              <th>Phone</th>
              <th>Rent</th>
              <th>Bokkiyam</th>
            </tr>
          </thead>

          <tbody>
            {suitableHouses.map((house) => (
              <tr key={house.house_id}>
                <td>
                  {house.house_name ||
                    house.house_no ||
                    house.house_id}
                </td>

                <td>{house.region_name || "-"}</td>

                <td>{house.street_name || "-"}</td>

                <td>{house.rental_type || "-"}</td>
                <td>{house.phone_number || "-"}</td>
                <td>
                  {house.rent_amount
                    ? `${house.rent_amount}`
                    : "-"}
                </td>

                <td>
                  {house.bokkiyam_amount
                    ? `₹${house.bokkiyam_amount}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        style={{ marginTop: "20px" }}
        onClick={() => {
          setShowSuitableHouses(false);
          setSuitableHouses([]);
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
      {/* ADD / EDIT CUSTOMER FORM */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="customer-modal customer-form-modal"
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "8px",
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2>
              {editingCustomer
                ? "Edit Customer"
                : "Add Customer"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                name="customer_name"
                placeholder="Customer Name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />

              <br />
              <br />

              <select
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
              >
                <option value="FAMILY">Family</option>
                <option value="BACHELOR">
                  Bachelor
                </option>
              </select>

              <br />
              <br />

              <input
                type="number"
                name="no_of_persons"
                placeholder="Number of Persons"
                value={formData.no_of_persons}
                onChange={handleChange}
                required
              />

              <br />
              <br />

              <input
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />

              <br />
              <br />

              <input
                name="job"
                placeholder="Occupation"
                value={formData.job}
                onChange={handleChange}
              />

              <br />
              <br />

              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleChange}
              />

              <br />
              <br />

              <select
                name="preferred_rental_type"
                value={
                  formData.preferred_rental_type
                }
                onChange={handleChange}
              >
                <option value="ANY">Any</option>
                <option value="RENT">Rent</option>
                <option value="BOKKIYAM">
                  Bokkiyam
                </option>
              </select>

              <br />
              <br />

              <input
                type="number"
                name="preferred_rent_price"
                placeholder="Preferred Rent Price"
                value={
                  formData.preferred_rent_price
                }
                onChange={handleChange}
              />

              <br />
              <br />

              <input
                type="number"
                name="preferred_bokkiyam_amount"
                placeholder="Preferred Bokkiyam Amount"
                value={
                  formData.preferred_bokkiyam_amount
                }
                onChange={handleChange}
              />

              <br />
              <br />

              <textarea
                name="other_preferences"
                placeholder="Other Preferences"
                value={formData.other_preferences}
                onChange={handleChange}
              />

              <h3>Preferred Locations</h3>

              {regions.map((region) => (
                <div key={region.region_id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.preferred_region_ids.includes(
                        region.region_id
                      )}
                      onChange={() =>
                        handleRegionChange(
                          region.region_id
                        )
                      }
                    />

                    {" "}
                    {region.region_name}
                  </label>
                </div>
              ))}

              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button type="submit">
                  {editingCustomer
                    ? "Update Customer"
                    : "Add Customer"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCustomer(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;