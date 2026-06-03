const db = require('../config/db.js');

const createWorkerEmployeeTypesTable = async () => {
    try {
        const [tables] = await db.execute("SHOW TABLES LIKE 'worker_employee_types'");
        if (tables.length === 0) {
            const [oldTables] = await db.execute("SHOW TABLES LIKE 'operator_types'");
            if (oldTables.length > 0) {
                console.log("Migrating operator_types table to worker_employee_types...");
                await db.execute("RENAME TABLE operator_types TO worker_employee_types");
                
                const [cols] = await db.execute("SHOW COLUMNS FROM worker_employee_types LIKE 'operator_type_name'");
                if (cols.length > 0) {
                    await db.execute("ALTER TABLE worker_employee_types CHANGE COLUMN operator_type_name worker_employee_type_name VARCHAR(100) NOT NULL UNIQUE");
                }
                console.log("✅ Migrated operator_types table to worker_employee_types.");
            }
        }
    } catch (err) {
        console.error("Migration check failed for operator_types:", err.message);
    }

    const query = `
        CREATE TABLE IF NOT EXISTS worker_employee_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_employee_type_name VARCHAR(100) NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    await db.execute(query);
    console.log("Worker/Employee types table ready");
};

const createWorkerEmployeeType = async (workerEmployeeTypeName, addedBy, deviceId) => {
    const query = `
        INSERT INTO worker_employee_types (worker_employee_type_name, added_by, device_id)
        VALUES (?, ?, ?)
    `;

    const [results] = await db.execute(query, [workerEmployeeTypeName, addedBy, deviceId]);
    return results;
};

const getAllWorkerEmployeeTypes = async () => {
    const query = `
        SELECT
            wet.id,
            wet.worker_employee_type_name,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            wet.device_id,
            wet.created_at
        FROM worker_employee_types wet
        LEFT JOIN users u ON wet.added_by = u.id
        ORDER BY wet.created_at DESC
    `;

    const [results] = await db.execute(query);
    return results;
};

const updateWorkerEmployeeType = async (id, workerEmployeeTypeName) => {
    const query = `
        UPDATE worker_employee_types
        SET worker_employee_type_name = ?
        WHERE id = ?
    `;

    const [results] = await db.execute(query, [workerEmployeeTypeName, id]);
    return results;
};

const deleteWorkerEmployeeType = async (id) => {
    const query = `
        DELETE FROM worker_employee_types
        WHERE id = ?
    `;

    const [results] = await db.execute(query, [id]);
    return results;
};

const getWorkerEmployeeTypeById = async (id) => {
    const query = `SELECT * FROM worker_employee_types WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
};

module.exports = {
    createWorkerEmployeeTypesTable,
    createWorkerEmployeeType,
    getAllWorkerEmployeeTypes,
    updateWorkerEmployeeType,
    deleteWorkerEmployeeType,
    getWorkerEmployeeTypeById
};
