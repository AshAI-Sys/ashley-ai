"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityInspectionSystem = void 0;
const eventemitter3_1 = require("eventemitter3");
const database_1 = require("@ash-ai/database");
const nanoid_1 = require("nanoid");
const date_fns_1 = require("date-fns");
class QualityInspectionSystem extends eventemitter3_1.EventEmitter {
    constructor(workspaceId, userId) {
        super();
        this.workspaceId = workspaceId;
        this.userId = userId;
    }
    async createInspection(request) {
        const inspectionId = (0, nanoid_1.nanoid)();
        // Get inspection point details
        const inspectionPoint = await database_1.db.qCInspectionPoint.findUnique({
            where: { id: request.inspectionPointId },
            include: {
                defect_types: true,
            },
        });
        if (!inspectionPoint) {
            throw new Error("Inspection point not found");
        }
        // Create inspection record
        const inspection = await database_1.db.qCInspection.create({
            data: {
                id: inspectionId,
                workspace_id: this.workspaceId,
                order_id: request.orderId,
                inspection_point_id: request.inspectionPointId,
                inspector_id: request.inspectorId,
                bundle_id: request.bundleId,
                batch_number: request.batchNumber,
                sample_size: request.sampleSize,
                status: "IN_PROGRESS",
                notes: request.notes,
                photos: request.photos ? JSON.stringify(request.photos) : null,
            },
        });
        // Generate inspection criteria from inspection point
        const criteria = JSON.parse(inspectionPoint.criteria || "[]");
        const criteriaResults = criteria.map((criterion) => ({
            criteriaName: criterion.name,
            result: "PASS", // Default, will be updated during inspection
            targetValue: criterion.targetValue,
            tolerance: criterion.tolerance,
            score: 100, // Default score
            aiDetected: false,
        }));
        // Perform AI analysis if enabled and photos provided
        let ashleyAnalysis;
        let aiConfidence;
        if (inspectionPoint.ai_enabled && request.photos && request.photos.length > 0) {
            ashleyAnalysis = await this.performAIAnalysis(request.photos, inspectionPoint, criteria);
            aiConfidence = ashleyAnalysis.confidence;
            // Update criteria results with AI findings
            this.applyAIFindingsToCriteria(criteriaResults, ashleyAnalysis);
        }
        const qcInspection = {
            id: inspectionId,
            workspaceId: this.workspaceId,
            orderId: request.orderId,
            inspectionPointId: request.inspectionPointId,
            inspectorId: request.inspectorId,
            bundleId: request.bundleId,
            batchNumber: request.batchNumber,
            inspectionDate: new Date(),
            status: "IN_PROGRESS",
            overallScore: this.calculateOverallScore(criteriaResults),
            passQuantity: 0,
            failQuantity: 0,
            reworkQuantity: 0,
            sampleSize: request.sampleSize,
            inspectionTime: 0,
            notes: request.notes,
            photos: request.photos || [],
            ashleyAnalysis,
            aiConfidence,
            criteriaResults,
            defects: [],
        };
        this.emit("inspection:created", { inspection: qcInspection });
        return qcInspection;
    }
    async completeInspection(inspectionId, results) {
        // Calculate overall score
        const overallScore = this.calculateOverallScore(results.criteriaResults);
        // Determine status based on results
        const status = this.determineInspectionStatus(results.criteriaResults, results.defects, overallScore);
        // Update inspection in database
        await database_1.db.qCInspection.update({
            where: { id: inspectionId },
            data: {
                status,
                overall_score: overallScore,
                pass_quantity: results.passQuantity,
                fail_quantity: results.failQuantity,
                rework_quantity: results.reworkQuantity,
                inspection_time: results.inspectionTime,
                notes: results.notes,
                ashley_analysis: JSON.stringify({}), // Would include full Ashley analysis
            },
        });
        // Create criteria results
        for (const criteriaResult of results.criteriaResults) {
            await database_1.db.qCCriteriaResult.create({
                data: {
                    inspection_id: inspectionId,
                    criteria_name: criteriaResult.criteriaName,
                    result: criteriaResult.result,
                    measured_value: criteriaResult.measuredValue,
                    target_value: criteriaResult.targetValue,
                    tolerance: criteriaResult.tolerance,
                    score: criteriaResult.score,
                    notes: criteriaResult.notes,
                    photo_url: criteriaResult.photoUrl,
                    ai_detected: criteriaResult.aiDetected,
                },
            });
        }
        // Create defects
        for (const defect of results.defects) {
            await database_1.db.qCDefect.create({
                data: {
                    workspace_id: this.workspaceId,
                    inspection_id: inspectionId,
                    defect_type_id: defect.defectTypeId,
                    quantity: defect.quantity,
                    location: defect.location,
                    description: defect.description,
                    photo_urls: JSON.stringify(defect.photoUrls),
                    root_cause: defect.rootCause,
                    severity: defect.severity,
                    cost_impact: defect.costImpact,
                    ai_detected: defect.aiDetected,
                    ai_confidence: defect.aiConfidence,
                },
            });
        }
        // Get the complete inspection
        const completedInspection = await this.getInspectionById(inspectionId);
        // Generate alerts if necessary
        await this.checkForQualityAlerts(completedInspection);
        // Auto-generate CAPA if critical defects found
        const criticalDefects = results.defects.filter(d => d.severity === "CRITICAL");
        if (criticalDefects.length > 0) {
            await this.autoGenerateCAPA(inspectionId, criticalDefects);
        }
        this.emit("inspection:completed", { inspection: completedInspection });
        return completedInspection;
    }
    async performPhotoAnalysis(photoUrls) {
        const analysisResults = {
            defectsDetected: [],
            qualityScore: 95, // Default high score
            overallAssessment: "PASS",
            analysisMetadata: {
                processingTime: 0,
                modelVersion: "v1.0",
                imageQuality: 0,
            },
        };
        const startTime = Date.now();
        try {
            for (const photoUrl of photoUrls) {
                // Process each photo
                const photoAnalysis = await this.analyzeIndividualPhoto(photoUrl);
                // Merge results
                analysisResults.defectsDetected.push(...photoAnalysis.defectsDetected);
                // Update quality score (take minimum)
                analysisResults.qualityScore = Math.min(analysisResults.qualityScore, photoAnalysis.qualityScore);
            }
            // Determine overall assessment
            const criticalDefects = analysisResults.defectsDetected.filter(d => d.severity === "CRITICAL");
            const highDefects = analysisResults.defectsDetected.filter(d => d.severity === "HIGH");
            if (criticalDefects.length > 0) {
                analysisResults.overallAssessment = "FAIL";
            }
            else if (highDefects.length > 2 || analysisResults.qualityScore < 70) {
                analysisResults.overallAssessment = "REVIEW_REQUIRED";
            }
            analysisResults.analysisMetadata.processingTime = Date.now() - startTime;
        }
        catch (error) {
            console.error("Photo analysis error:", error);
            // Return default result on error
            analysisResults.overallAssessment = "REVIEW_REQUIRED";
            analysisResults.qualityScore = 50;
            analysisResults.defectsDetected.push({
                type: "Analysis Error",
                confidence: 0.5,
                location: { x: 0, y: 0, width: 100, height: 100 },
                severity: "MEDIUM",
                description: "Unable to complete automated analysis. Manual inspection required.",
            });
        }
        return analysisResults;
    }
    async getInspectionsByOrder(orderId) {
        const inspections = await database_1.db.qCInspection.findMany({
            where: {
                order_id: orderId,
                workspace_id: this.workspaceId,
            },
            include: {
                inspection_point: true,
                inspector: true,
                criteria_results: true,
                defects: {
                    include: {
                        defect_type: true,
                    },
                },
            },
            orderBy: {
                inspection_date: "desc",
            },
        });
        return inspections.map(this.mapDatabaseToInspection);
    }
    async getQualityTrends(startDate, endDate, filters) {
        // This would implement complex quality trend analysis
        // For now, return sample data structure
        return {
            overallQuality: [],
            defectTrends: [],
            passRates: [],
        };
    }
    async performAIAnalysis(photos, inspectionPoint, criteria) {
        // Simulate AI analysis - in reality would call AI service
        return {
            overallScore: 92,
            riskLevel: "LOW",
            confidence: 0.87,
            detectedIssues: [
                {
                    type: "Minor Color Variation",
                    description: "Slight color inconsistency detected in print area",
                    severity: "LOW",
                    location: "Front panel, upper left",
                    confidence: 0.72,
                    photoEvidence: photos.slice(0, 1),
                },
            ],
            qualityPredictions: [
                {
                    metric: "Final Quality Score",
                    predictedValue: 91,
                    confidence: 0.85,
                    riskFactors: ["Print alignment", "Color consistency"],
                },
            ],
            recommendations: [
                {
                    action: "Adjust print alignment calibration",
                    priority: "LOW",
                    expectedImpact: "Improve print consistency by 5%",
                    implementationSteps: [
                        "Check printer head alignment",
                        "Recalibrate color settings",
                        "Test print on sample fabric",
                    ],
                },
            ],
            processImprovements: [
                {
                    area: "Print Quality",
                    currentPerformance: 92,
                    targetPerformance: 96,
                    improvementActions: [
                        "Implement automated print inspection",
                        "Update printer maintenance schedule",
                    ],
                },
            ],
        };
    }
    async analyzeIndividualPhoto(photoUrl) {
        try {
            // In a real implementation, this would:
            // 1. Load the image using Sharp
            // 2. Run it through TensorFlow.js model
            // 3. Detect defects and calculate quality score
            // For now, return simulated analysis
            return {
                defectsDetected: [
                    {
                        type: "Color Inconsistency",
                        confidence: 0.78,
                        location: { x: 150, y: 200, width: 50, height: 30 },
                        severity: "LOW",
                        description: "Minor color variation detected in fabric",
                    },
                ],
                qualityScore: 94,
            };
        }
        catch (error) {
            console.error(`Error analyzing photo ${photoUrl}:`, error);
            return {
                defectsDetected: [],
                qualityScore: 50,
            };
        }
    }
    applyAIFindingsToCriteria(criteriaResults, ashleyAnalysis) {
        // Apply AI findings to update criteria results
        for (const issue of ashleyAnalysis.detectedIssues) {
            const relatedCriteria = criteriaResults.find(c => c.criteriaName.toLowerCase().includes(issue.type.toLowerCase()));
            if (relatedCriteria) {
                relatedCriteria.aiDetected = true;
                relatedCriteria.result = issue.severity === "CRITICAL" ? "CRITICAL" :
                    issue.severity === "HIGH" ? "FAIL" : "ACCEPTABLE";
                relatedCriteria.score = Math.max(0, relatedCriteria.score - (issue.severity === "HIGH" ? 20 : 5));
                relatedCriteria.notes = `AI detected: ${issue.description} (confidence: ${(issue.confidence * 100).toFixed(1)}%)`;
            }
        }
    }
    calculateOverallScore(criteriaResults) {
        if (criteriaResults.length === 0)
            return 0;
        const totalScore = criteriaResults.reduce((sum, result) => sum + result.score, 0);
        return totalScore / criteriaResults.length;
    }
    determineInspectionStatus(criteriaResults, defects, overallScore) {
        const criticalResults = criteriaResults.filter(r => r.result === "CRITICAL");
        const failedResults = criteriaResults.filter(r => r.result === "FAIL");
        const criticalDefects = defects.filter(d => d.severity === "CRITICAL");
        if (criticalResults.length > 0 || criticalDefects.length > 0) {
            return "FAILED";
        }
        if (failedResults.length > 0 || overallScore < 70) {
            return "REWORK";
        }
        if (overallScore >= 95) {
            return "PASSED";
        }
        return "PASSED"; // Default to passed if above minimum threshold
    }
    async checkForQualityAlerts(inspection) {
        // Check for various alert conditions
        const alerts = [];
        // Low quality score alert
        if (inspection.overallScore < 75) {
            alerts.push({
                id: (0, nanoid_1.nanoid)(),
                alertType: "QUALITY_DROP",
                severity: "WARNING",
                title: "Low Quality Score Detected",
                message: `Inspection ${inspection.id} scored ${inspection.overallScore}% (below 75% threshold)`,
                data: { inspectionId: inspection.id, score: inspection.overallScore },
                triggeredBy: "system",
                affectedEntities: [
                    { type: "ORDER", id: inspection.orderId, name: `Order ${inspection.orderId}` },
                ],
                actionRequired: true,
                suggestedActions: [
                    "Review inspection results",
                    "Investigate root cause",
                    "Consider rework if necessary",
                ],
                isRead: false,
                createdAt: new Date(),
            });
        }
        // High defect rate alert
        const criticalDefects = inspection.defects.filter(d => d.severity === "CRITICAL");
        if (criticalDefects.length > 0) {
            alerts.push({
                id: (0, nanoid_1.nanoid)(),
                alertType: "DEFECT_THRESHOLD",
                severity: "CRITICAL",
                title: "Critical Defects Detected",
                message: `${criticalDefects.length} critical defects found in inspection ${inspection.id}`,
                data: { inspectionId: inspection.id, defectCount: criticalDefects.length },
                triggeredBy: "system",
                affectedEntities: [
                    { type: "ORDER", id: inspection.orderId, name: `Order ${inspection.orderId}` },
                ],
                actionRequired: true,
                suggestedActions: [
                    "Stop production immediately",
                    "Investigate root cause",
                    "Initiate CAPA process",
                ],
                isRead: false,
                createdAt: new Date(),
            });
        }
        // Emit alerts
        for (const alert of alerts) {
            this.emit("quality:alert", alert);
        }
    }
    async autoGenerateCAPA(inspectionId, criticalDefects) {
        // Auto-generate CAPA task for critical defects
        const capaNumber = `CAPA-${(0, date_fns_1.format)(new Date(), "yyyy")}-${String(Date.now()).slice(-6)}`;
        await database_1.db.cAPATask.create({
            data: {
                workspace_id: this.workspaceId,
                capa_number: capaNumber,
                title: `Critical Defects - Inspection ${inspectionId}`,
                description: `Auto-generated CAPA for ${criticalDefects.length} critical defects found during inspection`,
                type: "CORRECTIVE",
                priority: "CRITICAL",
                source: "INSPECTION",
                problem_statement: `Critical defects detected: ${criticalDefects.map(d => d.type).join(", ")}`,
                inspection_id: inspectionId,
                created_by: this.userId,
                ashley_suggestions: JSON.stringify([
                    "Immediate containment of affected products",
                    "Root cause analysis within 24 hours",
                    "Corrective action implementation",
                    "Process verification and validation",
                ]),
            },
        });
        this.emit("capa:auto_generated", { inspectionId, capaNumber });
    }
    async getInspectionById(inspectionId) {
        const inspection = await database_1.db.qCInspection.findUnique({
            where: { id: inspectionId },
            include: {
                inspection_point: true,
                inspector: true,
                criteria_results: true,
                defects: {
                    include: {
                        defect_type: true,
                    },
                },
            },
        });
        if (!inspection) {
            throw new Error("Inspection not found");
        }
        return this.mapDatabaseToInspection(inspection);
    }
    mapDatabaseToInspection(dbInspection) {
        return {
            id: dbInspection.id,
            workspaceId: dbInspection.workspace_id,
            orderId: dbInspection.order_id,
            inspectionPointId: dbInspection.inspection_point_id,
            inspectorId: dbInspection.inspector_id,
            bundleId: dbInspection.bundle_id,
            batchNumber: dbInspection.batch_number,
            inspectionDate: dbInspection.inspection_date,
            status: dbInspection.status,
            overallScore: dbInspection.overall_score || 0,
            passQuantity: dbInspection.pass_quantity,
            failQuantity: dbInspection.fail_quantity,
            reworkQuantity: dbInspection.rework_quantity,
            sampleSize: dbInspection.sample_size,
            inspectionTime: dbInspection.inspection_time || 0,
            notes: dbInspection.notes,
            photos: dbInspection.photos ? JSON.parse(dbInspection.photos) : [],
            ashleyAnalysis: dbInspection.ashley_analysis ? JSON.parse(dbInspection.ashley_analysis) : undefined,
            aiConfidence: dbInspection.ai_confidence,
            criteriaResults: (dbInspection.criteria_results || []).map((cr) => ({
                criteriaName: cr.criteria_name,
                result: cr.result,
                measuredValue: cr.measured_value,
                targetValue: cr.target_value,
                tolerance: cr.tolerance,
                score: cr.score || 0,
                notes: cr.notes,
                photoUrl: cr.photo_url,
                aiDetected: cr.ai_detected,
            })),
            defects: (dbInspection.defects || []).map((defect) => ({
                id: defect.id,
                inspectionId: defect.inspection_id,
                defectTypeId: defect.defect_type_id,
                quantity: defect.quantity,
                location: defect.location,
                description: defect.description,
                photoUrls: defect.photo_urls ? JSON.parse(defect.photo_urls) : [],
                rootCause: defect.root_cause,
                severity: defect.severity,
                status: defect.status,
                costImpact: defect.cost_impact,
                resolution: defect.resolution,
                resolvedBy: defect.resolved_by,
                resolvedAt: defect.resolved_at,
                aiDetected: defect.ai_detected,
                aiConfidence: defect.ai_confidence,
            })),
        };
    }
}
exports.QualityInspectionSystem = QualityInspectionSystem;
