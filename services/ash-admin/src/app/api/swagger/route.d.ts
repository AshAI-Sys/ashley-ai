import { NextResponse } from "next/server";
export declare function GET(): Promise<NextResponse<{
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact: {
            name: string;
            email: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
    paths: {
        "/auth/login": {
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                    };
                                    password: {
                                        type: string;
                                        format: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        token: {
                                            type: string;
                                        };
                                        user: {
                                            $ref: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    "401": {
                        description: string;
                    };
                    "429": {
                        description: string;
                    };
                };
            };
        };
        "/analytics/metrics": {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                    description: string;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        data: {
                                            type: string;
                                            properties: {
                                                production: {
                                                    $ref: string;
                                                };
                                                financial: {
                                                    $ref: string;
                                                };
                                                quality: {
                                                    $ref: string;
                                                };
                                                employee: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        "/email/queue": {
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    type: {
                                        type: string;
                                        enum: string[];
                                    };
                                    to: {
                                        type: string;
                                        format: string;
                                    };
                                    data: {
                                        type: string;
                                    };
                                    scheduledFor: {
                                        type: string;
                                        format: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        jobId: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    components: {
        schemas: {
            User: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    email: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            ProductionMetrics: {
                type: string;
                properties: {
                    total_orders: {
                        type: string;
                    };
                    orders_in_production: {
                        type: string;
                    };
                    total_pieces_produced: {
                        type: string;
                    };
                    on_time_delivery_rate: {
                        type: string;
                    };
                };
            };
            FinancialMetrics: {
                type: string;
                properties: {
                    total_revenue: {
                        type: string;
                    };
                    revenue_this_month: {
                        type: string;
                    };
                    outstanding_amount: {
                        type: string;
                    };
                    profit_margin: {
                        type: string;
                    };
                };
            };
            QualityMetrics: {
                type: string;
                properties: {
                    total_inspections: {
                        type: string;
                    };
                    pass_rate: {
                        type: string;
                    };
                    defect_rate: {
                        type: string;
                    };
                };
            };
            EmployeeMetrics: {
                type: string;
                properties: {
                    total_employees: {
                        type: string;
                    };
                    active_employees: {
                        type: string;
                    };
                    attendance_rate: {
                        type: string;
                    };
                };
            };
        };
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            };
        };
    };
    security: {
        bearerAuth: any[];
    }[];
}>>;
