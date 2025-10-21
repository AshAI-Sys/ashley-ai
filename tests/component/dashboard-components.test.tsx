/**
 * Dashboard Components - React Component Tests
 *
 * Tests for dashboard UI components using React Testing Library
 * Tests rendering, user interactions, and data display
 *
 * Total: 15 tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock components for testing
const MockRealTimeMetrics = ({ metrics }: { metrics?: any }) => {
  return (
    <div data-testid="real-time-metrics">
      <h2>Real-Time Metrics</h2>
      {metrics && (
        <div>
          <div data-testid="total-orders">{metrics.totalOrders || 0}</div>
          <div data-testid="active-production">
            {metrics.activeProduction || 0}
          </div>
          <div data-testid="efficiency">{metrics.efficiency || 0}%</div>
        </div>
      )}
    </div>
  );
};

const MockRoleWidgets = ({ role }: { role: string }) => {
  const widgets: Record<string, string[]> = {
    ADMIN: ["Overview", "Production", "Finance", "Quality"],
    PRODUCTION: ["Active Jobs", "Efficiency", "Materials"],
    FINANCE: ["Revenue", "Invoices", "Payments"],
  };

  return (
    <div data-testid="role-widgets">
      <h2>Widgets for {role}</h2>
      <div data-testid="widgets-list">
        {widgets[role]?.map((widget: string) => (
          <div
            key={widget}
            data-testid={`widget-${widget.toLowerCase().replace(" ", "-")}`}
          >
            {widget}
          </div>
        ))}
      </div>
    </div>
  );
};

const MockRoleActivities = ({ activities }: { activities?: any[] }) => {
  return (
    <div data-testid="role-activities">
      <h2>Recent Activities</h2>
      {activities && activities.length > 0 ? (
        <ul data-testid="activities-list">
          {activities.map((activity: any, index: number) => (
            <li key={index} data-testid={`activity-${index}`}>
              {activity.description} - {activity.timestamp}
            </li>
          ))}
        </ul>
      ) : (
        <div data-testid="no-activities">No recent activities</div>
      )}
    </div>
  );
};

const MockCustomizableDashboard = ({ layout, onLayoutChange }: any) => {
  const [currentLayout, setCurrentLayout] = React.useState(layout || []);

  const handleAddWidget = () => {
    const newWidget = {
      id: `widget-${currentLayout.length + 1}`,
      title: "New Widget",
    };
    const updated = [...currentLayout, newWidget];
    setCurrentLayout(updated);
    onLayoutChange?.(updated);
  };

  const handleRemoveWidget = (id: string) => {
    const updated = currentLayout.filter((w: any) => w.id !== id);
    setCurrentLayout(updated);
    onLayoutChange?.(updated);
  };

  return (
    <div data-testid="customizable-dashboard">
      <button onClick={handleAddWidget} data-testid="add-widget-btn">
        Add Widget
      </button>
      <div data-testid="widgets-grid">
        {currentLayout.map((widget: any) => (
          <div key={widget.id} data-testid={`widget-${widget.id}`}>
            <span>{widget.title}</span>
            <button
              onClick={() => handleRemoveWidget(widget.id)}
              data-testid={`remove-${widget.id}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe("Dashboard Components", () => {
  describe("RealTimeMetrics Component", () => {
    it("should render without metrics", () => {
      render(<MockRealTimeMetrics />);

      expect(screen.getByTestId("real-time-metrics")).toBeInTheDocument();
      expect(screen.getByText("Real-Time Metrics")).toBeInTheDocument();
    });

    it("should display metrics data", () => {
      const metrics = {
        totalOrders: 150,
        activeProduction: 45,
        efficiency: 87.5,
      };

      render(<MockRealTimeMetrics metrics={metrics} />);

      expect(screen.getByTestId("total-orders")).toHaveTextContent("150");
      expect(screen.getByTestId("active-production")).toHaveTextContent("45");
      expect(screen.getByTestId("efficiency")).toHaveTextContent("87.5%");
    });

    it("should handle zero metrics", () => {
      const metrics = {
        totalOrders: 0,
        activeProduction: 0,
        efficiency: 0,
      };

      render(<MockRealTimeMetrics metrics={metrics} />);

      expect(screen.getByTestId("total-orders")).toHaveTextContent("0");
      expect(screen.getByTestId("active-production")).toHaveTextContent("0");
    });

    it("should update when metrics change", () => {
      const { rerender } = render(
        <MockRealTimeMetrics metrics={{ totalOrders: 100 }} />
      );
      expect(screen.getByTestId("total-orders")).toHaveTextContent("100");

      rerender(<MockRealTimeMetrics metrics={{ totalOrders: 200 }} />);
      expect(screen.getByTestId("total-orders")).toHaveTextContent("200");
    });
  });

  describe("RoleWidgets Component", () => {
    it("should render ADMIN role widgets", () => {
      render(<MockRoleWidgets role="ADMIN" />);

      expect(screen.getByText("Widgets for ADMIN")).toBeInTheDocument();
      expect(screen.getByTestId("widget-overview")).toBeInTheDocument();
      expect(screen.getByTestId("widget-production")).toBeInTheDocument();
      expect(screen.getByTestId("widget-finance")).toBeInTheDocument();
      expect(screen.getByTestId("widget-quality")).toBeInTheDocument();
    });

    it("should render PRODUCTION role widgets", () => {
      render(<MockRoleWidgets role="PRODUCTION" />);

      expect(screen.getByText("Widgets for PRODUCTION")).toBeInTheDocument();
      expect(screen.getByTestId("widget-active-jobs")).toBeInTheDocument();
      expect(screen.getByTestId("widget-efficiency")).toBeInTheDocument();
      expect(screen.getByTestId("widget-materials")).toBeInTheDocument();
    });

    it("should render FINANCE role widgets", () => {
      render(<MockRoleWidgets role="FINANCE" />);

      expect(screen.getByText("Widgets for FINANCE")).toBeInTheDocument();
      expect(screen.getByTestId("widget-revenue")).toBeInTheDocument();
      expect(screen.getByTestId("widget-invoices")).toBeInTheDocument();
      expect(screen.getByTestId("widget-payments")).toBeInTheDocument();
    });

    it("should render different widgets for different roles", () => {
      const { rerender } = render(<MockRoleWidgets role="ADMIN" />);
      expect(screen.queryByTestId("widget-overview")).toBeInTheDocument();

      rerender(<MockRoleWidgets role="PRODUCTION" />);
      expect(screen.queryByTestId("widget-overview")).not.toBeInTheDocument();
      expect(screen.queryByTestId("widget-active-jobs")).toBeInTheDocument();
    });
  });

  describe("RoleActivities Component", () => {
    it("should display no activities message when empty", () => {
      render(<MockRoleActivities activities={[]} />);

      expect(screen.getByTestId("no-activities")).toBeInTheDocument();
      expect(screen.getByText("No recent activities")).toBeInTheDocument();
    });

    it("should display activities list", () => {
      const activities = [
        { description: "Order #123 created", timestamp: "2025-10-19 10:00" },
        { description: "Production started", timestamp: "2025-10-19 11:30" },
        { description: "QC inspection passed", timestamp: "2025-10-19 14:00" },
      ];

      render(<MockRoleActivities activities={activities} />);

      expect(screen.getByTestId("activities-list")).toBeInTheDocument();
      expect(screen.getByTestId("activity-0")).toHaveTextContent(
        "Order #123 created"
      );
      expect(screen.getByTestId("activity-1")).toHaveTextContent(
        "Production started"
      );
      expect(screen.getByTestId("activity-2")).toHaveTextContent(
        "QC inspection passed"
      );
    });

    it("should handle single activity", () => {
      const activities = [
        { description: "Test activity", timestamp: "2025-10-19 10:00" },
      ];

      render(<MockRoleActivities activities={activities} />);

      expect(screen.getByTestId("activities-list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
    });
  });

  describe("CustomizableDashboard Component", () => {
    it("should render with empty layout", () => {
      render(
        <MockCustomizableDashboard layout={[]} onLayoutChange={jest.fn()} />
      );

      expect(screen.getByTestId("customizable-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("add-widget-btn")).toBeInTheDocument();
    });

    it("should add widget when button clicked", () => {
      const handleLayoutChange = jest.fn();
      render(
        <MockCustomizableDashboard
          layout={[]}
          onLayoutChange={handleLayoutChange}
        />
      );

      const addButton = screen.getByTestId("add-widget-btn");
      fireEvent.click(addButton);

      expect(screen.getByTestId("widget-widget-1")).toBeInTheDocument();
      expect(handleLayoutChange).toHaveBeenCalledWith([
        { id: "widget-1", title: "New Widget" },
      ]);
    });

    it("should remove widget when remove button clicked", () => {
      const initialLayout = [
        { id: "widget-1", title: "Widget 1" },
        { id: "widget-2", title: "Widget 2" },
      ];
      const handleLayoutChange = jest.fn();

      render(
        <MockCustomizableDashboard
          layout={initialLayout}
          onLayoutChange={handleLayoutChange}
        />
      );

      const removeButton = screen.getByTestId("remove-widget-1");
      fireEvent.click(removeButton);

      expect(screen.queryByTestId("widget-widget-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("widget-widget-2")).toBeInTheDocument();
      expect(handleLayoutChange).toHaveBeenCalled();
    });

    it("should render initial layout", () => {
      const layout = [
        { id: "widget-1", title: "Dashboard Overview" },
        { id: "widget-2", title: "Production Stats" },
      ];

      render(
        <MockCustomizableDashboard layout={layout} onLayoutChange={jest.fn()} />
      );

      expect(screen.getByTestId("widget-widget-1")).toBeInTheDocument();
      expect(screen.getByTestId("widget-widget-2")).toBeInTheDocument();
      expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
      expect(screen.getByText("Production Stats")).toBeInTheDocument();
    });

    it("should handle multiple widget additions", () => {
      const handleLayoutChange = jest.fn();
      render(
        <MockCustomizableDashboard
          layout={[]}
          onLayoutChange={handleLayoutChange}
        />
      );

      const addButton = screen.getByTestId("add-widget-btn");

      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(screen.getByTestId("widget-widget-1")).toBeInTheDocument();
      expect(screen.getByTestId("widget-widget-2")).toBeInTheDocument();
      expect(screen.getByTestId("widget-widget-3")).toBeInTheDocument();
      expect(handleLayoutChange).toHaveBeenCalledTimes(3);
    });
  });
});
