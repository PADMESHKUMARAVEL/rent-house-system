const express = require("express");

const router = express.Router();

const {
    getRegions,
    getRegionById,
    addRegion,
    updateRegion,
    deleteRegion
} = require("../controllers/regioncontroller");

router.get("/", getRegions);

router.get("/:rid", getRegionById);

router.post("/", addRegion);

router.put("/:rid", updateRegion);

router.delete("/:rid", deleteRegion);

module.exports = router;