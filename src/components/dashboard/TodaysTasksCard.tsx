"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  clientName: string;
  priority: string;
  status: string;
  completed: boolean;
}

interface TodaysTasksCardProps {
  initialTasks: TaskItem[];
}

export const TodaysTasksCard: React.FC<TodaysTasksCardProps> = ({ initialTasks }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks || []);

  const handleToggle = async (task: TaskItem) => {
    const nextState = !task.completed;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextState } : t))
    );

    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          projectId: task.projectId,
          completed: nextState,
        }),
      });

      if (res.ok) {
        toast.success(nextState ? `Completed: "${task.title}"` : `Reopened: "${task.title}"`);
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: !nextState } : t))
        );
        toast.error("Failed to update task");
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !nextState } : t))
      );
      toast.error("Network error");
    }
  };

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
            Today&apos;s Tasks
          </span>
          <span
            style={{
              fontSize: "10.5px",
              color: "var(--text-muted)",
              background: "var(--surface-2)",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            {tasks.filter((t) => !t.completed).length}
          </span>
        </div>

        <Link
          href="/dashboard/projects"
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            textDecoration: "none",
          }}
        >
          View all
        </Link>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {tasks.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "11.5px" }}>
            No tasks pending for today.
          </div>
        ) : (
          tasks.slice(0, 4).map((task, idx) => (
            <div
              key={task.id ? `task-${task.id}` : `task-${idx}`}
              onClick={() => handleToggle(task)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 8px",
                borderRadius: "6px",
                background: task.completed ? "transparent" : "var(--surface-2)",
                cursor: "pointer",
                transition: "all 0.1s ease",
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: "15px",
                  height: "15px",
                  borderRadius: "3px",
                  border: task.completed
                    ? "1px solid var(--color-brand)"
                    : "1px solid var(--border-strong)",
                  background: task.completed ? "var(--color-brand)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {task.completed && <Check size={11} strokeWidth={3} color="var(--color-on-brand)" />}
              </div>

              {/* Title & Client */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 450,
                    color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: task.completed ? "line-through" : "none",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.title}
                </p>
              </div>

              {/* Priority indicator */}
              {task.priority === "high" || task.priority === "urgent" ? (
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#f97316",
                    flexShrink: 0,
                  }}
                />
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
