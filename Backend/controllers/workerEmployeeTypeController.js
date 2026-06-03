const {
    createWorkerEmployeeType,
    getAllWorkerEmployeeTypes,
    updateWorkerEmployeeType,
    deleteWorkerEmployeeType,
    getWorkerEmployeeTypeById
} = require('../models/workerEmployeeTypeModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addWorkerEmployeeType = async (req, res) => {
    try {
        const { workerEmployeeTypeName } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers["x-device-id"] || req.headers["device-id"] || "Unknown";

        if (!workerEmployeeTypeName || !workerEmployeeTypeName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Worker/Employee type name is required'
            });
        }

        const workerEmployeeType = await createWorkerEmployeeType(workerEmployeeTypeName.trim(), addedBy, deviceId);
        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Type Master',
            'created',
            null,
            {
                id: workerEmployeeType.insertId,
                worker_employee_type_name: workerEmployeeTypeName.trim(),
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Worker/Employee type added successfully',
            data: workerEmployeeType
        });
    } catch (error) {
        console.error('Error adding worker/employee type:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Worker/Employee type name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllWorkerEmployeeTypesController = async (req, res) => {
    try {
        const workerEmployeeTypes = await getAllWorkerEmployeeTypes();

        res.status(200).json({
            success: true,
            message: 'Worker/Employee types retrieved successfully',
            data: workerEmployeeTypes
        });
    } catch (error) {
        console.error('Error retrieving worker/employee types:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateWorkerEmployeeTypeController = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerEmployeeTypeName } = req.body;

        if (!workerEmployeeTypeName || !workerEmployeeTypeName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Worker/Employee type name is required'
            });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getWorkerEmployeeTypeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Worker/Employee type not found' });
        }

        await updateWorkerEmployeeType(id, workerEmployeeTypeName.trim());
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Type Master',
            'updated',
            beforeData,
            {
                ...beforeData,
                worker_employee_type_name: workerEmployeeTypeName.trim()
            }
        );

        res.status(200).json({
            success: true,
            message: 'Worker/Employee type updated successfully'
        });
    } catch (error) {
        console.error('Error updating worker/employee type:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Worker/Employee type name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteWorkerEmployeeTypeController = async (req, res) => {
    try {
        const { id } = req.params;

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getWorkerEmployeeTypeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Worker/Employee type not found' });
        }

        await deleteWorkerEmployeeType(id);
        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Type Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({
            success: true,
            message: 'Worker/Employee type deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting worker/employee type:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addWorkerEmployeeType,
    getAllWorkerEmployeeTypesController,
    updateWorkerEmployeeTypeController,
    deleteWorkerEmployeeTypeController
};
