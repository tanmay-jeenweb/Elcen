const db = require('../config/db.js');

const createBOMTables = async () => {
    const createBomsTableQuery = `
        CREATE TABLE IF NOT EXISTS boms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            material_id INT NOT NULL UNIQUE,
            added_by INT NOT NULL,
            device_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
            FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    const createBomMaterialsTableQuery = `
        CREATE TABLE IF NOT EXISTS bom_materials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bom_id INT NOT NULL,
            material_id INT NOT NULL,
            quantity DECIMAL(15,4) NOT NULL,
            FOREIGN KEY (bom_id) REFERENCES boms(id) ON DELETE CASCADE,
            FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
        )
    `;

    const createBomProcessesTableQuery = `
        CREATE TABLE IF NOT EXISTS bom_processes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bom_id INT NOT NULL,
            process_id INT NOT NULL,
            standard_cycle_time INT NOT NULL,
            FOREIGN KEY (bom_id) REFERENCES boms(id) ON DELETE CASCADE,
            FOREIGN KEY (process_id) REFERENCES process_masters(id) ON DELETE CASCADE
        )
    `;

    await db.execute(createBomsTableQuery);
    await db.execute(createBomMaterialsTableQuery);
    await db.execute(createBomProcessesTableQuery);
    console.log("BOM tables ready");
};

const createBOM = async (materialId, rawMaterials, processes, addedBy, deviceId) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert BOM header
        const [bomResult] = await conn.execute(
            `INSERT INTO boms (material_id, added_by, device_id) VALUES (?, ?, ?)`,
            [materialId, addedBy, deviceId || null]
        );
        const bomId = bomResult.insertId;

        // 2. Insert Raw Materials
        if (rawMaterials && rawMaterials.length > 0) {
            for (const rm of rawMaterials) {
                await conn.execute(
                    `INSERT INTO bom_materials (bom_id, material_id, quantity) VALUES (?, ?, ?)`,
                    [bomId, rm.materialId, rm.quantity]
                );
            }
        }

        // 3. Insert Processes
        if (processes && processes.length > 0) {
            for (const p of processes) {
                await conn.execute(
                    `INSERT INTO bom_processes (bom_id, process_id, standard_cycle_time) VALUES (?, ?, ?)`,
                    [bomId, p.processId, p.standardCycleTime]
                );
            }
        }

        await conn.commit();
        return bomResult;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const getAllBOMs = async () => {
    // Fetch BOM headers with finished/semi-finished material details and total process times
    const query = `
        SELECT 
            b.id,
            b.material_id,
            m.material_code,
            m.material_name,
            m.material_type,
            COALESCE(usr.name, 'Unknown') AS added_by_name,
            b.device_id,
            b.created_at,
            (SELECT COUNT(*) FROM bom_materials WHERE bom_id = b.id) AS raw_materials_count,
            (SELECT COUNT(*) FROM bom_processes WHERE bom_id = b.id) AS processes_count,
            (SELECT COALESCE(SUM(standard_cycle_time), 0) FROM bom_processes WHERE bom_id = b.id) AS total_cycle_time
        FROM boms b
        LEFT JOIN materials m ON b.material_id = m.id
        LEFT JOIN users usr ON b.added_by = usr.id
        ORDER BY b.created_at DESC
    `;

    const [results] = await db.execute(query);
    return results;
};

const getBOMById = async (id) => {
    // 1. Fetch header
    const headerQuery = `
        SELECT 
            b.id,
            b.material_id,
            m.material_code,
            m.material_name,
            m.material_type,
            COALESCE(usr.name, 'Unknown') AS added_by_name,
            b.device_id,
            b.created_at
        FROM boms b
        LEFT JOIN materials m ON b.material_id = m.id
        LEFT JOIN users usr ON b.added_by = usr.id
        WHERE b.id = ?
    `;
    const [headerRows] = await db.execute(headerQuery, [id]);
    if (headerRows.length === 0) return null;

    const bom = headerRows[0];

    // 2. Fetch raw materials
    const materialsQuery = `
        SELECT 
            bm.id,
            bm.material_id AS materialId,
            m.material_code AS materialCode,
            m.material_name AS materialName,
            bm.quantity,
            u.unit_name AS unitName
        FROM bom_materials bm
        LEFT JOIN materials m ON bm.material_id = m.id
        LEFT JOIN units u ON m.unit_id = u.id
        WHERE bm.bom_id = ?
    `;
    const [materialsRows] = await db.execute(materialsQuery, [id]);
    bom.rawMaterials = materialsRows;

    // 3. Fetch processes
    const processesQuery = `
        SELECT 
            bp.id,
            bp.process_id AS processId,
            p.process_name AS processName,
            bp.standard_cycle_time AS standardCycleTime
        FROM bom_processes bp
        LEFT JOIN process_masters p ON bp.process_id = p.id
        WHERE bp.bom_id = ?
    `;
    const [processesRows] = await db.execute(processesQuery, [id]);
    bom.processes = processesRows;

    return bom;
};

const updateBOM = async (id, rawMaterials, processes) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Delete existing items
        await conn.execute(`DELETE FROM bom_materials WHERE bom_id = ?`, [id]);
        await conn.execute(`DELETE FROM bom_processes WHERE bom_id = ?`, [id]);

        // 2. Insert new Raw Materials
        if (rawMaterials && rawMaterials.length > 0) {
            for (const rm of rawMaterials) {
                await conn.execute(
                    `INSERT INTO bom_materials (bom_id, material_id, quantity) VALUES (?, ?, ?)`,
                    [id, rm.materialId, rm.quantity]
                );
            }
        }

        // 3. Insert new Processes
        if (processes && processes.length > 0) {
            for (const p of processes) {
                await conn.execute(
                    `INSERT INTO bom_processes (bom_id, process_id, standard_cycle_time) VALUES (?, ?, ?)`,
                    [id, p.processId, p.standardCycleTime]
                );
            }
        }

        await conn.commit();
        return { affectedRows: 1 };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const deleteBOM = async (id) => {
    const query = `DELETE FROM boms WHERE id = ?`;
    const [results] = await db.execute(query, [id]);
    return results;
};

module.exports = {
    createBOMTables,
    createBOM,
    getAllBOMs,
    getBOMById,
    updateBOM,
    deleteBOM
};
