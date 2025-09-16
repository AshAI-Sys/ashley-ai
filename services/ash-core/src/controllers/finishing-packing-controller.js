"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinishingPackingController = void 0;
exports.createFinishingRun = createFinishingRun;
exports.completeFinishingRun = completeFinishingRun;
exports.listFinishingRuns = listFinishingRuns;
exports.createFinishedUnits = createFinishedUnits;
exports.listFinishedUnits = listFinishedUnits;
exports.createCarton = createCarton;
exports.addUnitsToCarton = addUnitsToCarton;
exports.removeUnitsFromCarton = removeUnitsFromCarton;
exports.closeCarton = closeCarton;
exports.getCartonDetails = getCartonDetails;
exports.listCartons = listCartons;
exports.generateCartonQR = generateCartonQR;
exports.createShipment = createShipment;
exports.updateShipmentStatus = updateShipmentStatus;
exports.getShipmentDetails = getShipmentDetails;
exports.listShipments = listShipments;
exports.generateShippingLabels = generateShippingLabels;
exports.getPackingEfficiency = getPackingEfficiency;
exports.getCartonOptimization = getCartonOptimization;

const express_validator_1 = require("express-validator");
const shared_1 = require("@ash/shared");
const database_1 = require("@ash/database");
const qrcode = require("qrcode");
const uuid_1 = require("uuid");

class FinishingPackingController {
    constructor() {
        this.prisma = database_1.prisma;
    }

    // Calculate dimensional weight based on carrier
    calculateDimensionalWeight(length_cm, width_cm, height_cm, carrier = 'default') {
        const volume_cm3 = length_cm * width_cm * height_cm;
        const divisor = carrier === 'air' ? 5000 : 6000; // Different carriers have different divisors
        return volume_cm3 / divisor;
    }

    // Calculate fill percentage
    calculateFillPercentage(carton_volume, used_volume) {
        if (carton_volume === 0) return 0;
        return (used_volume / carton_volume) * 100;
    }

    // Generate unique carton number for order
    async generateCartonNumber(workspaceId, orderId) {
        const existingCartons = await this.prisma.carton.count({
            where: { 
                workspace_id: workspaceId, 
                order_id: orderId 
            }
        });
        return existingCartons + 1;
    }
}

const controller = new FinishingPackingController();

// ===== FINISHING OPERATIONS =====

async function createFinishingRun(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;
        const { order_id, routing_step_id, materials, notes } = req.body;

        // Validate order and routing step exist
        const order = await controller.prisma.order.findUnique({
            where: { id: order_id, workspace_id: workspaceId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const routingStep = await controller.prisma.routingStep.findUnique({
            where: { id: routing_step_id }
        });

        if (!routingStep) {
            return res.status(404).json({
                success: false,
                error: 'Routing step not found'
            });
        }

        const finishingRun = await controller.prisma.finishingRun.create({
            data: {
                workspace_id: workspaceId,
                order_id,
                routing_step_id,
                operator_id: userId,
                materials: materials ? JSON.stringify(materials) : null,
                notes,
                started_at: new Date()
            },
            include: {
                order: {
                    select: { order_number: true }
                },
                routing_step: {
                    select: { step_name: true }
                },
                operator: {
                    select: { first_name: true, last_name: true }
                }
            }
        });

        // Log audit trail
        await controller.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'finishing_run',
                entity_id: finishingRun.id,
                action: 'create',
                after: JSON.stringify(finishingRun)
            }
        });

        res.status(201).json({
            success: true,
            data: finishingRun
        });

    } catch (error) {
        shared_1.logger.error('Create finishing run error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create finishing run'
        });
    }
}

async function completeFinishingRun(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { notes } = req.body;
        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;

        const finishingRun = await controller.prisma.finishingRun.update({
            where: { id, workspace_id: workspaceId },
            data: {
                ended_at: new Date(),
                notes: notes || undefined
            },
            include: {
                order: {
                    select: { order_number: true }
                }
            }
        });

        // Log audit trail
        await controller.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'finishing_run',
                entity_id: finishingRun.id,
                action: 'complete',
                after: JSON.stringify(finishingRun)
            }
        });

        res.json({
            success: true,
            data: finishingRun
        });

    } catch (error) {
        shared_1.logger.error('Complete finishing run error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete finishing run'
        });
    }
}

