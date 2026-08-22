import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_FRONTEND_API_URL;

function OwnerList() {
  const [owners, setOwners] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [formData, setFormData] = useState({
    owner_name: "",
    phone_number: "",
    other_phone_number: "",
  });

  // Get all owners
  const fetchOwners = async () => {
    try {
      const response = await fetch(`${API_URL}/owners`);
      const data = await response.json();

      if (response.ok) {
        setOwners(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Open Add Owner popup
  const handleAdd = () => {
    setEditingOwner(null);

    setFormData({
      owner_name: "",
      phone_number: "",
      other_phone_number: "",
    });

    setShowModal(true);
  };

  // Open Edit Owner popup
  const handleEdit = (owner) => {
    setEditingOwner(owner);

    setFormData({
      owner_name: owner.owner_name || "",
      phone_number: owner.phone_number || "",
      other_phone_number: owner.other_phone_number || "",
    });

    setShowModal(true);
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add or Update Owner
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = `${API_URL}/owners`;
      let method = "POST";

      if (editingOwner) {
        url = `${API_URL}/owners/${editingOwner.owner_id}`;
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

        setShowModal(false);
        fetchOwners();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving owner:", error);
      alert("Error saving owner");
    }
  };

  // Delete Owner
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this owner?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/owners/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchOwners();
      } else {
        alert(data.message || "Failed to delete owner");
      }
    } catch (error) {
      console.error("Error deleting owner:", error);
      alert("Error deleting owner");
    }
  };

  // Close popup
  const handleClose = () => {
    setShowModal(false);
    setEditingOwner(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>All Owners</h1>

        <button onClick={handleAdd}>
          + Add Owner
        </button>
      </div>

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
            <th>ID</th>
            <th>Owner Name</th>
            <th>Phone Number</th>
            <th>Other Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {owners.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No owners found
              </td>
            </tr>
          ) : (
            owners.map((owner) => (
              <tr key={owner.owner_id}>
                <td>{owner.owner_id}</td>
                <td>{owner.owner_name}</td>
                <td>{owner.phone_number}</td>
                <td>{owner.other_phone_number || "-"}</td>

                <td>
                  <button
                    onClick={() => handleEdit(owner)}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(owner.owner_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h2>
              {editingOwner ? "Edit Owner" : "Add Owner"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label>Owner Name</label>

                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Phone Number</label>

                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>Other Phone Number</label>

                <input
                  type="text"
                  name="other_phone_number"
                  value={formData.other_phone_number}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                >
                  Cancel
                </button>

                <button type="submit">
                  {editingOwner ? "Update Owner" : "Add Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerList;