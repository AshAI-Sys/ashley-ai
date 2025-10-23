import { NextRequest, NextResponse } from "next/server";
import { smartSchedulingAI } from "@/lib/ai/smart-scheduling";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/ai/scheduling/scenario - Analyze what-if scenarios
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const { base_schedule, scenario_type, scenario_data, jobs, resources } =
      await req.json();

    if (!base_schedule || !scenario_type || !jobs || !resources) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: base_schedule, scenario_type, jobs, resources",
        },
        { status: 400 }
      );
    }

    // Validate scenario type
    const validTypes = [
      "ADD_JOB",
      "REMOVE_JOB",
      "ADD_RESOURCE",
      "CHANGE_DEADLINE",
    ];
    if (!validTypes.includes(scenario_type)) {
      return NextResponse.json(
        {
          error: `Invalid scenario_type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build scenario object
    const scenario: any = { type: scenario_type };

    switch (scenario_type) {
      case "ADD_JOB":
        if (!scenario_data.job) {
          return NextResponse.json(
            { error: "scenario_data.job is required for ADD_JOB" },
            { status: 400 }
          );
        }
        scenario.job = scenario_data.job;
        break;

      case "REMOVE_JOB":
        if (!scenario_data.job_id) {
          return NextResponse.json(
            { error: "scenario_data.job_id is required for REMOVE_JOB" },
            { status: 400 }
          );
        }
        scenario.job_id = scenario_data.job_id;
        break;

      case "ADD_RESOURCE":
        if (!scenario_data.resource) {
          return NextResponse.json(
            { error: "scenario_data.resource is required for ADD_RESOURCE" },
            { status: 400 }
          );
        }
        scenario.resource = scenario_data.resource;
        break;

      case "CHANGE_DEADLINE":
        if (!scenario_data.job_id || !scenario_data.new_deadline) {
          return NextResponse.json(
            {
              error:
                "scenario_data.job_id and new_deadline are required for CHANGE_DEADLINE",
            },
            { status: 400 }
          );
        }
        scenario.job_id = scenario_data.job_id;
        scenario.new_deadline = new Date(scenario_data.new_deadline);
        break;
    }

    // Parse jobs and resources (convert date strings to Date objects)
    const parsedJobs = jobs.map((j: any) => ({
      ...j,
      deadline: new Date(j.deadline),
    }));

    const parsedResources = resources.map((r: any) => ({
      ...r,
    }));

    // Run scenario analysis
    const analysis = await smartSchedulingAI.analyzeScenario(
      base_schedule,
      scenario,
      parsedJobs,
      parsedResources
    );

    return NextResponse.json({
      success: true,
      analysis,
      analyzed_at: new Date(),
    });
  } catch (error: any) {
    console.error("Scenario analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze scenario", details: error.message },
      { status: 500 }
    );
  }
});
