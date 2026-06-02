const db = require('../config/db.js');

const createOrganizationTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS organization_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logo LONGTEXT,
            address TEXT,
            gst_number VARCHAR(50),
            added_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    await db.execute(query);
    console.log("Organization details table ready");
};

const getOrganizationDetails = async () => {
    const query = `
        SELECT 
            org.id,
            org.name,
            org.logo,
            org.address,
            org.gst_number,
            COALESCE(usr.name, 'Unknown') AS added_by_name,
            org.created_at,
            org.updated_at
        FROM organization_details org
        LEFT JOIN users usr ON org.added_by = usr.id
        LIMIT 1
    `;

    const [rows] = await db.execute(query);
    return rows[0] || null;
};

const upsertOrganizationDetails = async (name, logo, address, gstNumber, addedBy) => {
    // Check if a record already exists
    const existing = await getOrganizationDetails();

    if (existing) {
        // Update the existing record
        const query = `
            UPDATE organization_details
            SET name = ?, logo = ?, address = ?, gst_number = ?, added_by = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [name, logo || null, address || null, gstNumber || null, addedBy, existing.id]);
        return { action: 'updated', id: existing.id, result };
    } else {
        // Insert a new record
        const query = `
            INSERT INTO organization_details (name, logo, address, gst_number, added_by)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [name, logo || null, address || null, gstNumber || null, addedBy]);
        return { action: 'created', id: result.insertId, result };
    }
};

module.exports = {
    createOrganizationTable,
    getOrganizationDetails,
    upsertOrganizationDetails
};
