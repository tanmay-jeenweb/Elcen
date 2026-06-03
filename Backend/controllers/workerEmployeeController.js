const {
    createWorkerEmployee,
    getAllWorkerEmployees,
    getWorkerEmployeeById,
    updateWorkerEmployee,
    toggleWorkerEmployeeActive,
    deleteWorkerEmployee
} = require('../models/workerEmployeeModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const addWorkerEmployee = async (req, res) => {
    try {
        const {
            workerEmployeeCode,
            workerEmployeeName,
            dateOfJoining,
            information,
            workerEmployeeTypeId
        } = req.body;

        const addedBy = req.user.id;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        if (!workerEmployeeCode || !workerEmployeeCode.trim()) {
            return res.status(400).json({ success: false, message: 'Worker/Employee code is required' });
        }
        if (!workerEmployeeName || !workerEmployeeName.trim()) {
            return res.status(400).json({ success: false, message: 'Worker/Employee name is required' });
        }

        const data = {
            workerEmployeeCode: workerEmployeeCode.trim(),
            workerEmployeeName: workerEmployeeName.trim(),
            dateOfJoining: dateOfJoining || null,
            information: information ? information.trim() : null,
            workerEmployeeTypeId: workerEmployeeTypeId || null
        };

        const workerEmployee = await createWorkerEmployee(data, addedBy, deviceId);

        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Master',
            'created',
            null,
            {
                id: workerEmployee.insertId,
                ...data,
                added_by: addedBy,
                device_id: deviceId
            }
        );

        res.status(201).json({
            success: true,
            message: 'Worker/Employee added successfully',
            data: workerEmployee
        });
    } catch (error) {
        console.error('Error adding worker/employee:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Worker/Employee code already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getAllWorkerEmployeesController = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const workerEmployees = await getAllWorkerEmployees(includeInactive);
        res.status(200).json({
            success: true,
            message: 'Worker/Employees retrieved successfully',
            data: workerEmployees
        });
    } catch (error) {
        console.error('Error retrieving worker/employees:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getWorkerEmployeeByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const workerEmployee = await getWorkerEmployeeById(id);
        if (!workerEmployee) {
            return res.status(404).json({ success: false, message: 'Worker/Employee not found' });
        }
        res.status(200).json({ success: true, message: 'Worker/Employee retrieved successfully', data: workerEmployee });
    } catch (error) {
        console.error('Error retrieving worker/employee:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateWorkerEmployeeController = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            workerEmployeeCode,
            workerEmployeeName,
            dateOfJoining,
            information,
            workerEmployeeTypeId
        } = req.body;

        if (!workerEmployeeCode || !workerEmployeeCode.trim()) {
            return res.status(400).json({ success: false, message: 'Worker/Employee code is required' });
        }
        if (!workerEmployeeName || !workerEmployeeName.trim()) {
            return res.status(400).json({ success: false, message: 'Worker/Employee name is required' });
        }

        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';
        const beforeData = await getWorkerEmployeeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Worker/Employee not found' });
        }

        const data = {
            workerEmployeeCode: workerEmployeeCode.trim(),
            workerEmployeeName: workerEmployeeName.trim(),
            dateOfJoining: dateOfJoining || null,
            information: information ? information.trim() : null,
            workerEmployeeTypeId: workerEmployeeTypeId || null
        };

        await updateWorkerEmployee(id, data);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Master',
            'updated',
            beforeData,
            { ...beforeData, ...data }
        );

        res.status(200).json({ success: true, message: 'Worker/Employee updated successfully' });
    } catch (error) {
        console.error('Error updating worker/employee:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Worker/Employee code already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const toggleWorkerEmployeeActiveController = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getWorkerEmployeeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Worker/Employee not found' });
        }

        await toggleWorkerEmployeeActive(id, active);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Master',
            active ? 'activated' : 'deactivated',
            { ...beforeData, active: beforeData.active },
            { ...beforeData, active: active ? 1 : 0 }
        );

        res.status(200).json({
            success: true,
            message: `Worker/Employee ${active ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Error toggling worker/employee active status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteWorkerEmployeeController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceId = req.headers['x-device-id'] || req.headers['device-id'] || 'Unknown';

        const beforeData = await getWorkerEmployeeById(id);
        if (!beforeData) {
            return res.status(404).json({ success: false, message: 'Worker/Employee not found' });
        }

        await deleteWorkerEmployee(id);

        await createAuditLog(
            req.user?.id,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Worker/Employee Master',
            'deleted',
            beforeData,
            null
        );

        res.status(200).json({ success: true, message: 'Worker/Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting worker/employee:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addWorkerEmployee,
    getAllWorkerEmployeesController,
    getWorkerEmployeeByIdController,
    updateWorkerEmployeeController,
    toggleWorkerEmployeeActiveController,
    deleteWorkerEmployeeController
};
