const db = require("../config/db");


// 1. Add new house
const addHouse = async (req, res) => {
    try {
        const {
            owner_id,
            region_id,
            street_id,
            no_of_bedrooms,
            property_category,
            rental_type,
            rent_advance_amount,
            rent_amount,
            bokkiyam_amount,
            car_parking,
            tenant_preference,
            is_available,
            other_preferences,
            image_link
        } = req.body;

        // Basic validation
        if (
            !owner_id ||
            !region_id ||
            !street_id ||
            !property_category ||
            !rental_type
        ) {
            return res.status(400).json({
                message: "Required house details are missing"
            });
        }

        // Check whether the street belongs to the selected region
        const [street] = await db.query(
            `SELECT street_id
             FROM streets
             WHERE street_id = ?
             AND region_id = ?`,
            [street_id, region_id]
        );

        if (street.length === 0) {
            return res.status(400).json({
                message: "Selected street does not belong to this region"
            });
        }

        const [result] = await db.query(
            `INSERT INTO houses (
                owner_id,
                region_id,
                street_id,
                no_of_bedrooms,
                property_category,
                rental_type,
                rent_advance_amount,
                rent_amount,
                bokkiyam_amount,
                car_parking,
                tenant_preference,
                is_available,
                other_preferences,
                image_link
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                owner_id,
                region_id,
                street_id,
                no_of_bedrooms,
                property_category,
                rental_type,
                rent_advance_amount,
                rent_amount,
                bokkiyam_amount,
                car_parking,
                tenant_preference || "ANY",
                is_available ?? true,
                other_preferences,
                image_link
            ]
        );

        res.status(201).json({
            message: "House added successfully",
            house_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error adding house"
        });
    }
};


// 2. Get all houses
const getAllHouses = async (req, res) => {
    try {
        const [houses] = await db.query(`
            SELECT
                h.*,
                o.owner_name,
                o.phone_number,
                o.other_phone_number,
                r.region_name,
                s.street_name
            FROM houses h
            JOIN owners o
                ON h.owner_id = o.owner_id
            JOIN regions r
                ON h.region_id = r.region_id
            JOIN streets s
                ON h.street_id = s.street_id
            ORDER BY h.house_id DESC
        `);

        res.status(200).json(houses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching houses"
        });
    }
};


// 3. Get house details by ID
const getHouseById = async (req, res) => {
    try {
        const { id } = req.params;

        const [houses] = await db.query(
            `SELECT
                h.*,
                o.owner_name,
                o.phone_number,
                o.other_phone_number,
                r.region_name,
                s.street_name
             FROM houses h
             JOIN owners o
                ON h.owner_id = o.owner_id
             JOIN regions r
                ON h.region_id = r.region_id
             JOIN streets s
                ON h.street_id = s.street_id
             WHERE h.house_id = ?`,
            [id]
        );

        if (houses.length === 0) {
            return res.status(404).json({
                message: "House not found"
            });
        }

        res.status(200).json(houses[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching house"
        });
    }
};


// 4. Update house by ID
const updateHouse = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            region_id,
            street_id,
            no_of_bedrooms,
            property_category,
            rental_type,
            rent_advance_amount,
            rent_amount,
            bokkiyam_amount,
            car_parking,
            tenant_preference,
            is_available,
            other_preferences,
            image_link
        } = req.body;

        // Check house exists
        const [existingHouse] = await db.query(
            `SELECT * FROM houses WHERE house_id = ?`,
            [id]
        );

        if (existingHouse.length === 0) {
            return res.status(404).json({
                message: "House not found"
            });
        }

        // If region/street are being updated, validate them
        if (region_id && street_id) {
            const [street] = await db.query(
                `SELECT street_id
                 FROM streets
                 WHERE street_id = ?
                 AND region_id = ?`,
                [street_id, region_id]
            );

            if (street.length === 0) {
                return res.status(400).json({
                    message: "Street does not belong to selected region"
                });
            }
        }

        await db.query(
            `UPDATE houses
             SET
                region_id = ?,
                street_id = ?,
                no_of_bedrooms = ?,
                property_category = ?,
                rental_type = ?,
                rent_advance_amount = ?,
                rent_amount = ?,
                bokkiyam_amount = ?,
                car_parking = ?,
                tenant_preference = ?,
                is_available = ?,
                other_preferences = ?,
                image_link = ?
             WHERE house_id = ?`,
            [
                region_id,
                street_id,
                no_of_bedrooms,
                property_category,
                rental_type,
                rent_advance_amount,
                rent_amount,
                bokkiyam_amount,
                car_parking,
                tenant_preference,
                is_available,
                other_preferences,
                image_link,
                id
            ]
        );

        res.status(200).json({
            message: "House updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error updating house"
        });
    }
};


// 5. Delete house
const deleteHouse = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `DELETE FROM houses
             WHERE house_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "House not found"
            });
        }

        res.status(200).json({
            message: "House deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting house"
        });
    }
};


