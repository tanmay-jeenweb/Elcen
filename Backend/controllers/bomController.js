const {
    createBOM,
    getAllBOMs,
    getBOMById,
    updateBOM,
    deleteBOM
} = require('../models/bomModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const createBOMController = async (req, res) => {
    try {
        const { materialId, rawMaterials, processes } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers["x-device-id"] || req.headers["device-id"] || "Unknown";

        if (!materialId) {
            return res.status(400).json({
                success: false,
                message: 'Finished/Semi-Finished Material is required'
            });
        }

        const result = await createBOM(materialId, rawMaterials || [], processes || [], addedBy, deviceId);

        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Bill of Material Master',
            'created',
            null,
            {
                id: result.insertId,
                material_id: materialId,
                raw_materials: rawMaterials || [],
                processes: processes || [],
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Bill of Material created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error creating BOM:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'A Bill of Material already exists for this material'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllBOMsController = async (req, res) => {
    try {
        const boms = await getAllBOMs();
        res.status(200).json({
            success: true,
            message: 'BOMs retrieved successfully',
            data: boms
        });
    } catch (error) {
        console.error('Error retrieving BOMs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getBOMByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const bom = await getBOMById(id);

        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'Bill of Material not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'BOM retrieved successfully',
            data: bom
        });
    } catch (error) {
        console.error('Error retrieving BOM:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateBOMController = async (req, res) => {
    try {
        const { id } = req.params;
        const { rawMaterials, processes } = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getBOMById(id);
        if (!beforeData) {
            return res.status(404).json({
                success: false,
                message: 'Bill of Material not found'
            });
        }

        await updateBOM(id, rawMaterials || [], processes || []);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Bill of Material Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                raw_materials: rawMaterials || [],
                processes: processes || []
            }
        );

        res.status(200).json({
            success: true,
            message: 'Bill of Material updated successfully'
        });
    } catch (error) {
        console.error('Error updating BOM:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteBOMController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getBOMById(id);
        if (!beforeData) {
            return res.status(404).json({
                success: false,
                message: 'Bill of Material not found'
            });
        }

        await deleteBOM(id);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Bill of Material Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({
            success: true,
            message: 'Bill of Material deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting BOM:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createBOMController,
    getAllBOMsController,
    getBOMByIdController,
    updateBOMController,
    deleteBOMController
};
