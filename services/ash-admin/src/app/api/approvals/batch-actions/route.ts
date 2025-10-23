import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {;
    const body = await request.json();
    const { approval_ids, action, template_id, message, extension_days } = body;

    // Validate input
    if (
      !approval_ids ||
      !Array.isArray(approval_ids) ||
      approval_ids.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "No approvals selected" },
        { status: 400 }
      );
    }

    if (
      !["send_reminder", "extend_expiry", "cancel_approval"].includes(action)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    // Get approvals with related data
    const approvals = await prisma.designApproval.findMany({
      where: {
        id: { in: approval_ids },
        status: "SENT", // Only process sent approvals
      },
      include: {
        design_asset: {
          include: {
            order: {
              include: {
                client: true,
              },
            },
            brand: true,
          },
        },
        client: true,
      },
    });

    if (approvals.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid approvals found" },
        { status: 404 }
      );
    }

    const results = {
      processed: 0,
      errors: [] as string[],
    };

    switch (action) {
      case "send_reminder":
        for (const approval of approvals) {
          try {
            // Generate reminder email
            const portalUrl =
              process.env.NODE_ENV === "production"
                ? "https://portal.ashleyai.com"
                : "http://localhost:3003";
            const approvalLink = `${portalUrl}/approval/${approval.portal_token}`;

            const emailContent = message
              .replace("{{client_name}}", approval.client.name)
              .replace("{{design_name}}", approval.design_asset.name)
              .replace("{{approval_link}}", approvalLink)
              .replace(
                "{{expiry_date}}",
                approval.expires_at?.toLocaleDateString() || "Not set"
              );

            const reminderEmail = {
              to: approval.client.email || "",
              subject: `Reminder: Design Approval Pending - ${approval.design_asset.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Approval Reminder</h2>
                  <div style="white-space: pre-line; margin: 20px 0;">
                    ${emailContent}
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${approvalLink}" 
                       style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Review Design Now
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
                    <p>Best regards,<br>Ashley AI Team</p>
                  </div>
                </div>
              `,
            };

            // TODO: Send email via email service
            console.log("Reminder email would be sent:", reminderEmail);

            // Create audit log
            await prisma.auditLog.create({
              data: {
                workspace_id: approval.design_asset.workspace_id,
                user_id: "system",
                action: "APPROVAL_REMINDER_SENT",
                resource: "design_approval",
                resource_id: approval.id,
                new_values: JSON.stringify({
                  template_id,
                  client_email: approval.client.email,
                }),
              },
            }

            results.processed++;
          } catch (error) {
            console.error(
              `Error sending reminder for approval ${approval.id}:`,
              error
            );
            results.errors.push(
              `Failed to send reminder for ${approval.design_asset.name}`
            );
          }
        }
        break;

      case "extend_expiry":
        if (!extension_days || extension_days < 1) {
          return NextResponse.json(
            { success: false, message: "Invalid extension period" },
            { status: 400 }
          );
    }

        for (const approval of approvals) {
          try {
            const newExpiryDate = new Date();
            newExpiryDate.setDate(
              newExpiryDate.getDate() + parseInt(extension_days)
            );

            await prisma.designApproval.update({
              where: { id: approval.id },
              data: { expires_at: newExpiryDate },
            });

            // Create audit log
            await prisma.auditLog.create({
              data: {
                workspace_id: approval.design_asset.workspace_id,
                user_id: "system",
                action: "APPROVAL_EXTENDED",
                resource: "design_approval",
                resource_id: approval.id,
                old_values: JSON.stringify({ expires_at: approval.expires_at }),
                new_values: JSON.stringify({
                  expires_at: newExpiryDate,
                  extension_days: extension_days,
                }),
              },
            }

            results.processed++;
          } catch (error) {
            console.error(`Error extending approval ${approval.id}:`, error);
            results.errors.push(
              `Failed to extend expiry for ${approval.design_asset.name}`
            );
          }
        }
        break;

      case "cancel_approval":
        for (const approval of approvals) {
          try {
            await prisma.designApproval.update({
              where: { id: approval.id },
              data: {
                status: "CANCELLED",
              },
            });

            // Create audit log
            await prisma.auditLog.create({
              data: {
                workspace_id: approval.design_asset.workspace_id,
                user_id: "system",
                action: "APPROVAL_CANCELLED",
                resource: "design_approval",
                resource_id: approval.id,
                old_values: JSON.stringify({ status: approval.status }),
                new_values: JSON.stringify({ status: "CANCELLED" }),
              },
            }

            results.processed++;
          } catch (error) {
            console.error(`Error cancelling approval ${approval.id}:`, error);
            results.errors.push(
              `Failed to cancel approval for ${approval.design_asset.name}`
            );
          });
        }
        break;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.processed} approval${results.processed !== 1 ? "s" : ""}`,
      data: {
        processed: results.processed,
        total: approval_ids.length,
        errors: results.errors,
      },
    }
  } catch (error) {
    console.error("Error processing batch actions:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
