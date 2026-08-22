const express = require("express");
const router = express.Router();

const {
    addHouse,
    getAllHouses,
    getHouseById,
    updateHouse,
    deleteHouse,
    getHousesByRegion,
    getHousesByOwner,
    updateHouseColumn,
    getSuitableHousesForCustomer
} = require("../controllers/houseController");


// Add house
router.post("/", addHouse);

// Get all houses
router.get("/", getAllHouses);

// Get houses in a region
router.get("/region/:regionId", getHousesByRegion);

// Get houses by owner
router.get("/owner/:ownerId", getHousesByOwner);

// Get suitable houses for customer
router.get("/customer/:customerId", getSuitableHousesForCustomer);

// Get house by ID
router.get("/:id", getHouseById);

// Update house
router.put("/:id", updateHouse);

// Delete house
router.delete("/:id", deleteHouse);
//update only one column
router.patch("/:id", updateHouseColumn);

module.exports = router;