async function listFinishingRuns(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        const { order_id, status } = req.query;

        const where = { workspace_id: workspaceId };
        if (order_id) where.order_id = order_id;
        if (status === 'active') where.ended_at = null;
        if (status === 'completed') where.ended_at = { not: null };

        const finishingRuns = await controller.prisma.finishingRun.findMany({
            where,
            include: {
                order: {
                    select: { order_number: true, client: { select: { name: true } } }
                },
                routing_step: {
                    select: { step_name: true }
                },
                operator: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: finishingRuns
        });

    } catch (error) {
        shared_1.logger.error('List finishing runs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list finishing runs'
        });
    }
}

// ===== PACKING OPERATIONS =====

async function createFinishedUnits(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;
        const { order_id, units } = req.body;

        // Validate order exists
        const order = await controller.prisma.order.findUnique({
            where: { id: order_id, workspace_id: workspaceId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Create finished units
        const finishedUnits = await controller.prisma.$transaction(async (tx) => {
            const createdUnits = [];

            for (const unit of units) {
                const finishedUnit = await tx.finishedUnit.create({
                    data: {
                        workspace_id: workspaceId,
                        order_id,
                        sku: unit.sku,
                        size_code: unit.size_code,
                        color: unit.color,
                        serial: unit.serial || null
                    }
                });
                createdUnits.push(finishedUnit);
            }

            return createdUnits;
        });

        // Log audit trail
        await controller.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'finished_units',
                entity_id: order_id,
                action: 'create_batch',
                after: JSON.stringify({ count: finishedUnits.length, units: finishedUnits })
            }
        });

        res.status(201).json({
            success: true,
            data: finishedUnits
        });

    } catch (error) {
        shared_1.logger.error('Create finished units error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create finished units'
        });
    }
}

async function listFinishedUnits(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        const { order_id, packed, sku } = req.query;

        const where = { workspace_id: workspaceId };
        if (order_id) where.order_id = order_id;
        if (packed !== undefined) where.packed = packed === 'true';
        if (sku) where.sku = { contains: sku, mode: 'insensitive' };

        const finishedUnits = await controller.prisma.finishedUnit.findMany({
            where,
            include: {
                order: {
                    select: { order_number: true, client: { select: { name: true } } }
                },
                carton_contents: {
                    include: {
                        carton: {
                            select: { id: true, carton_no: true, status: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: finishedUnits
        });

    } catch (error) {
        shared_1.logger.error('List finished units error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list finished units'
        });
    }
}

// ===== CARTON MANAGEMENT =====

async function createCarton(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;
        const { order_id, length_cm, width_cm, height_cm, tare_weight_kg } = req.body;

        // Validate order exists
        const order = await controller.prisma.order.findUnique({
            where: { id: order_id, workspace_id: workspaceId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Generate carton number
        const carton_no = await controller.generateCartonNumber(workspaceId, order_id);

        const carton = await controller.prisma.carton.create({
            data: {
                workspace_id: workspaceId,
                order_id,
                carton_no,
                length_cm,
                width_cm,
                height_cm,
                tare_weight_kg: tare_weight_kg || 0,
                status: 'OPEN'
            },
            include: {
                order: {
                    select: { order_number: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: carton
        });

    } catch (error) {
        shared_1.logger.error('Create carton error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create carton'
        });
    }
}

async function addUnitsToCarton(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { finished_unit_id, qty } = req.body;
        const workspaceId = req.user.workspace_id;

        // Validate carton exists and is open
        const carton = await controller.prisma.carton.findUnique({
            where: { id, workspace_id: workspaceId }
        });

        if (!carton) {
            return res.status(404).json({
                success: false,
                error: 'Carton not found'
            });
        }

        if (carton.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                error: 'Cannot add units to closed carton'
            });
        }

        // Validate finished unit exists and is not packed
        const finishedUnit = await controller.prisma.finishedUnit.findUnique({
            where: { id: finished_unit_id, workspace_id: workspaceId }
        });

        if (!finishedUnit) {
            return res.status(404).json({
                success: false,
                error: 'Finished unit not found'
            });
        }

        if (finishedUnit.packed) {
            return res.status(400).json({
                success: false,
                error: 'Unit is already packed'
            });
        }

        // Add unit to carton
        const result = await controller.prisma.$transaction(async (tx) => {
            const cartonContent = await tx.cartonContent.create({
                data: {
                    carton_id: id,
                    finished_unit_id,
                    qty
                },
                include: {
                    finished_unit: true
                }
            });

            // Mark unit as packed
            await tx.finishedUnit.update({
                where: { id: finished_unit_id },
                data: { packed: true }
            });

            return cartonContent;
        });

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        shared_1.logger.error('Add units to carton error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add units to carton'
        });
    }
}

async function removeUnitsFromCarton(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id, unit_id } = req.params;
        const workspaceId = req.user.workspace_id;

        // Find and delete carton content
        const result = await controller.prisma.$transaction(async (tx) => {
            const cartonContent = await tx.cartonContent.findFirst({
                where: {
                    carton_id: id,
                    finished_unit_id: unit_id,
                    carton: {
                        workspace_id: workspaceId,
                        status: 'OPEN'
                    }
                }
            });

            if (!cartonContent) {
                throw new Error('Carton content not found or carton is closed');
            }

            await tx.cartonContent.delete({
                where: { id: cartonContent.id }
            });

            // Mark unit as not packed
            await tx.finishedUnit.update({
                where: { id: unit_id },
                data: { packed: false }
            });

            return cartonContent;
        });

        res.json({
            success: true,
            data: { removed: true }
        });

    } catch (error) {
        shared_1.logger.error('Remove units from carton error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to remove units from carton'
        });
    }
}

