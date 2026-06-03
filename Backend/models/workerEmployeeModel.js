const db = require('../config/db.js');

const createWorkerEmployeesTable = async () => {
    try {
        const [tables] = await db.execute("SHOW TABLES LIKE 'worker_employees'");
        if (tables.length === 0) {
            const [oldTables] = await db.execute("SHOW TABLES LIKE 'operators'");
            if (oldTables.length > 0) {
                console.log("Migrating operators table to worker_employees...");
                await db.execute("RENAME TABLE operators TO worker_employees");
                
                // Rename columns safely
                const colsToRename = [
                    { oldName: 'operator_code', newName: 'worker_employee_code', def: 'VARCHAR(100) NOT NULL UNIQUE' },
                    { oldName: 'operator_name', newName: 'worker_employee_name', def: 'VARCHAR(255) NOT NULL' },
                    { oldName: 'operator_type_id', newName: 'worker_employee_type_id', def: 'INT' }
                ];
                
                for (const col of colsToRename) {
                    const [exists] = await db.execute(
                        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker_employees' AND COLUMN_NAME = ?`,
                        [col.oldName]
                    );
                    if (exists.length > 0) {
                        await db.execute(`ALTER TABLE worker_employees CHANGE COLUMN ${col.oldName} ${col.newName} ${col.def}`);
                    }
                }
                console.log("✅ Migrated operators table to worker_employees.");
            }
        }
    } catch (err) {
        console.error("Migration check failed for operators:", err.message);
    }

    const query = `
        CREATE TABLE IF NOT EXISTS worker_employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_employee_code VARCHAR(100) NOT NULL UNIQUE,
            worker_employee_name VARCHAR(255) NOT NULL,
            date_of_joining DATE,
            information TEXT,
            worker_employee_type_id INT,
            active BOOLEAN DEFAULT TRUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (worker_employee_type_id) REFERENCES worker_employee_types(id) ON DELETE SET NULL,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    await db.execute(query);
    console.log("Worker/Employees table ready");
};

const ensureWorkerEmployeeColumns = async () => {
    const columnsToEnsure = [
        { name: 'active', query: 'ALTER TABLE worker_employees ADD COLUMN active BOOLEAN DEFAULT TRUE' }
    ];

    for (const col of columnsToEnsure) {
        const [rows] = await db.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker_employees' AND COLUMN_NAME = ?`,
            [col.name]
        );
        if (rows.length === 0) {
            await db.execute(col.query);
            console.log(`Added column ${col.name} to worker_employees`);
        }
    }
};

const createWorkerEmployee = async (data, addedBy, deviceId) => {
    const {
        workerEmployeeCode,
        workerEmployeeName,
        dateOfJoining,
        information,
        workerEmployeeTypeId
    } = data;

    const query = `
        INSERT INTO worker_employees (worker_employee_code, worker_employee_name, date_of_joining, information, worker_employee_type_id, added_by, device_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [results] = await db.execute(query, [
        workerEmployeeCode,
        workerEmployeeName,
        dateOfJoining || null,
        information || null,
        workerEmployeeTypeId || null,
        addedBy,
        deviceId
    ]);

    return results;
};

const getAllWorkerEmployees = async (includeInactive = false) => {
    const whereClause = includeInactive ? '' : 'WHERE we.active = 1 OR we.active IS NULL';
    const query = `
        SELECT
            we.id,
            we.worker_employee_code,
            we.worker_employee_name,
            we.date_of_joining,
            we.information,
            we.worker_employee_type_id,
            we.active,
            wet.worker_employee_type_name,
            COALESCE(u.name, 'Unknown') AS added_by_name,
            we.device_id,
            we.created_at
        FROM worker_employees we
        LEFT JOIN worker_employee_types wet ON we.worker_employee_type_id = wet.id
        LEFT JOIN users u ON we.added_by = u.id
        ${whereClause}
        ORDER BY we.created_at DESC
    `;

    const [results] = await db.execute(query);
    return results;
};

const getWorkerEmployeeById = async (id) => {
    const query = `SELECT * FROM worker_employees WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
};

const updateWorkerEmployee = async (id, data) => {
    const {
        workerEmployeeCode,
        workerEmployeeName,
        dateOfJoining,
        information,
        workerEmployeeTypeId
    } = data;

    const query = `
        UPDATE worker_employees
        SET
            worker_employee_code = ?,
            worker_employee_name = ?,
            date_of_joining = ?,
            information = ?,
            worker_employee_type_id = ?
        WHERE id = ?
    `;

    const [results] = await db.execute(query, [
        workerEmployeeCode,
        workerEmployeeName,
        dateOfJoining || null,
        information || null,
        workerEmployeeTypeId || null,
        id
    ]);

    return results;
};

const toggleWorkerEmployeeActive = async (id, active) => {
    const query = `UPDATE worker_employees SET active = ? WHERE id = ?`;
    const [result] = await db.execute(query, [active ? 1 : 0, id]);
    return result;
};

const deleteWorkerEmployee = async (id) => {
    const query = `DELETE FROM worker_employees WHERE id = ?`;
    const [results] = await db.execute(query, [id]);
    return results;
};

module.exports = {
    createWorkerEmployeesTable,
    ensureWorkerEmployeeColumns,
    createWorkerEmployee,
    getAllWorkerEmployees,
    getWorkerEmployeeById,
    updateWorkerEmployee,
    toggleWorkerEmployeeActive,
    deleteWorkerEmployee
};
