import { NextRequest } from "next/server";
export declare function POST(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<any>;
export declare function DELETE(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<any>;