async function closeCarton(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;

        // Get carton with contents
        const carton = await controller.prisma.carton.findUnique({
            where: { id, workspace_id: workspaceId },
            include: {
                contents: {
                    include: {
                        finished_unit: true
                    }
                }
            }
        });

        if (!carton) {
            return res.status(404).json({
                success: false,
                error: 'Carton not found'
            });
        }

        if (carton.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                error: 'Carton is already closed'
            });
        }

        if (carton.contents.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot close empty carton'
            });
        }

        // Calculate weights and dimensions
        const estimatedUnitWeight = 0.2; // Default 200g per unit
        const totalUnits = carton.contents.reduce((sum, content) => sum + content.qty, 0);
        const actual_weight_kg = carton.tare_weight_kg + (totalUnits * estimatedUnitWeight);
        
        const dim_weight_kg = carton.length_cm && carton.width_cm && carton.height_cm ?
            controller.calculateDimensionalWeight(carton.length_cm, carton.width_cm, carton.height_cm) :
            0;

        const carton_volume = carton.length_cm && carton.width_cm && carton.height_cm ?
            carton.length_cm * carton.width_cm * carton.height_cm :
            1;
        
        const used_volume = totalUnits * 1000; // Assume 1000 cm³ per unit
        const fill_percent = controller.calculateFillPercentage(carton_volume, used_volume);

        // Generate QR code
        const qr_code = `CARTON-${carton.order_id}-${carton.carton_no}-${(0, uuid_1.v4)().substring(0, 8)}`;
        const qr_data_url = await qrcode.toDataURL(qr_code);

        // Close carton
        const updatedCarton = await controller.prisma.carton.update({
            where: { id },
            data: {
                status: 'CLOSED',
                actual_weight_kg,
                dim_weight_kg,
                fill_percent,
                qr_code
            },
            include: {
                contents: {
                    include: {
                        finished_unit: true
                    }
                }
            }
        });

        // Log audit trail
        await controller.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'carton',
                entity_id: updatedCarton.id,
                action: 'close',
                after: JSON.stringify(updatedCarton)
            }
        });

        res.json({
            success: true,
            data: {
                ...updatedCarton,
                qr_data_url,
                weights: {
                    actual: actual_weight_kg,
                    dimensional: dim_weight_kg,
                    fill_percent
                }
            }
        });

    } catch (error) {
        shared_1.logger.error('Close carton error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to close carton'
        });
    }
}

async function getCartonDetails(req, res) {
    try {
        const { id } = req.params;
        const workspaceId = req.user.workspace_id;

        const carton = await controller.prisma.carton.findUnique({
            where: { id, workspace_id: workspaceId },
            include: {
                order: {
                    include: {
                        client: true
                    }
                },
                contents: {
                    include: {
                        finished_unit: true
                    }
                },
                shipment_cartons: {
                    include: {
                        shipment: true
                    }
                }
            }
        });

        if (!carton) {
            return res.status(404).json({
                success: false,
                error: 'Carton not found'
            });
        }

        res.json({
            success: true,
            data: carton
        });

    } catch (error) {
        shared_1.logger.error('Get carton details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get carton details'
        });
    }
}

