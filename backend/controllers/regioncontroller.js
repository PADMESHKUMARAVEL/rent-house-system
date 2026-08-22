const db = require("../config/db");

// GET all regions
const getRegions = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM regions"
        );

        res.json(rows);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Fetching regions failed",
            error: err.message
        });
    }
};



// GET one region
const getRegionById = async (req, res) => {
    try {
        const { rid } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM regions WHERE region_id = ?",
            [rid]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        res.json(rows[0]);

    } catch (err) {
        res.status(500).json({
            message: "Fetching region failed",
            error: err.message
        });
    }
};


// POST add region
const addRegion = async (req, res) => {
    try {
        const { region_name } = req.body;

        const [result] = await db.query(
            "INSERT INTO regions (region_name) VALUES (?)",
            [region_name]
        );

        res.status(201).json({
            message: "Region added successfully",
            rid: result.insertId
        });

    } catch (err) {
        res.status(500).json({
            message: "Adding region failed",
            error: err.message
        });
    }
};


// PUT update region
const updateRegion = async (req, res) => {
    try {
        const { rid } = req.params;
        const { region_name } = req.body;

        const [result] = await db.query(
            "UPDATE regions SET region_name = ? WHERE region_id = ?",
            [region_name, rid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        res.json({
            message: "Region updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Updating region failed",
            error: err.message
        });
    }
};


// DELETE region
const deleteRegion = async (req, res) => {
    try {
        const { rid } = req.params;

        const [result] = await db.query(
            "DELETE FROM regions WHERE region_id = ?",
            [rid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        res.json({
            message: "Region deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Deleting region failed",
            error: err.message
        });
    }
};


module.exports = {
    getRegions,
    getRegionById,
    addRegion,
    updateRegion,
    deleteRegion
};