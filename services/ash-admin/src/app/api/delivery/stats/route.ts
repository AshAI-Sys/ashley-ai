import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkspaceIdFromRequest } from "@/lib/workspace";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    // Calculate delivery statistics using updated_at as proxy for delivery timestamp
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get delivery statistics
    const [
      readyForPickup,
      inTransit,
      deliveredToday,
      failedDeliveries,
      totalShipmentsThisWeek,
      deliveredThisWeek,
      averageDeliveryTimes,
    ] = await Promise.all([
      // Ready for pickup
      prisma.shipment.count({
        where: {
          workspace_id: workspaceId,
          status: "READY_FOR_PICKUP",
        },
      }),

      // In transit (including out for delivery)
      prisma.shipment.count({
        where: {
          workspace_id: workspaceId,
          OR: [{ status: "IN_TRANSIT" }, { status: "OUT_FOR_DELIVERY" }],
        },
      }),

      // Delivered today (using updated_at as proxy for delivery timestamp)
      prisma.shipment.count({
        where: {
          workspace_id: workspaceId,
          status: "DELIVERED",
          updated_at: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Failed deliveries (not resolved)
      prisma.shipment.count({
        where: {
          workspace_id: workspaceId,
          status: "FAILED",
        },
      }),

      // Total shipments this week (for on-time rate calculation)
      prisma.shipment.count({
        where: {
          workspace_id: workspaceId,
          created_at: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Delivered this week (using updated_at as proxy)
      prisma.shipment.count({
        where: {
          workspace_id: workspaceId,
          status: "DELIVERED",
          updated_at: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: new Date(),
          },
        },
      }),

      // Average delivery times (last 50 delivered shipments, using updated_at as delivery time)
      prisma.shipment.findMany({
        where: {
          workspace_id: workspaceId,
          status: "DELIVERED",
        },
        select: {
          created_at: true,
          updated_at: true,
          eta: true,
        },
        orderBy: { updated_at: "desc" },
        take: 50,
      }),
    ]);

    // Calculate on-time rate
    const onTimeRate =
      totalShipmentsThisWeek > 0
        ? (deliveredThisWeek / totalShipmentsThisWeek) * 100
        : 0;

    // Calculate average delivery time (using updated_at as delivery timestamp)
    let avgDeliveryTime = 0;
    if (averageDeliveryTimes.length > 0) {
      const totalDeliveryTime = averageDeliveryTimes.reduce((sum, shipment) => {
        if (shipment.updated_at && shipment.created_at) {
          const deliveryTime =
            shipment.updated_at.getTime() - shipment.created_at.getTime();
          return sum + deliveryTime / (1000 * 60 * 60); // Convert to hours
        }
        return sum;
      }, 0);
      avgDeliveryTime = totalDeliveryTime / averageDeliveryTimes.length;
    }

    // Get on-time performance (deliveries within ETA, using updated_at as delivery time)
    const onTimeDeliveries = averageDeliveryTimes.filter(shipment => {
      if (shipment.updated_at && shipment.eta) {
        return shipment.updated_at <= shipment.eta;
      }
      return false;
    }).length;

    const actualOnTimeRate =
      averageDeliveryTimes.length > 0
        ? (onTimeDeliveries / averageDeliveryTimes.length) * 100
        : 0;

    // Get geographic distribution
    const geographicStats = await getGeographicDistribution();

    // Get method performance
    const methodStats = await getMethodPerformance();

    return NextResponse.json({
      ready_for_pickup: readyForPickup,
      in_transit: inTransit,
      delivered_today: deliveredToday,
      failed_deliveries: failedDeliveries,
      on_time_rate: Math.round(actualOnTimeRate * 10) / 10,
      avg_delivery_time: Math.round(avgDeliveryTime * 10) / 10,
      geographic_distribution: geographicStats,
      method_performance: methodStats,
      period_summary: {
        total_shipments_week: totalShipmentsThisWeek,
        delivered_week: deliveredThisWeek,
        completion_rate: Math.round(onTimeRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error calculating delivery stats:", error);
    return NextResponse.json(
      { error: "Failed to calculate delivery statistics" },
      { status: 500 }
    );
  }
}

async function getGeographicDistribution() {
  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: 100, // Limit to last 100 shipments
      select: { consignee_address: true },
    });

    const cityCount: Record<string, number> = {};

    shipments.forEach(shipment => {
      if (shipment.consignee_address) {
        const address = shipment.consignee_address;

        // Extract city from address (simplified)
        let city = "Other";
        if (address.includes("Quezon City")) city = "Quezon City";
        else if (address.includes("Manila")) city = "Manila";
        else if (address.includes("Makati")) city = "Makati";
        else if (address.includes("BGC") || address.includes("Taguig"))
          city = "BGC/Taguig";
        else if (address.includes("Pasig")) city = "Pasig";
        else if (address.includes("Mandaluyong")) city = "Mandaluyong";

        cityCount[city] = (cityCount[city] || 0) + 1;
      }
    });

    return Object.entries(cityCount).map(([city, count]) => ({
      location: city,
      shipments: count,
      percentage: shipments.length > 0 ? (count / shipments.length) * 100 : 0,
    }));
  } catch (error) {
    console.error("Error calculating geographic distribution:", error);
    return [];
  }
}

async function getMethodPerformance() {
  try {
    const methods = ["DRIVER", "LALAMOVE", "GRAB", "JNT", "LBC"];
    const performance = [];

    for (const method of methods) {
      const [total, delivered, avgTime] = await Promise.all([
        prisma.shipment.count({ where: { method } }),
        prisma.shipment.count({ where: { method, status: "DELIVERED" } }),
        prisma.shipment.findMany({
          where: {
            method,
            status: "DELIVERED",
          },
          select: { created_at: true, updated_at: true },
          take: 20,
          orderBy: { updated_at: "desc" },
        }),
      ]);

      let averageTime = 0;
      if (avgTime.length > 0) {
        const totalTime = avgTime.reduce((sum, shipment) => {
          if (shipment.updated_at) {
            return (
              sum +
              (shipment.updated_at.getTime() - shipment.created_at.getTime())
            );
          }
          return sum;
        }, 0);
        averageTime = totalTime / avgTime.length / (1000 * 60 * 60); // Convert to hours
      }

      performance.push({
        method,
        total_shipments: total,
        delivered: delivered,
        success_rate: total > 0 ? (delivered / total) * 100 : 0,
        avg_delivery_time: Math.round(averageTime * 10) / 10,
      });
    }

    return performance;
  } catch (error) {
    console.error("Error calculating method performance:", error);
    return [];
  }
};