async function listCartons(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        const { order_id, status } = req.query;

        const where = { workspace_id: workspaceId };
        if (order_id) where.order_id = order_id;
        if (status) where.status = status;

        const cartons = await controller.prisma.carton.findMany({
            where,
            include: {
                order: {
                    select: { order_number: true, client: { select: { name: true } } }
                },
                contents: {
                    include: {
                        finished_unit: {
                            select: { sku: true, size_code: true }
                        }
                    }
                },
                shipment_cartons: {
                    include: {
                        shipment: {
                            select: { id: true, status: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: cartons
        });

    } catch (error) {
        shared_1.logger.error('List cartons error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list cartons'
        });
    }
}

async function generateCartonQR(req, res) {
    try {
        const { id } = req.params;
        const workspaceId = req.user.workspace_id;

        const carton = await controller.prisma.carton.findUnique({
            where: { id, workspace_id: workspaceId },
            select: { qr_code: true, order: { select: { order_number: true } } }
        });

        if (!carton || !carton.qr_code) {
            return res.status(404).json({
                success: false,
                error: 'Carton not found or QR code not generated'
            });
        }

        const qr_data_url = await qrcode.toDataURL(carton.qr_code);

        res.json({
            success: true,
            data: {
                qr_code: carton.qr_code,
                qr_data_url,
                order_number: carton.order.order_number
            }
        });

    } catch (error) {
        shared_1.logger.error('Generate carton QR error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate carton QR code'
        });
    }
}

// ===== SHIPMENT MANAGEMENT =====

async function createShipment(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;
        const {
            order_id,
            consignee_name,
            consignee_address,
            contact_phone,
            method,
            cod_amount,
            cartons
        } = req.body;

        // Validate order exists
        const order = await controller.prisma.order.findUnique({
            where: { id: order_id, workspace_id: workspaceId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Validate all cartons exist and are closed
        const cartonRecords = await controller.prisma.carton.findMany({
            where: {
                id: { in: cartons },
                workspace_id: workspaceId,
                order_id
            }
        });

        if (cartonRecords.length !== cartons.length) {
            return res.status(400).json({
                success: false,
                error: 'One or more cartons not found'
            });
        }

        const openCartons = cartonRecords.filter(c => c.status !== 'CLOSED');
        if (openCartons.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'All cartons must be closed before creating shipment'
            });
        }

        // Create shipment
        const shipment = await controller.prisma.$transaction(async (tx) => {
            const newShipment = await tx.shipment.create({
                data: {
                    workspace_id: workspaceId,
                    order_id,
                    consignee_name,
                    consignee_address: JSON.stringify(consignee_address),
                    contact_phone,
                    method,
                    cod_amount,
                    status: 'READY_FOR_PICKUP'
                }
            });

            // Link cartons to shipment
            const shipmentCartons = await Promise.all(
                cartons.map(carton_id =>
                    tx.shipmentCarton.create({
                        data: {
                            shipment_id: newShipment.id,
                            carton_id
                        }
                    })
                )
            );

            return { ...newShipment, cartons: shipmentCartons };
        });

        res.status(201).json({
            success: true,
            data: shipment
        });

    } catch (error) {
        shared_1.logger.error('Create shipment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create shipment'
        });
    }
}

async function updateShipmentStatus(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { status, carrier_ref, eta } = req.body;
        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;

        const shipment = await controller.prisma.shipment.update({
            where: { id, workspace_id: workspaceId },
            data: {
                status,
                carrier_ref,
                eta: eta ? new Date(eta) : undefined
            },
            include: {
                order: {
                    select: { order_number: true }
                }
            }
        });

        // Log audit trail
        await controller.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'shipment',
                entity_id: shipment.id,
                action: 'status_update',
                after: JSON.stringify({ status, carrier_ref, eta })
            }
        });

        res.json({
            success: true,
            data: shipment
        });

    } catch (error) {
        shared_1.logger.error('Update shipment status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update shipment status'
        });
    }
}

