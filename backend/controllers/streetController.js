const db = require("../config/db");

// 1. Get all streets
const getAllStreets = async (req, res) => {
    try {
        const [streets] = await db.query(`
            SELECT 
                s.street_id,
                s.street_name,
                r.region_id,
                r.region_name
            FROM streets s
            JOIN regions r 
                ON s.region_id = r.region_id
            ORDER BY r.region_name, s.street_name
        `);

        res.status(200).json(streets);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching streets"
        });
    }
};


// 2. Get all streets in a specific region
const getStreetsByRegion = async (req, res) => {
    try {
        const { regionId } = req.params;

        const [streets] = await db.query(
            `SELECT street_id, street_name
             FROM streets
             WHERE region_id = ?
             ORDER BY street_name`,
            [regionId]
        );

        res.status(200).json(streets);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching streets"
        });
    }
};


// 3. Add a new street to a region
const addStreet = async (req, res) => {
    try {
        const { regionId } = req.params;
        const { street_name } = req.body;

        if (!street_name) {
            return res.status(400).json({
                message: "Street name is required"
            });
        }

        // Check whether region exists
        const [regions] = await db.query(
            `SELECT region_id 
             FROM regions 
             WHERE region_id = ?`,
            [regionId]
        );

        if (regions.length === 0) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        const [result] = await db.query(
            `INSERT INTO streets (street_name, region_id)
             VALUES (?, ?)`,
            [street_name, regionId]
        );

        res.status(201).json({
            message: "Street added successfully",
            street_id: result.insertId
        });

    } catch (error) {

        // Duplicate street in same region
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Street already exists in this region"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error adding street"
        });
    }
};


// 4. Update street
const updateStreet = async (req, res) => {
    try {
        const { id } = req.params;
        const { street_name } = req.body;

        if (!street_name) {
            return res.status(400).json({
                message: "Street name is required"
            });
        }

        const [result] = await db.query(
            `UPDATE streets
             SET street_name = ?
             WHERE street_id = ?`,
            [street_name, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Street not found"
            });
        }

        res.status(200).json({
            message: "Street updated successfully"
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Another street with this name already exists in the region"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error updating street"
        });
    }
};


module.exports = {
    getAllStreets,
    getStreetsByRegion,
    addStreet,
    updateStreet
};