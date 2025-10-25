"use client";

import { User } from "../../lib/permissions";

interface RoleActivitiesProps {
  user: User;
}

// Admin Recent Activities
function AdminActivities() {
  return (
    <div className="space-y-3">
      <div className="rounded-md border-l-4 border-blue-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          System backup completed successfully
        </p>
        <p className="text-xs text-gray-600">1 hour ago • All data backed up</p>
      </div>

      <div className="rounded-md border-l-4 border-green-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          New employee onboarded: Maria Santos
        </p>
        <p className="text-xs text-gray-600">2 hours ago • Sewing Department</p>
      </div>

      <div className="rounded-md border-l-4 border-amber-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Maintenance scheduled for Line 3
        </p>
        <p className="text-xs text-gray-600">
          3 hours ago • Planned downtime this weekend
        </p>
      </div>

      <div className="rounded-md border-l-4 border-purple-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Monthly financial report generated
        </p>
        <p className="text-xs text-gray-600">4 hours ago • Revenue up 12%</p>
      </div>
    </div>
  );
}

// Manager Recent Activities
function ManagerActivities({ user }: { user: User }) {
  const getDepartmentActivities = (department: string) => {
    switch (department) {
      case "Cutting":
        return [
          {
            title: `New cutting order assigned to Line 2`,
            time: "1 hour ago",
            detail: "500 units • Order #ASH-2025-001",
            color: "blue",
          },
          {
            title: `Fabric inventory updated`,
            time: "2 hours ago",
            detail: "1000m cotton fabric received",
            color: "green",
          },
          {
            title: `Efficiency target achieved`,
            time: "3 hours ago",
            detail: "95% efficiency for the week",
            color: "green",
          },
        ];
      case "Printing":
        return [
          {
            title: `Print run completed for Order #ASH-789`,
            time: "30 min ago",
            detail: "300 units • Silkscreen method",
            color: "green",
          },
          {
            title: `New design approved for printing`,
            time: "1 hour ago",
            detail: "Client: Brand XYZ",
            color: "blue",
          },
          {
            title: `Ink inventory low warning`,
            time: "2 hours ago",
            detail: "Red ink below minimum threshold",
            color: "amber",
          },
        ];
      default:
        return [
          {
            title: `Team meeting scheduled`,
            time: "1 hour ago",
            detail: "Weekly review tomorrow 2 PM",
            color: "blue",
          },
          {
            title: `Performance review completed`,
            time: "2 hours ago",
            detail: "Q4 metrics above target",
            color: "green",
          },
          {
            title: `New team member assigned`,
            time: "3 hours ago",
            detail: "Junior operator started today",
            color: "green",
          },
        ];
    }
  };

  const activities = getDepartmentActivities(user.department);

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={index}
          className={`rounded-md border-l-4 bg-gray-50 p-3 border-${activity.color}-500`}
        >
          <p className="mb-1 text-sm font-medium text-gray-900">
            {activity.title}
          </p>
          <p className="text-xs text-gray-600">
            {activity.time} • {activity.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

// Supervisor Recent Activities
function SupervisorActivities({ user }: { user: User }) {
  const getDepartmentTasks = (department: string) => {
    switch (department) {
      case "Cutting":
        return [
          {
            title: `Bundle #B-456 completed cutting`,
            time: "15 min ago",
            detail: "50 units ready for next stage",
            color: "green",
          },
          {
            title: `Operator efficiency check`,
            time: "45 min ago",
            detail: "Line 1 running at 98% efficiency",
            color: "green",
          },
          {
            title: `Material shortage alert`,
            time: "1 hour ago",
            detail: "Blue fabric running low",
            color: "amber",
          },
        ];
      case "Sewing":
        return [
          {
            title: `Sewing run #SR-123 completed`,
            time: "20 min ago",
            detail: "100 units sewn, quality approved",
            color: "green",
          },
          {
            title: `Machine maintenance required`,
            time: "1 hour ago",
            detail: "Overlock machine #5 needs service",
            color: "amber",
          },
          {
            title: `New operator training started`,
            time: "2 hours ago",
            detail: "Teaching basic hem techniques",
            color: "blue",
          },
        ];
      default:
        return [
          {
            title: `Daily production review`,
            time: "30 min ago",
            detail: "All targets met for today",
            color: "green",
          },
          {
            title: `Team briefing completed`,
            time: "1 hour ago",
            detail: "Safety protocols reviewed",
            color: "blue",
          },
          {
            title: `Quality inspection passed`,
            time: "2 hours ago",
            detail: "Batch #456 approved",
            color: "green",
          },
        ];
    }
  };

  const tasks = getDepartmentTasks(user.department);

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={index}
          className={`rounded-md border-l-4 bg-gray-50 p-3 border-${task.color}-500`}
        >
          <p className="mb-1 text-sm font-medium text-gray-900">{task.title}</p>
          <p className="text-xs text-gray-600">
            {task.time} • {task.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

// Operator Recent Activities
function OperatorActivities({ user }: { user: User }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border-l-4 border-green-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Task completed: Bundle #B-789
        </p>
        <p className="text-xs text-gray-600">
          10 min ago • 25 pieces processed
        </p>
      </div>

      <div className="rounded-md border-l-4 border-blue-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          New task assigned: Bundle #B-790
        </p>
        <p className="text-xs text-gray-600">
          30 min ago • 30 pieces to process
        </p>
      </div>

      <div className="rounded-md border-l-4 border-amber-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Break time reminder
        </p>
        <p className="text-xs text-gray-600">
          45 min ago • 15 minute break scheduled
        </p>
      </div>

      <div className="rounded-md border-l-4 border-purple-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Quality check passed
        </p>
        <p className="text-xs text-gray-600">
          1 hour ago • Bundle #B-788 approved
        </p>
      </div>
    </div>
  );
}

// Employee Recent Activities
function EmployeeActivities({ user }: { user: User }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border-l-4 border-blue-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Time clock: Clocked in
        </p>
        <p className="text-xs text-gray-600">8:00 AM • Regular shift started</p>
      </div>

      <div className="rounded-md border-l-4 border-green-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Company announcement
        </p>
        <p className="text-xs text-gray-600">
          2 hours ago • Team meeting tomorrow at 2 PM
        </p>
      </div>

      <div className="rounded-md border-l-4 border-amber-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Payroll processed
        </p>
        <p className="text-xs text-gray-600">
          Yesterday • Check direct deposit
        </p>
      </div>

      <div className="rounded-md border-l-4 border-purple-500 bg-gray-50 p-3">
        <p className="mb-1 text-sm font-medium text-gray-900">
          Training module completed
        </p>
        <p className="text-xs text-gray-600">
          2 days ago • Safety procedures updated
        </p>
      </div>
    </div>
  );
}

export default function RoleActivities({ user }: RoleActivitiesProps) {
  const getActivityTitle = () => {
    switch (user.role) {
      case "admin":
        return "System Activities";
      case "manager":
        return `${user.department} Department Activity`;
      case "designer":
      case "qc_inspector":
        return "Team Activities";
      case "cutting_operator":
      case "printing_operator":
      case "sewing_operator":
      case "finishing_operator":
        return "My Recent Tasks";
      case "warehouse_staff":
      case "finance_staff":
      case "hr_staff":
      case "maintenance_tech":
        return "Recent Activities";
      default:
        return "Recent Activities";
    }
  };

  const renderActivities = () => {
    switch (user.role) {
      case "admin":
        return <AdminActivities />;
      case "manager":
        return <ManagerActivities user={user} />;
      case "designer":
      case "qc_inspector":
        return <SupervisorActivities user={user} />;
      case "cutting_operator":
      case "printing_operator":
      case "sewing_operator":
      case "finishing_operator":
        return <OperatorActivities user={user} />;
      case "warehouse_staff":
      case "finance_staff":
      case "hr_staff":
      case "maintenance_tech":
        return <EmployeeActivities user={user} />;
      default:
        return <EmployeeActivities user={user} />;
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {getActivityTitle()}
      </h2>
      {renderActivities()}
    </div>
  );
}
