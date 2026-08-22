const db = require("../config/db");


// 1. Add customer
const addCustomer = async (req, res) => {
    try {
        const {
            customer_name,
            customer_type,
            no_of_persons,
            phone_number,
            job,
            salary,
            preferred_rental_type,
            preferred_rent_price,
            preferred_bokkiyam_amount,
            other_preferences,
            preferred_region_ids
        } = req.body;

        // Basic validation
        if (
            !customer_name ||
            !customer_type ||
            !no_of_persons ||
            !phone_number ||
            !preferred_rental_type
        ) {
            return res.status(400).json({
                message: "Required customer details are missing"
            });
        }

        // Insert customer
        const [result] = await db.query(
            `INSERT INTO customers (
                customer_name,
                customer_type,
                no_of_persons,
                phone_number,
                job,
                salary,
                preferred_rental_type,
                preferred_rent_price,
                preferred_bokkiyam_amount,
                other_preferences
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_name,
                customer_type,
                no_of_persons,
                phone_number,
                job || null,
                salary || null,
                preferred_rental_type,
                preferred_rent_price ?? null,
                preferred_bokkiyam_amount ?? null,
                other_preferences || null
            ]
        );

        const customerId = result.insertId;

        // Add preferred regions if provided
        if (
            preferred_region_ids &&
            Array.isArray(preferred_region_ids) &&
            preferred_region_ids.length > 0
        ) {
            for (const regionId of preferred_region_ids) {
                await db.query(
                    `INSERT INTO customer_preferred_regions
                    (customer_id, region_id)
                    VALUES (?, ?)`,
                    [customerId, regionId]
                );
            }
        }

        res.status(201).json({
            message: "Customer added successfully",
            customer_id: customerId
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Customer with this phone number already exists"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error adding customer"
        });
    }
};


// 2. Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const [customers] = await db.query(
            `SELECT *
             FROM customers
             ORDER BY customer_id DESC`
        );

        res.status(200).json(customers);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching customers"
        });
    }
};


// 3. Get customer details by ID
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const [customers] = await db.query(
            `SELECT *
             FROM customers
             WHERE customer_id = ?`,
            [id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Get preferred regions separately
        const [regions] = await db.query(
            `SELECT
                r.region_id,
                r.region_name
             FROM customer_preferred_regions cpr
             JOIN regions r
                ON cpr.region_id = r.region_id
             WHERE cpr.customer_id = ?`,
            [id]
        );

        const customer = {
            ...customers[0],
            preferred_regions: regions
        };

        res.status(200).json(customer);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching customer"
        });
    }
};


// 4. Update customer
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            customer_name,
            customer_type,
            no_of_persons,
            phone_number,
            job,
            salary,
            preferred_rental_type,
            preferred_rent_price,
            preferred_bokkiyam_amount,
            other_preferences,
            preferred_region_ids
        } = req.body;

        // Check customer exists
        const [existing] = await db.query(
            `SELECT customer_id
             FROM customers
             WHERE customer_id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Update customer details
        await db.query(
            `UPDATE customers
             SET
                customer_name = ?,
                customer_type = ?,
                no_of_persons = ?,
                phone_number = ?,
                job = ?,
                salary = ?,
                preferred_rental_type = ?,
                preferred_rent_price = ?,
                preferred_bokkiyam_amount = ?,
                other_preferences = ?
             WHERE customer_id = ?`,
            [
                customer_name,
                customer_type,
                no_of_persons,
                phone_number,
                job || null,
                salary || null,
                preferred_rental_type,
                preferred_rent_price ?? null,
                preferred_bokkiyam_amount ?? null,
                other_preferences || null,
                id
            ]
        );

        // Update preferred regions
        if (Array.isArray(preferred_region_ids)) {

            // Delete old preferences
            await db.query(
                `DELETE FROM customer_preferred_regions
                 WHERE customer_id = ?`,
                [id]
            );

            // Insert new preferences
            for (const regionId of preferred_region_ids) {
                await db.query(
                    `INSERT INTO customer_preferred_regions
                    (customer_id, region_id)
                    VALUES (?, ?)`,
                    [id, regionId]
                );
            }
        }

        res.status(200).json({
            message: "Customer updated successfully"
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Phone number already belongs to another customer"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error updating customer"
        });
    }
};


// 5. Delete customer
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `DELETE FROM customers
             WHERE customer_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.status(200).json({
            message: "Customer deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting customer"
        });
    }
};


// 6. Get suitable houses for customer
const getSuitableHouses = async (req, res) => {
    try {
        const { id } = req.params;

        // Check customer exists
        const [customer] = await db.query(
            `SELECT customer_id
             FROM customers
             WHERE customer_id = ?`,
            [id]
        );

        if (customer.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const [houses] = await db.query(
            `
            SELECT DISTINCT
                h.*,
                o.owner_name,
                o.phone_number,
                o.other_phone_number,
                r.region_name,
                s.street_name

            FROM customers c

            JOIN houses h
                ON (
                    -- No preferred regions = ANY region
                    NOT EXISTS (
                        SELECT 1
                        FROM customer_preferred_regions cpr
                        WHERE cpr.customer_id = c.customer_id
                    )

                    OR

                    -- Match customer's preferred region
                    EXISTS (
                        SELECT 1
                        FROM customer_preferred_regions cpr
                        WHERE cpr.customer_id = c.customer_id
                        AND cpr.region_id = h.region_id
                    )
                )

            JOIN owners o
                ON h.owner_id = o.owner_id

            JOIN regions r
                ON h.region_id = r.region_id

            JOIN streets s
                ON h.street_id = s.street_id

            WHERE c.customer_id = ?
              AND h.is_available = TRUE

              AND (
                    -- Customer wants RENT
                    (
                        c.preferred_rental_type = 'RENT'
                        AND h.rental_type IN ('RENT', 'ANY')
                        AND h.rent_amount <= c.preferred_rent_price
                    )

                    OR

                    -- Customer wants BOKKIYAM
                    (
                        c.preferred_rental_type = 'BOKKIYAM'
                        AND h.rental_type IN ('BOKKIYAM', 'ANY')
                        AND h.bokkiyam_amount <= c.preferred_bokkiyam_amount
                    )

                    OR

                    -- Customer accepts either
                    (
                        c.preferred_rental_type = 'ANY'
                        AND (
                            (
                                h.rental_type IN ('RENT', 'ANY')
                                AND h.rent_amount <= c.preferred_rent_price
                            )

                            OR

                            (
                                h.rental_type IN ('BOKKIYAM', 'ANY')
                                AND h.bokkiyam_amount <= c.preferred_bokkiyam_amount
                            )
                        )
                    )
                )
            `,
            [id]
        );

        res.status(200).json(houses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error finding suitable houses"
        });
    }
};


module.exports = {
    addCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getSuitableHouses
};