/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-middleware";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const prisma = new PrismaClient();

// POST - Upload employee profile picture
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (request: NextRequest, user) => {
    try {
      const { id } = params;
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
    }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
          { status: 400 }
        );
    }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        
        return NextResponse.json(
          { error: "File size too large. Maximum 5MB allowed" },
          { status: 400 }
        );
    }

      // Check if employee exists and belongs to user's workspace
      const employee = await prisma.employee.findFirst({
        where: {
          id,
          workspace_id: user.workspaceId,
        },
      });

      if (!employee) {
        
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
    }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads", "employees");
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
    }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const filename = `${id}_${timestamp}.${extension}`;
      const filepath = join(uploadsDir, filename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Delete old profile picture if exists
      if (employee.profile_picture) {
        try {
          const oldFilepath = join(
            process.cwd(),
            "public",
            employee.profile_picture
          );
          }
          if (existsSync(oldFilepath)) {
            await unlink(oldFilepath);
            });
          } catch (error) {
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

    return NextResponse.json({
        success: true,
        profile_picture: profilePictureUrl,
        employee: {
          id: updatedEmployee.id,
          first_name: updatedEmployee.first_name,
          last_name: updatedEmployee.last_name,
          profile_picture: updatedEmployee.profile_picture,
        },
});
} catch (error) {
      console.error("Error uploading employee profile picture:", error);
      return NextResponse.json(
        { error: "Failed to upload profile picture" },
        { status: 500 }
      );
    }
  }

// DELETE - Remove employee profile picture
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (request: NextRequest, user) => {
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
        
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
    }
    }

      if (!employee.profile_picture) {
        
        return NextResponse.json(
          { error: "No profile picture to delete" },
          { status: 400 }
        );
    }

      // Delete file from filesystem
      try {
        const filepath = join(
          process.cwd(),
          "public",
          employee.profile_picture
        );
        if (existsSync(filepath)) {
          await unlink(filepath);
          });
        } catch (error) {
        console.error("Error deleting profile picture file:", error);
    }

      // Update employee to remove profile picture
      await prisma.employee.update({
        where: { id },
        data: {
          profile_picture: null,
          updated_at: new Date(),
        },

      return NextResponse.json({
        success: true,
        message: "Profile picture deleted successfully",
    } catch (error) {
      console.error("Error deleting employee profile picture:", error);
      return NextResponse.json(
        { error: "Failed to delete profile picture" },
        { status: 500 }
      );
    }
});