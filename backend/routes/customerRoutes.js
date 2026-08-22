const express = require("express");
const router = express.Router();

const {
    addCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getSuitableHouses
} = require("../controllers/customerController");


// Add customer
router.post("/", addCustomer);

// Get all customers
router.get("/", getAllCustomers);

// Get suitable houses for a customer
// Must come BEFORE "/:id"
router.get("/:id/suitable-houses", getSuitableHouses);

// Get customer by ID
router.get("/:id", getCustomerById);

// Update customer
router.put("/:id", updateCustomer);

// Delete customer
router.delete("/:id", deleteCustomer);


module.exports = router;