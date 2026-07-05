"use client";

import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, ChevronLeft, Loader2, Plus, Trash2, Globe, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";

interface PortfolioProject {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  link: string;
}

export default function PortfolioManagerPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load portfolio projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !link) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, link, skills }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setLink("");
        setSkills([]);
        await fetchProjects();
        toast.success("Portfolio project added successfully!");
      }
    } catch (err) {
      console.error("Failed to save portfolio project:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio project?")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== id));
        toast.success("Portfolio project removed.");
      }
    } catch (err) {
      console.error("Failed to delete portfolio project:", err);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "start" }}>
            
            {/* Left: Projects list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", marginBottom: "14px" }}>Portfolio Projects</h3>
                
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                    <Loader2 size={20} color="var(--color-brand)" style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                ) : projects.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No portfolio projects saved yet. Add one on the right to power your AI proposals with relevant work experience.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {projects.map((proj) => (
                      <div key={proj._id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--surface-2)", position: "relative" }}>
                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 6px 0", paddingRight: "20px" }}>{proj.title}</h4>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5", margin: "0 0 10px 0" }}>{proj.description}</p>
                        
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                          {proj.skills.map((s) => (
                            <span key={s} style={{ background: "var(--surface-3)", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                              {s}
                            </span>
                          ))}
                        </div>

                        <a href={proj.link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", color: "var(--color-brand)", textDecoration: "none", fontWeight: 600 }}>
                          <Globe size={12} /> Visit Showcase Project
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Add new project form */}
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", boxShadow: "var(--shadow-md)" }}>
              <h3 className="font-heading" style={{ fontSize: "15px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="var(--color-brand)" /> Add Portfolio Project
              </h3>

              <form onSubmit={handleAddProject} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="input-group">
                  <label className="input-label">Project Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Next.js SaaS Boilerplate"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Project Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what you built, features, and outcomes..."
                    className="input-field"
                    style={{ height: "90px", fontSize: "12.5px", resize: "none", lineHeight: "1.45" }}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Project Showcase Link (URL) *</label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. https://github.com/my-project"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Associated Skills</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                      placeholder="e.g. Next.js, Mongoose"
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddSkill}>
                      <Plus size={13} /> Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                      {skills.map((s) => (
                        <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", border: "1px solid var(--border)" }}>
                          {s}
                          <button type="button" onClick={() => handleRemoveSkill(s)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", padding: 0 }}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={adding}
                  leftIcon={adding ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
                  style={{ marginTop: "6px" }}
                >
                  {adding ? "Saving showcase project..." : "Add to Portfolio"}
                </Button>
              </form>
            </div>
          </div>
        </div>
  );
}
