const express = require("express");

const router = express.Router();

const {
    getAllStreets,
    getStreetsByRegion,
    addStreet,
    updateStreet
} = require("../controllers/streetController");


// Get all streets
router.get("/", getAllStreets);


// Get streets in a region
router.get("/region/:regionId", getStreetsByRegion);


// Add street to a region
router.post("/region/:regionId", addStreet);


// Update street
router.put("/:id", updateStreet);


module.exports = router;