"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const smart_scheduling_1 = require("@/lib/ai/smart-scheduling");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/ai/scheduling/scenario - Analyze what-if scenarios
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const { base_schedule, scenario_type, scenario_data, jobs, resources } = await req.json();
        if (!base_schedule || !scenario_type || !jobs || !resources) {
            return server_1.NextResponse.json({
                error: "Missing required fields: base_schedule, scenario_type, jobs, resources",
            }, { status: 400 });
        }
        // Validate scenario type
        const validTypes = [
            "ADD_JOB",
            "REMOVE_JOB",
            "ADD_RESOURCE",
            "CHANGE_DEADLINE",
        ];
        if (!validTypes.includes(scenario_type)) {
            return server_1.NextResponse.json({
                error: `Invalid scenario_type. Must be one of: ${validTypes.join(", ")}`,
            }, { status: 400 });
        }
        // Build scenario object
        const scenario = { type: scenario_type };
        switch (scenario_type) {
            case "ADD_JOB":
                if (!scenario_data.job) {
                    return server_1.NextResponse.json({ error: "scenario_data.job is required for ADD_JOB" }, { status: 400 });
                }
                scenario.job = scenario_data.job;
                break;
            case "REMOVE_JOB":
                if (!scenario_data.job_id) {
                    return server_1.NextResponse.json({ error: "scenario_data.job_id is required for REMOVE_JOB" }, { status: 400 });
                }
                scenario.job_id = scenario_data.job_id;
                break;
            case "ADD_RESOURCE":
                if (!scenario_data.resource) {
                    return server_1.NextResponse.json({ error: "scenario_data.resource is required for ADD_RESOURCE" }, { status: 400 });
                }
                scenario.resource = scenario_data.resource;
                break;
            case "CHANGE_DEADLINE":
                if (!scenario_data.job_id || !scenario_data.new_deadline) {
                    return server_1.NextResponse.json({
                        error: "scenario_data.job_id and new_deadline are required for CHANGE_DEADLINE",
                    }, { status: 400 });
                }
                scenario.job_id = scenario_data.job_id;
                scenario.new_deadline = new Date(scenario_data.new_deadline);
                break;
        }
        // Parse jobs and resources (convert date strings to Date objects)
        const parsedJobs = jobs.map((j) => ({
            ...j,
            deadline: new Date(j.deadline),
        }));
        const parsedResources = resources.map((r) => ({
            ...r,
        }));
        // Run scenario analysis
        const analysis = await smart_scheduling_1.smartSchedulingAI.analyzeScenario(base_schedule, scenario, parsedJobs, parsedResources);
        return server_1.NextResponse.json({
            success: true,
            analysis,
            analyzed_at: new Date(),
        });
    }
    catch (error) {
        console.error("Scenario analysis error:", error);
        return server_1.NextResponse.json({ error: "Failed to analyze scenario", details: error.message }, { status: 500 });
    }
});