// 6. Get all houses in a region
const getHousesByRegion = async (req, res) => {
    try {
        const { regionId } = req.params;

        const [houses] = await db.query(
            `SELECT
                h.*,
                o.owner_name,
                o.phone_number,
                r.region_name,
                s.street_name
             FROM houses h
             JOIN owners o
                ON h.owner_id = o.owner_id
             JOIN regions r
                ON h.region_id = r.region_id
             JOIN streets s
                ON h.street_id = s.street_id
             WHERE h.region_id = ?
             ORDER BY h.house_id DESC`,
            [regionId]
        );

        res.status(200).json(houses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching houses"
        });
    }
};


// 7. Get all houses by owner
const getHousesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        const [houses] = await db.query(
            `SELECT
                h.*,
                o.owner_name,
                o.phone_number,
                r.region_name,
                s.street_name
             FROM houses h
             JOIN owners o
                ON h.owner_id = o.owner_id
             JOIN regions r
                ON h.region_id = r.region_id
             JOIN streets s
                ON h.street_id = s.street_id
             WHERE h.owner_id = ?
             ORDER BY h.house_id DESC`,
            [ownerId]
        );

        res.status(200).json(houses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching owner's houses"
        });
    }
};


// 8. Get suitable customers for house
const getSuitableCustomersForHouse = async (req, res) => {
    try {
        const { houseId } = req.params;
        console.log("House ID:", houseId);
        // Check whether house exists
        const [houses] = await db.query(
            `SELECT house_id
             FROM houses
             WHERE house_id = ?`,
            [houseId]
        );

        if (houses.length === 0) {
            return res.status(404).json({
                message: "House not found"
            });
        }

        const [customers] = await db.query(
            `
            SELECT DISTINCT
                c.customer_id,
                c.customer_name,
                c.customer_type,
                c.no_of_persons,
                c.phone_number,
                c.job,
                c.salary,
                c.preferred_rental_type,
                c.preferred_rent_price,
                c.preferred_bokkiyam_amount,
                c.other_preferences

            FROM houses h

            JOIN customers c
                ON (
                    -- No preferred regions = ANY region
                    NOT EXISTS (
                        SELECT 1
                        FROM customer_preferred_regions cpr
                        WHERE cpr.customer_id = c.customer_id
                    )

                    OR

                    -- House region matches customer's preferred region
                    EXISTS (
                        SELECT 1
                        FROM customer_preferred_regions cpr
                        WHERE cpr.customer_id = c.customer_id
                        AND cpr.region_id = h.region_id
                    )
                )

            WHERE h.house_id = ?
              AND h.is_available = TRUE

              AND (
                    -- RENT matching
                    (
                        h.rental_type IN ('RENT', 'ANY')
                        AND c.preferred_rental_type IN ('RENT', 'ANY')
                        AND h.rent_amount <= c.preferred_rent_price
                    )

                    OR

                    -- BOKKIYAM matching
                    (
                        h.rental_type IN ('BOKKIYAM', 'ANY')
                        AND c.preferred_rental_type IN ('BOKKIYAM', 'ANY')
                        AND h.bokkiyam_amount <= c.preferred_bokkiyam_amount
                    )
                )
            `,
            [houseId]
        );

        res.status(200).json(customers);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error finding suitable customers"
        });
    }
};
//update only one column
const updateHouseColumn = async (req, res) => {
    try {
        const { id } = req.params;
        const { column, value } = req.body;

        // Allowed columns
        const allowedColumns = [
            "no_of_bedrooms",
            "property_category",
            "rental_type",
            "rent_advance_amount",
            "rent_amount",
            "bokkiyam_amount",
            "car_parking",
            "tenant_preference",
            "is_available",
            "other_preferences",
            "image_link"
        ];

        // Check column is valid
        if (!allowedColumns.includes(column)) {
            return res.status(400).json({
                message: "Invalid column name"
            });
        }

        const [result] = await db.query(
            `UPDATE houses
             SET ${column} = ?
             WHERE house_id = ?`,
            [value, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "House not found"
            });
        }

        res.status(200).json({
            message: `${column} updated successfully`
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error updating house"
        });
    }
};
module.exports = {
    addHouse,
    getAllHouses,
    getHouseById,
    updateHouse,
    deleteHouse,
    getHousesByRegion,
    getHousesByOwner,
    getSuitableCustomersForHouse,
    updateHouseColumn,
    
};