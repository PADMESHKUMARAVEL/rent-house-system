const db = require("../config/db");

//add owner
const addOwner = async (req, res) => {
    try {
        const {
            owner_name,
            phone_number,
            other_phone_number
        } = req.body;

        // Validate required fields
        if (!owner_name || !phone_number) {
            return res.status(400).json({
                message: "Owner name and phone number are required"
            });
        }

        // Check whether either phone number already exists
        const [existingOwners] = await db.query(
            `SELECT owner_id
             FROM owners
             WHERE phone_number = ?
                OR other_phone_number = ?
                OR phone_number = ?
                OR other_phone_number = ?`,
            [
                phone_number,
                phone_number,
                other_phone_number || null,
                other_phone_number || null
            ]
        );

        if (existingOwners.length > 0) {
            return res.status(409).json({
                message: "Owner with this phone number already exists"
            });
        }

        // Insert owner
        const [result] = await db.query(
            `INSERT INTO owners (
                owner_name,
                phone_number,
                other_phone_number
            )
            VALUES (?, ?, ?)`,
            [
                owner_name,
                phone_number,
                other_phone_number || null
            ]
        );

        res.status(201).json({
           message: "Owner added successfully",
  owner_id: result.insertId,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error adding owner"
        });
    }
};
// 1. Get all owners
const getAllOwners = async (req, res) => {
    try {
        const [owners] = await db.query(`
            SELECT *
            FROM owners
            ORDER BY owner_id DESC
        `);

        res.status(200).json(owners);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching owners"
        });
    }
};


// 2. Get all houses for an owner
const getHousesByOwner = async (req, res) => {
    try {
        const { id } = req.params;

        // Check owner exists
        const [owners] = await db.query(
            `SELECT owner_id
             FROM owners
             WHERE owner_id = ?`,
            [id]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                message: "Owner not found"
            });
        }

        const [houses] = await db.query(
            `SELECT
                h.*,
                r.region_name,
                s.street_name
             FROM houses h
             JOIN regions r
                ON h.region_id = r.region_id
             JOIN streets s
                ON h.street_id = s.street_id
             WHERE h.owner_id = ?
             ORDER BY h.house_id DESC`,
            [id]
        );

        res.status(200).json(houses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching houses"
        });
    }
};


// 3. Get suitable customers for an owner's houses
const getSuitableCustomers = async (req, res) => {
    try {
        const { id } = req.params;

        // Check owner exists
        const [owners] = await db.query(
            `SELECT owner_id
             FROM owners
             WHERE owner_id = ?`,
            [id]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                message: "Owner not found"
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
                    -- Customer has no preferred regions = ANY region
                    NOT EXISTS (
                        SELECT 1
                        FROM customer_preferred_regions cpr
                        WHERE cpr.customer_id = c.customer_id
                    )

                    OR

                    -- House region is one of customer's preferences
                    EXISTS (
                        SELECT 1
                        FROM customer_preferred_regions cpr
                        WHERE cpr.customer_id = c.customer_id
                        AND cpr.region_id = h.region_id
                    )
                )

            WHERE h.owner_id = ?
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
            [id]
        );

        res.status(200).json(customers);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error finding suitable customers"
        });
    }
};

const updateOwner = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            owner_name,
            phone_number,
            other_phone_number
        } = req.body;

        // Check owner exists
        const [owners] = await db.query(
            `SELECT owner_id
             FROM owners
             WHERE owner_id = ?`,
            [id]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                message: "Owner not found"
            });
        }

        // Update owner
        await db.query(
            `UPDATE owners
             SET
                owner_name = ?,
                phone_number = ?,
                other_phone_number = ?
             WHERE owner_id = ?`,
            [
                owner_name,
                phone_number,
                other_phone_number ?? null,
                id
            ]
        );

        res.status(200).json({
            message: "Owner updated successfully"
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Phone number already exists"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error updating owner"
        });
    }
};
const deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `DELETE FROM owners
             WHERE owner_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Owner not found"
            });
        }

        res.status(200).json({
            message: "Owner and associated houses deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting owner"
        });
    }
};

const getOwnerByPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        const [owners] = await db.query(
            `SELECT 
                owner_id,
                owner_name,
                phone_number,
                other_phone_number
             FROM owners
             WHERE phone_number = ?
             OR other_phone_number = ?`,
            [phoneNumber,phoneNumber]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                message: "Owner not found"
            });
        }

        res.status(200).json(owners[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error finding owner"
        });
    }
};
module.exports = {
    addOwner,
    getAllOwners,
    getHousesByOwner,
    getSuitableCustomers,
    updateOwner,
    deleteOwner,
    getOwnerByPhone
};