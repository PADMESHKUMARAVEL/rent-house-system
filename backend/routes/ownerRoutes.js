const express = require("express");
const router = express.Router();

const {
    addOwner,
    getAllOwners,
    getHousesByOwner,
    getSuitableCustomers,
    updateOwner,
    deleteOwner,
     getOwnerByPhone
} = require("../controllers/ownerController");

//add owner
router.post("/", addOwner);
// Get all owners
router.get("/", getAllOwners);

// Get all houses for owner
router.get("/:id/houses", getHousesByOwner);

// Get suitable customers for owner's houses
router.get("/:id/customers", getSuitableCustomers);

router.put("/:id", updateOwner);

router.delete("/:id", deleteOwner);
router.get("/phone/:phoneNumber", getOwnerByPhone);
module.exports = router;