async function getShipmentDetails(req, res) {
    try {
        const { id } = req.params;
        const workspaceId = req.user.workspace_id;

        const shipment = await controller.prisma.shipment.findUnique({
            where: { id, workspace_id: workspaceId },
            include: {
                order: {
                    include: {
                        client: true
                    }
                },
                cartons: {
                    include: {
                        carton: {
                            include: {
                                contents: {
                                    include: {
                                        finished_unit: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }

        // Parse consignee address
        shipment.consignee_address = JSON.parse(shipment.consignee_address);

        res.json({
            success: true,
            data: shipment
        });

    } catch (error) {
        shared_1.logger.error('Get shipment details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get shipment details'
        });
    }
}

async function listShipments(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        const { order_id, status, method } = req.query;

        const where = { workspace_id: workspaceId };
        if (order_id) where.order_id = order_id;
        if (status) where.status = status;
        if (method) where.method = method;

        const shipments = await controller.prisma.shipment.findMany({
            where,
            include: {
                order: {
                    select: { order_number: true, client: { select: { name: true } } }
                },
                cartons: {
                    include: {
                        carton: {
                            select: { id: true, carton_no: true, actual_weight_kg: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Parse consignee addresses
        shipments.forEach(shipment => {
            shipment.consignee_address = JSON.parse(shipment.consignee_address);
        });

        res.json({
            success: true,
            data: shipments
        });

    } catch (error) {
        shared_1.logger.error('List shipments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list shipments'
        });
    }
}

async function generateShippingLabels(req, res) {
    try {
        const { id } = req.params;
        const workspaceId = req.user.workspace_id;

        const shipment = await controller.prisma.shipment.findUnique({
            where: { id, workspace_id: workspaceId },
            include: {
                order: {
                    include: {
                        client: true
                    }
                },
                cartons: {
                    include: {
                        carton: true
                    }
                }
            }
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }

        const consignee_address = JSON.parse(shipment.consignee_address);

        // Generate shipping label data
        const labelData = {
            shipment_id: shipment.id,
            order_number: shipment.order.order_number,
            consignee: {
                name: shipment.consignee_name,
                address: consignee_address,
                phone: shipment.contact_phone
            },
            sender: {
                name: shipment.order.client.name,
                // Add sender address from client or workspace settings
            },
            method: shipment.method,
            cod_amount: shipment.cod_amount,
            cartons: shipment.cartons.map(sc => ({
                carton_no: sc.carton.carton_no,
                weight: sc.carton.actual_weight_kg,
                dimensions: {
                    length: sc.carton.length_cm,
                    width: sc.carton.width_cm,
                    height: sc.carton.height_cm
                }
            }))
        };

        res.json({
            success: true,
            data: labelData
        });

    } catch (error) {
        shared_1.logger.error('Generate shipping labels error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate shipping labels'
        });
    }
}

// ===== ANALYTICS =====

async function getPackingEfficiency(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        const { period = '30' } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const metrics = await controller.prisma.$transaction(async (tx) => {
            const totalCartons = await tx.carton.count({
                where: {
                    workspace_id: workspaceId,
                    status: 'CLOSED',
                    created_at: { gte: startDate }
                }
            });

            const avgFillPercentage = await tx.carton.aggregate({
                where: {
                    workspace_id: workspaceId,
                    status: 'CLOSED',
                    created_at: { gte: startDate }
                },
                _avg: { fill_percent: true }
            });

            const totalShipments = await tx.shipment.count({
                where: {
                    workspace_id: workspaceId,
                    created_at: { gte: startDate }
                }
            });

            const deliveredShipments = await tx.shipment.count({
                where: {
                    workspace_id: workspaceId,
                    status: 'DELIVERED',
                    created_at: { gte: startDate }
                }
            });

            return {
                totalCartons,
                avgFillPercentage: avgFillPercentage._avg.fill_percent || 0,
                totalShipments,
                deliveryRate: totalShipments > 0 ? (deliveredShipments / totalShipments * 100) : 0
            };
        });

        res.json({
            success: true,
            data: metrics
        });

    } catch (error) {
        shared_1.logger.error('Get packing efficiency error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get packing efficiency metrics'
        });
    }
}

async function getCartonOptimization(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const { order_id } = req.body;

        // Get unpackaged units for the order
        const unpackedUnits = await controller.prisma.finishedUnit.findMany({
            where: {
                workspace_id: workspaceId,
                order_id,
                packed: false
            }
        });

        if (unpackedUnits.length === 0) {
            return res.json({
                success: true,
                data: {
                    message: 'All units are already packed',
                    suggestions: []
                }
            });
        }

        // Simple optimization: group by size for efficiency
        const sizeGroups = unpackedUnits.reduce((groups, unit) => {
            if (!groups[unit.size_code]) {
                groups[unit.size_code] = [];
            }
            groups[unit.size_code].push(unit);
            return groups;
        }, {});

        const suggestions = Object.entries(sizeGroups).map(([size, units]) => ({
            size_code: size,
            unit_count: units.length,
            suggested_carton_count: Math.ceil(units.length / 20), // Assume 20 units per carton
            optimization_tip: `Group ${units.length} units of size ${size} into ${Math.ceil(units.length / 20)} carton(s) for better fill efficiency`
        }));

        res.json({
            success: true,
            data: {
                total_unpacked_units: unpackedUnits.length,
                size_groups: Object.keys(sizeGroups).length,
                suggestions
            }
        });

    } catch (error) {
        shared_1.logger.error('Get carton optimization error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get carton optimization suggestions'
        });
    }
}