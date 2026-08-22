import { useState ,useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
const API_URL=import.meta.env.VITE_FRONTEND_API_URL;
function HouseForm() {
  const location = useLocation();
  const navigate = useNavigate();
const [regions, setRegions] = useState([]);
const [streets, setStreets] = useState([]);
const existingHouse = location.state?.house || null;
const [selectedRegion, setSelectedRegion] = useState(
  existingHouse?.region_id || ""
);

const [selectedStreet, setSelectedStreet] = useState(
  existingHouse?.street_id || ""
);

const [ownerPhone, setOwnerPhone] = useState(
  existingHouse?.phone_number || ""
);

const [existingOwner, setExistingOwner] = useState(null);
const [ownerFound, setOwnerFound] = useState(false);

const [newOwner, setNewOwner] = useState({
  owner_name: "",
  phone_number: existingHouse?.phone_number || "",
  other_phone_number: "",
});
useEffect(() => {
  const fetchRegions = async () => {
    try {
      const response = await fetch(`${API_URL}/regions`);
      const data = await response.json();

      setRegions(data);
    } catch (error) {
      console.error("Error loading regions:", error);
    }
  };

  fetchRegions();
}, []);
useEffect(() => {
  if (!selectedRegion) {
    return;
  }
  const fetchStreets = async () => {
    try {
      const response = await fetch(
        `${API_URL}/streets/region/${selectedRegion}`
      );

      const data = await response.json();

      setStreets(data);
    } catch (error) {
      console.error("Error loading streets:", error);
    }
  };

  fetchStreets();
}, [selectedRegion]);

const handleSubmit = async () => {
  try {
    let ownerId = formData.owner_id;

    // Check whether an existing owner was found
    if (ownerFound && existingOwner) {
      ownerId = existingOwner.owner_id;
    }

    // New owner
    else {
      if (!newOwner.owner_name || !ownerPhone) {
        alert("Please enter owner details");
        return;
      }

      const ownerResponse = await fetch(`${API_URL}/owners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner_name: newOwner.owner_name,
          phone_number: ownerPhone,
          other_phone_number: newOwner.other_phone_number || null,
        }),
      });

      const ownerData = await ownerResponse.json();

      if (!ownerResponse.ok) {
        throw new Error(
          ownerData.message || "Failed to add owner"
        );
      }

      // Assuming backend returns the inserted owner_id
      ownerId = ownerData.owner_id;
    }

    // Final house data
   const houseData = {
  ...formData,
  owner_id: ownerId,
  region_id: selectedRegion,
  street_id: selectedStreet,

  rent_advance_amount:
    formData.rent_advance_amount === ""
      ? null
      : formData.rent_advance_amount,

  rent_amount:
    formData.rent_amount === ""
      ? null
      : formData.rent_amount,

  bokkiyam_amount:
    formData.bokkiyam_amount === ""
      ? null
      : formData.bokkiyam_amount,
};
    const isEdit = existingHouse !== null;

    const url = isEdit
      ? `${API_URL}/houses/${existingHouse.house_id}`
      : `${API_URL}/houses`;

    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(houseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          (isEdit
            ? "Failed to update house"
            : "Failed to add house")
      );
    }

    alert(
      isEdit
        ? "House updated successfully"
        : "House added successfully"
    );

    navigate("/houses/list");

  } catch (error) {
    console.error("Error:", error);
    alert(error.message);
  }
};
const handleOwnerPhoneChange = async (e) => {
  const phone = e.target.value;

  setOwnerPhone(phone);

  setNewOwner((prev) => ({
    ...prev,
    phone_number: phone,
  }));

  if (phone.length !== 10) {
    setExistingOwner(null);
    setOwnerFound(false);
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/owners/phone/${phone}`
    );

    if (response.ok) {
      const data = await response.json();

      setExistingOwner(data);
      setOwnerFound(true);

      setFormData((prev) => ({
        ...prev,
        owner_id: data.owner_id,
      }));
    } else {
      setExistingOwner(null);
      setOwnerFound(false);

      setFormData((prev) => ({
        ...prev,
        owner_id: "",
      }));
    }
  } catch (error) {
    console.error("Error checking owner:", error);
  }
};

  // Will be null when coming from Add House
  // Will contain existing house details when coming from Edit
 // const existingHouse = location.state?.house || null;
  
  const [formData, setFormData] = useState(
    existingHouse || {
      owner_id: "",
      region_id: "",
      street_id: "",
      no_of_bedrooms: "",
      property_category: "NORMAL",
      rental_type: "RENT",
      rent_advance_amount: "",
      rent_amount: "",
      bokkiyam_amount: "",
      car_parking: 0,
      tenant_preference: "ANY",
      is_available: 1,
      other_preferences: "",
      image_link: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRentalTypeChange = (e) => {
    const rentalType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      rental_type: rentalType,

      // Clear fields that are not applicable
      rent_amount:
        rentalType === "BOKKIYAM" ? "" : prev.rent_amount,

      bokkiyam_amount:
        rentalType === "RENT" ? "" : prev.bokkiyam_amount,
    }));
  };

  return (
    <div>
      <h1>
        {existingHouse ? "Edit House" : "Add House"}
      </h1>

      {/* REGION - API logic will be added next */}

      <label>Region</label>

<select
  value={selectedRegion}
  onChange={(e) => {
    const regionId = e.target.value;

    setSelectedRegion(regionId);
    setSelectedStreet("");
    setStreets([]);

    setFormData((prev) => ({
      ...prev,
      region_id: regionId,
      street_id: "",
    }));
  }}
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

      {/* STREET */}

      <label>Street</label>

<select
  value={selectedStreet}
  disabled={!selectedRegion}
  onChange={(e) => {
    const streetId = e.target.value;

    setSelectedStreet(streetId);

    setFormData((prev) => ({
      ...prev,
      street_id: streetId,
    }));
  }}
>
  <option value="">Select Street</option>

  {streets.map((street) => (
    <option
      key={street.street_id}
      value={street.street_id}
    >
      {street.street_name}
    </option>
  ))}
</select>

      {/* OWNER */}

     <h3>Owner Details</h3>

<label>Owner Phone Number</label>

<input
  type="text"
  value={ownerPhone}
  onChange={handleOwnerPhoneChange}
  placeholder="Enter owner phone number"
/>
{ownerFound && existingOwner && (
  <div>
    <h4>Existing Owner Found</h4>

    <p>
      <strong>Name:</strong>{" "}
      {existingOwner.owner_name}
    </p>

    <p>
      <strong>Phone:</strong>{" "}
      {existingOwner.phone_number}
    </p>

    <p>
      <strong>Other Phone:</strong>{" "}
      {existingOwner.other_phone_number || "-"}
    </p>
  </div>
)}
{ownerPhone.length === 10 && !ownerFound && (
  <div>
    <h4>New Owner</h4>

    <label>Owner Name</label>

    <input
      type="text"
      value={newOwner.owner_name}
      onChange={(e) =>
        setNewOwner((prev) => ({
          ...prev,
          owner_name: e.target.value,
        }))
      }
    />

    <br />
    <br />

    <label>Other Phone Number</label>

    <input
      type="text"
      value={newOwner.other_phone_number}
      onChange={(e) =>
        setNewOwner((prev) => ({
          ...prev,
          other_phone_number: e.target.value,
        }))
      }
    />
  </div>
)}
      {/* BEDROOMS */}

      <label>Number of Bedrooms</label>

      <select
        name="no_of_bedrooms"
        value={formData.no_of_bedrooms ?? ""}
        onChange={handleChange}
      >
        <option value="">Select</option>
        <option value="1">1 Bedroom</option>
        <option value="2">2 Bedrooms</option>
        <option value="3">3 Bedrooms</option>
        <option value="4">4+ Bedrooms</option>
      </select>

      <br />
      <br />

      {/* PROPERTY CATEGORY */}

      <label>Property Type</label>

      <select
        name="property_category"
        value={formData.property_category}
        onChange={handleChange}
      >
        <option value="NORMAL">Normal</option>
        <option value="COMMERCIAL">Commercial</option>
      </select>

      <br />
      <br />

      {/* RENTAL TYPE */}

      <label>Rental Type</label>

      <select
        name="rental_type"
        value={formData.rental_type}
        onChange={handleRentalTypeChange}
      >
        <option value="RENT">Rent</option>
        <option value="BOKKIYAM">Bokkiyam</option>
        <option value="ANY">Any</option>
      </select>

      <br />
      <br />

      {/* ADVANCE - ALWAYS SHOWN */}

      <label>Advance Amount</label>

      <input
        type="number"
        name="rent_advance_amount"
        value={formData.rent_advance_amount ?? ""}
        onChange={handleChange}
      />

      <br />
      <br />

      {/* RENT - NOT SHOWN FOR BOKKIYAM */}

      {formData.rental_type !== "BOKKIYAM" && (
        <>
          <label>Rent Amount</label>

          <input
            type="number"
            name="rent_amount"
            value={formData.rent_amount ?? ""}
            onChange={handleChange}
          />

          <br />
          <br />
        </>
      )}

      {/* BOKKIYAM - NOT SHOWN FOR RENT */}

      {formData.rental_type !== "RENT" && (
        <>
          <label>Bokkiyam Amount</label>

          <input
            type="number"
            name="bokkiyam_amount"
            value={formData.bokkiyam_amount ?? ""}
            onChange={handleChange}
          />

          <br />
          <br />
        </>
      )}

      {/* CAR PARKING */}

      <label>Car Parking</label>

      <select
        name="car_parking"
        value={formData.car_parking}
        onChange={handleChange}
      >
        <option value="1">Yes</option>
        <option value="0">No</option>
      </select>

      <br />
      <br />

      {/* TENANT PREFERENCE */}

      <label>Tenant Preference</label>

      <select
        name="tenant_preference"
        value={formData.tenant_preference}
        onChange={handleChange}
      >
        <option value="ANY">Any</option>
        <option value="FAMILY">Family</option>
        <option value="BACHELOR">Bachelor</option>
      </select>

      <br />
      <br />

      {/* AVAILABILITY */}

      <label>Availability</label>

      <select
        name="is_available"
        value={formData.is_available}
        onChange={handleChange}
      >
        <option value="1">Available</option>
        <option value="0">Not Available</option>
      </select>

      <br />
      <br />

      {/* OTHER PREFERENCES */}

      <label>Other Preferences</label>

      <textarea
        name="other_preferences"
        value={formData.other_preferences ?? ""}
        onChange={handleChange}
      />

      <br />
      <br />

      {/* IMAGE */}

      <label>Image Link</label>

      <input
        type="text"
        name="image_link"
        value={formData.image_link ?? ""}
        onChange={handleChange}
      />

      <br />
      <br />

     <button type="button" onClick={handleSubmit}>
  {existingHouse ? "Update House" : "Add House"}
</button>

      <button
        type="button"
        onClick={() => navigate(-1)}
      >
        Cancel
      </button>
    </div>
  );
}

export default HouseForm;