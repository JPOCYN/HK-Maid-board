"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { FREQUENCY_TYPE, FrequencyType, TIME_BLOCK, TimeBlock } from "@/lib/task-constants";

type Template = {
  id: string;
  title: string;
  notes: string | null;
  timeBlock: TimeBlock;
  frequencyType: FrequencyType;
  weekdays: number[] | null;
  isActive: boolean;
};

type FormState = {
  title: string;
  notes: string;
  timeBlock: TimeBlock;
  frequencyType: FrequencyType;
  weekdays: number[];
  isActive: boolean;
};

type PresetTask = {
  key:
    | "presetPrepareBreakfast"
    | "presetLaundry"
    | "presetKitchenClean"
    | "presetVacuum"
    | "presetBathroom"
    | "presetTrash";
  timeBlock: TimeBlock;
  frequencyType: FrequencyType;
  weekdays?: number[];
  notes?: string;
};

const initialForm: FormState = {
  title: "",
  notes: "",
  timeBlock: TIME_BLOCK.MORNING,
  frequencyType: FREQUENCY_TYPE.DAILY,
  weekdays: [1, 2, 3, 4, 5],
  isActive: true,
};

export function TaskManager() {
  const { t } = useTranslation();
  const a = t.admin;
  const brd = t.board;

  const [tasks, setTasks] = useState<Template[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [presetLoadingKey, setPresetLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets: PresetTask[] = [
    { key: "presetPrepareBreakfast", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.DAILY, notes: "Simple and healthy meal" },
    { key: "presetLaundry", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 3, 5] },
    { key: "presetKitchenClean", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
    { key: "presetVacuum", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 3, 5] },
    { key: "presetBathroom", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [2, 4, 6] },
    { key: "presetTrash", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
  ];

  async function loadTasks() {
    const response = await fetch("/api/admin/tasks", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed loading tasks");
    const payload: Template[] = await response.json();
    setTasks(payload);
  }

  useEffect(() => {
    void loadTasks().catch(() => setError("Could not load tasks."));
  }, []);

  const formTitle = useMemo(() => (editingId ? a.editTemplate : a.createTemplate), [editingId, a]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function startEdit(task: Template) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      notes: task.notes ?? "",
      timeBlock: task.timeBlock,
      frequencyType: task.frequencyType,
      weekdays: task.weekdays ?? [1, 2, 3, 4, 5],
      isActive: task.isActive,
    });
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        notes: form.notes.trim() ? form.notes.trim() : null,
        timeBlock: form.timeBlock,
        frequencyType: form.frequencyType,
        weekdays: form.frequencyType === FREQUENCY_TYPE.WEEKDAYS ? form.weekdays : [],
        isActive: form.isActive,
      };

      const response = await fetch(editingId ? `/api/admin/tasks/${editingId}` : "/api/admin/tasks", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Save failed");
      }

      await loadTasks();
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function addPresetTask(preset: PresetTask) {
    setPresetLoadingKey(preset.key);
    setError(null);
    try {
      const payload = {
        title: a[preset.key],
        notes: preset.notes ?? null,
        timeBlock: preset.timeBlock,
        frequencyType: preset.frequencyType,
        weekdays: preset.frequencyType === FREQUENCY_TYPE.WEEKDAYS ? (preset.weekdays ?? [1, 2, 3, 4, 5]) : [],
        isActive: true,
      };
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Save failed");
      }
      await loadTasks();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setPresetLoadingKey(null);
    }
  }

  async function deleteTask(id: string) {
    const confirmed = window.confirm(a.deleteConfirm);
    if (!confirmed) return;

    const response = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadTasks();
    } else {
      setError("Could not delete task.");
    }
  }

  function toggleWeekday(day: number) {
    setForm((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((item) => item !== day)
        : [...current.weekdays, day].sort((x, y) => x - y),
    }));
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>{a.quickAddTitle}</h2>
        <p style={{ color: "var(--muted)", marginTop: "-0.25rem" }}>{a.quickAddHint}</p>
        <div style={{ display: "grid", gap: "0.6rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {presets.map((preset) => (
            <div
              key={preset.key}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "0.7rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{a[preset.key]}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                  {preset.timeBlock.toLowerCase()} · {preset.frequencyType === FREQUENCY_TYPE.DAILY ? a.daily : a.selectedWeekdays}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => addPresetTask(preset)}
                disabled={presetLoadingKey === preset.key}
              >
                {presetLoadingKey === preset.key ? a.saving : a.addNow}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>{formTitle}</h2>
        <form onSubmit={saveTask}>
          <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div>
              <label className="label" htmlFor="title">
                {a.taskTitle}
              </label>
              <input
                id="title"
                className="input"
                required
                value={form.title}
                onChange={(event) => setForm((cur) => ({ ...cur, title: event.target.value }))}
              />
            </div>
            <div>
              <label className="label" htmlFor="timeBlock">
                {a.timeBlock}
              </label>
              <select
                id="timeBlock"
                className="select"
                value={form.timeBlock}
                onChange={(event) => setForm((cur) => ({ ...cur, timeBlock: event.target.value as TimeBlock }))}
              >
                <option value={TIME_BLOCK.MORNING}>{brd.morning}</option>
                <option value={TIME_BLOCK.AFTERNOON}>{brd.afternoon}</option>
                <option value={TIME_BLOCK.EVENING}>{brd.evening}</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "0.8rem" }}>
            <label className="label" htmlFor="notes">
              {a.notes}
            </label>
            <textarea
              id="notes"
              className="textarea"
              value={form.notes}
              onChange={(event) => setForm((cur) => ({ ...cur, notes: event.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "0.8rem" }}>
            <div>
              <label className="label" htmlFor="frequency">
                {a.frequency}
              </label>
              <select
                id="frequency"
                className="select"
                value={form.frequencyType}
                onChange={(event) => setForm((cur) => ({ ...cur, frequencyType: event.target.value as FrequencyType }))}
              >
                <option value={FREQUENCY_TYPE.DAILY}>{a.daily}</option>
                <option value={FREQUENCY_TYPE.WEEKDAYS}>{a.specificWeekdays}</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: "1.2rem" }}>
              <label style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((cur) => ({ ...cur, isActive: event.target.checked }))}
                />
                {a.activeTemplate}
              </label>
            </div>
          </div>

          {form.frequencyType === FREQUENCY_TYPE.WEEKDAYS ? (
            <div style={{ marginTop: "0.8rem" }}>
              <div className="label">{a.weekdays}</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {a.weekdayNames.map((label, day) => (
                  <button
                    type="button"
                    key={day}
                    className="btn"
                    onClick={() => toggleWeekday(day)}
                    style={{
                      background: form.weekdays.includes(day) ? "#dce7ff" : "#f3f6fc",
                      color: form.weekdays.includes(day) ? "#1d3b82" : "#334155",
                      padding: "0.45rem 0.7rem",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <p style={{ color: "#9b1c1c" }}>{error}</p> : null}
          <div style={{ display: "flex", gap: "0.55rem", marginTop: "0.8rem" }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? a.saving : editingId ? a.updateTemplate : a.createTemplateBtn}
            </button>
            {editingId ? (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                {a.cancelEdit}
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>{a.taskTemplates}</h2>
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {tasks.map((task) => (
            <article key={task.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{task.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    {task.timeBlock.toLowerCase()} · {task.frequencyType === FREQUENCY_TYPE.DAILY ? a.daily : a.selectedWeekdays}
                  </div>
                  {task.notes ? <div style={{ marginTop: "0.25rem", color: "var(--muted)" }}>{task.notes}</div> : null}
                  {!task.isActive ? (
                    <div className="pill pill-skipped" style={{ marginTop: "0.4rem" }}>
                      {a.inactive}
                    </div>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className="btn btn-secondary" onClick={() => startEdit(task)}>
                    {a.edit}
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteTask(task.id)}>
                    {a.delete}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {tasks.length === 0 ? <div style={{ color: "var(--muted)" }}>{a.noTemplates}</div> : null}
        </div>
      </section>
    </div>
  );
}
