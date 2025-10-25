"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.DELETE = DELETE;
/* eslint-disable */
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("@/lib/auth-middleware");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const prisma = new client_1.PrismaClient();
// POST - Upload employee profile picture
async function POST(request, { params }) {
    return (0, auth_middleware_1.requireAuth)(async (request, user) => {
        try {
            const { id } = params;
            const formData = await request.formData();
            const file = formData.get("file");
            if (!file) {
                return server_1.NextResponse.json({ error: "No file provided" }, { status: 400 });
            }
            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                return server_1.NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" }, { status: 400 });
            }
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return server_1.NextResponse.json({ error: "File size too large. Maximum 5MB allowed" }, { status: 400 });
            }
            // Check if employee exists and belongs to user's workspace
            const employee = await prisma.employee.findFirst({
                where: {
                    id,
                    workspace_id: user.workspaceId,
                },
            });
            if (!employee) {
                return server_1.NextResponse.json({ error: "Employee not found" }, { status: 404 });
            }
            // Create uploads directory if it doesn't exist
            const uploadsDir = (0, path_1.join)(process.cwd(), "public", "uploads", "employees");
            if (!(0, fs_1.existsSync)(uploadsDir)) {
                (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
            }
            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split(".").pop();
            const filename = `${id}_${timestamp}.${extension}`;
            const filepath = (0, path_1.join)(uploadsDir, filename);
            // Convert file to buffer and save
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await (0, promises_1.writeFile)(filepath, buffer);
            // Delete old profile picture if exists
            if (employee.profile_picture) {
                try {
                    const oldFilepath = (0, path_1.join)(process.cwd(), "public", employee.profile_picture);
                }
                finally {
                }
                if ((0, fs_1.existsSync)(oldFilepath)) {
                    await (0, promises_1.unlink)(oldFilepath);
                }
            }
        }
        finally { }
    });
}
try { }
catch (error) {
    console.error("Error deleting old profile picture:", error);
}
// Update employee with new profile picture URL
const profilePictureUrl = `/uploads/employees/${filename}`;
const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: {
        profile_picture: profilePictureUrl,
        updated_at: new Date(),
    },
});
return server_1.NextResponse.json({
    success: true,
    profile_picture: profilePictureUrl,
    employee: {
        id: updatedEmployee.id,
        first_name: updatedEmployee.first_name,
        last_name: updatedEmployee.last_name,
        profile_picture: updatedEmployee.profile_picture,
    },
});
try { }
catch (error) {
    console.error("Error uploading employee profile picture:", error);
    return server_1.NextResponse.json({ error: "Failed to upload profile picture" }, { status: 500 });
}
// DELETE - Remove employee profile picture
async function DELETE(request, { params }) {
    return (0, auth_middleware_1.requireAuth)(async (request, user) => {
        try {
            const { id } = params;
            // Check if employee exists and belongs to user's workspace
            const employee = await prisma.employee.findFirst({
                where: {
                    id,
                    workspace_id: user.workspaceId,
                },
            });
            if (!employee) {
                return server_1.NextResponse.json({ error: "Employee not found" }, { status: 404 });
            }
        }
        finally {
        }
        if (!employee.profile_picture) {
            return server_1.NextResponse.json({ error: "No profile picture to delete" }, { status: 400 });
        }
        // Delete file from filesystem
        try {
            const filepath = (0, path_1.join)(process.cwd(), "public", employee.profile_picture);
            if ((0, fs_1.existsSync)(filepath)) {
                await (0, promises_1.unlink)(filepath);
            }
        }
        finally { }
    });
}
try { }
catch (error) {
    console.error("Error deleting profile picture file:", error);
}
// Update employee to remove profile picture
await prisma.employee.update({
    where: { id },
    data: {
        profile_picture: null,
        updated_at: new Date(),
    },
    return: server_1.NextResponse.json({
        success: true,
        message: "Profile picture deleted successfully",
    }), catch(error) {
        console.error("Error deleting employee profile picture:", error);
        return server_1.NextResponse.json({ error: "Failed to delete profile picture" }, { status: 500 });
    }
});
