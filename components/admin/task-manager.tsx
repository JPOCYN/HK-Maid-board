"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { FREQUENCY_TYPE, FrequencyType, TIME_BLOCK, TimeBlock } from "@/lib/task-constants";

type Template = {
  id: string;
  title: string;
  notes: string | null;
  timeBlock: TimeBlock;
  frequencyType: FrequencyType;
  weekdays: number[] | null;
  oneTimeDate: string | null;
};

type FormState = {
  title: string;
  notes: string;
  timeBlock: TimeBlock;
  frequencyType: FrequencyType;
  weekdays: number[];
  oneTimeDate: string;
};

type PresetTask = {
  key:
    | "presetPrepareBreakfast"
    | "presetMilkTeaToast"
    | "presetCookDinnerSoup"
    | "presetDishwashing"
    | "presetLaundry"
    | "presetIronUniform"
    | "presetKitchenClean"
    | "presetVacuum"
    | "presetMopFloor"
    | "presetBathroom"
    | "presetTrash"
    | "presetMarketShopping"
    | "presetPharmacyRun"
    | "presetSchoolBags"
    | "presetHomeworkCheck"
    | "presetChangeBedsheets"
    | "presetWindowCleaning"
    | "presetFridgeOrganize"
    | "presetPackSchoolLunch"
    | "presetSteamRice"
    | "presetWipeDiningTable"
    | "presetSanitizeToys"
    | "presetBathKids"
    | "presetCollectParcels"
    | "presetWaterPlants"
    | "presetWalkDog";
  categoryKey:
    | "quickCategoryMeals"
    | "quickCategoryCleaning"
    | "quickCategoryKids"
    | "quickCategoryErrands"
    | "quickCategoryWeekly"
    | "quickCategoryHomeCare"
    | "quickCategoryPets";
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
  oneTimeDate: "",
};

const presetCatalog: PresetTask[] = [
  { key: "presetPrepareBreakfast", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetMilkTeaToast", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 2, 3, 4, 5] },
  { key: "presetPackSchoolLunch", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 2, 3, 4, 5] },
  { key: "presetSteamRice", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetCookDinnerSoup", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetDishwashing", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetWipeDiningTable", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetKitchenClean", categoryKey: "quickCategoryMeals", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetVacuum", categoryKey: "quickCategoryCleaning", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 3, 5] },
  { key: "presetMopFloor", categoryKey: "quickCategoryCleaning", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetBathroom", categoryKey: "quickCategoryCleaning", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [2, 4, 6] },
  { key: "presetLaundry", categoryKey: "quickCategoryCleaning", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 3, 5] },
  { key: "presetIronUniform", categoryKey: "quickCategoryCleaning", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 4] },
  { key: "presetSchoolBags", categoryKey: "quickCategoryKids", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [0, 1, 2, 3, 4] },
  { key: "presetHomeworkCheck", categoryKey: "quickCategoryKids", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 2, 3, 4, 5] },
  { key: "presetSanitizeToys", categoryKey: "quickCategoryKids", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 3, 5] },
  { key: "presetBathKids", categoryKey: "quickCategoryKids", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 2, 3, 4, 5] },
  { key: "presetMarketShopping", categoryKey: "quickCategoryErrands", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetPharmacyRun", categoryKey: "quickCategoryErrands", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [2, 5] },
  { key: "presetCollectParcels", categoryKey: "quickCategoryErrands", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [1, 2, 3, 4, 5] },
  { key: "presetTrash", categoryKey: "quickCategoryErrands", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
  { key: "presetChangeBedsheets", categoryKey: "quickCategoryWeekly", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [6] },
  { key: "presetWindowCleaning", categoryKey: "quickCategoryWeekly", timeBlock: TIME_BLOCK.AFTERNOON, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [6] },
  { key: "presetFridgeOrganize", categoryKey: "quickCategoryWeekly", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [0] },
  { key: "presetWaterPlants", categoryKey: "quickCategoryHomeCare", timeBlock: TIME_BLOCK.MORNING, frequencyType: FREQUENCY_TYPE.WEEKDAYS, weekdays: [0, 2, 4, 6] },
  { key: "presetWalkDog", categoryKey: "quickCategoryPets", timeBlock: TIME_BLOCK.EVENING, frequencyType: FREQUENCY_TYPE.DAILY },
];

const categoryOrder: PresetTask["categoryKey"][] = [
  "quickCategoryMeals",
  "quickCategoryCleaning",
  "quickCategoryKids",
  "quickCategoryErrands",
  "quickCategoryWeekly",
  "quickCategoryHomeCare",
  "quickCategoryPets",
];

const hanCharacterRegex = /[\u3400-\u9FFF]/;
const QUICK_GUIDE_STORAGE_KEY = "maidboard_admin_quick_add_guide_seen";
const ONBOARDING_STORAGE_KEY = "maidboard_admin_onboarding_seen";

export function TaskManager() {
  const { t } = useTranslation();
  const a = t.admin;
  const brd = t.board;

  const [tasks, setTasks] = useState<Template[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [presetLoadingKey, setPresetLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetOpen, setPresetOpen] = useState(false);
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  const [quickAddTimeBlock, setQuickAddTimeBlock] = useState<TimeBlock | "DEFAULT">("DEFAULT");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState<PresetTask["categoryKey"]>(categoryOrder[0]);
  const hasChineseInput = hanCharacterRegex.test(form.title);

  async function loadTasks() {
    const response = await fetch("/api/admin/tasks", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed loading tasks");
    const payload: Template[] = await response.json();
    setTasks(payload);
    setSelectedIds((current) => current.filter((id) => payload.some((task) => task.id === id)));
  }

  useEffect(() => {
    void loadTasks().catch(() => setError("Could not load tasks."));
  }, []);

  useEffect(() => {
    try {
      setShowQuickGuide(!window.localStorage.getItem(QUICK_GUIDE_STORAGE_KEY));
    } catch {
      setShowQuickGuide(true);
    }
  }, []);

  useEffect(() => {
    try {
      setOnboardingOpen(!window.localStorage.getItem(ONBOARDING_STORAGE_KEY));
    } catch {
      setOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    if (showQuickGuide && tasks.length === 0) {
      setPresetOpen(true);
    }
  }, [showQuickGuide, tasks.length]);

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
      oneTimeDate: task.oneTimeDate ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        oneTimeDate: form.frequencyType === FREQUENCY_TYPE.ONCE ? form.oneTimeDate || null : null,
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

  function dismissQuickGuide() {
    setShowQuickGuide(false);
    try {
      window.localStorage.setItem(QUICK_GUIDE_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function closeOnboarding() {
    setOnboardingOpen(false);
    setOnboardingStep(0);
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  const onboardingSteps = [
    { title: a.onboardingStep1Title, body: a.onboardingStep1Body },
    { title: a.onboardingStep2Title, body: a.onboardingStep2Body },
    { title: a.onboardingStep3Title, body: a.onboardingStep3Body },
  ];

  async function addPresetTask(preset: PresetTask) {
    setPresetLoadingKey(preset.key);
    setError(null);
    try {
      const payload = {
        title: dictionaries.en.admin[preset.key],
        notes: preset.notes ?? null,
        timeBlock: quickAddTimeBlock === "DEFAULT" ? preset.timeBlock : quickAddTimeBlock,
        frequencyType: preset.frequencyType,
        weekdays: preset.frequencyType === FREQUENCY_TYPE.WEEKDAYS ? (preset.weekdays ?? [1, 2, 3, 4, 5]) : [],
        oneTimeDate: null,
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
      dismissQuickGuide();
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

  async function deleteSelected() {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(a.deleteSelectedConfirm);
    if (!confirmed) return;
    const response = await fetch("/api/admin/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    if (response.ok) {
      setSelectedIds([]);
      await loadTasks();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not delete selected tasks.");
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

  function timeBlockLabel(block: TimeBlock) {
    if (block === TIME_BLOCK.MORNING) return brd.morning;
    if (block === TIME_BLOCK.AFTERNOON) return brd.afternoon;
    return brd.evening;
  }

  function formatWeekdays(weekdays: number[] | null) {
    if (!weekdays || weekdays.length === 0) return a.selectedWeekdays;
    return weekdays
      .slice()
      .sort((x, y) => x - y)
      .map((day) => a.weekdayNames[day] ?? String(day))
      .join(", ");
  }

  return (
    <div className="admin-task-root" style={{ display: "grid", gap: "0.85rem" }}>
      {/* Quick Add Presets — collapsible compact chips */}
      <section className="card admin-card-pad">
        <button
          type="button"
          onClick={() => setPresetOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", textAlign: "left" }}>{a.quickAddTitle}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "left" }}>{a.quickAddHint}</div>
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              transition: "transform 200ms ease",
              transform: presetOpen ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
              marginLeft: "0.5rem",
            }}
          >
            {"\u25BE"}
          </span>
        </button>

        {presetOpen ? (
          <div style={{ marginTop: "0.85rem" }}>
            {showQuickGuide ? (
              <div className="admin-quick-guide">
                <div style={{ fontWeight: 700 }}>{a.quickAddGuideTitle}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>{a.quickAddGuideBody}</div>
                <div className="admin-quick-guide-actions">
                  <button type="button" className="btn btn-secondary" onClick={dismissQuickGuide}>
                    {a.quickAddGuideAction}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={dismissQuickGuide}>
                    {a.quickAddGuideDismiss}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="admin-time-picker-wrap">
              <div className="label" style={{ marginBottom: "0.35rem" }}>{a.quickAddTimeLabel}</div>
              <div className="admin-time-picker">
                <button
                  type="button"
                  className={`admin-time-btn ${quickAddTimeBlock === "DEFAULT" ? "admin-time-btn-active" : ""}`}
                  onClick={() => setQuickAddTimeBlock("DEFAULT")}
                >
                  {a.quickAddUseDefaultTime}
                </button>
                <button
                  type="button"
                  className={`admin-time-btn ${quickAddTimeBlock === TIME_BLOCK.MORNING ? "admin-time-btn-active" : ""}`}
                  onClick={() => setQuickAddTimeBlock(TIME_BLOCK.MORNING)}
                >
                  {brd.morning}
                </button>
                <button
                  type="button"
                  className={`admin-time-btn ${quickAddTimeBlock === TIME_BLOCK.AFTERNOON ? "admin-time-btn-active" : ""}`}
                  onClick={() => setQuickAddTimeBlock(TIME_BLOCK.AFTERNOON)}
                >
                  {brd.afternoon}
                </button>
                <button
                  type="button"
                  className={`admin-time-btn ${quickAddTimeBlock === TIME_BLOCK.EVENING ? "admin-time-btn-active" : ""}`}
                  onClick={() => setQuickAddTimeBlock(TIME_BLOCK.EVENING)}
                >
                  {brd.evening}
                </button>
              </div>
            </div>
            {/* Category tabs */}
            <div
              className="admin-quick-tabs"
            >
              {categoryOrder.map((catKey) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                    className="admin-quick-tab-btn"
                    style={{
                    padding: "0.38rem 0.75rem",
                    borderRadius: 980,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background: activeCategory === catKey ? "#007aff" : "rgba(120,120,128,0.08)",
                    color: activeCategory === catKey ? "#fff" : "var(--secondary)",
                    transition: "all 180ms ease",
                  }}
                >
                  {a[catKey]}
                </button>
              ))}
            </div>

            {/* Preset chips for active category */}
            <div className="admin-preset-chips" style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {presetCatalog
                .filter((p) => p.categoryKey === activeCategory)
                .map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className="admin-preset-chip"
                    onClick={() => addPresetTask(preset)}
                    disabled={presetLoadingKey === preset.key}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: 980,
                      border: "none",
                      cursor: presetLoadingKey === preset.key ? "wait" : "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      fontFamily: "inherit",
                      background: "rgba(0,122,255,0.08)",
                      color: "#007aff",
                      transition: "all 180ms ease",
                      opacity: presetLoadingKey === preset.key ? 0.5 : 1,
                    }}
                  >
                    <span style={{ fontSize: "0.9rem" }}>+</span>
                    {a[preset.key]}
                  </button>
                ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Create / Edit Task */}
      <section className="card admin-card-pad">
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.15rem" }}>{formTitle}</div>
        <p style={{ color: "var(--muted)", margin: "0 0 1rem", fontSize: "0.88rem" }}>{a.taskTitleHint}</p>
        <form onSubmit={saveTask}>
          <div className="admin-form-grid" style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div>
              <label className="label" htmlFor="title">{a.taskTitle}</label>
              <input
                id="title"
                className="input"
                required
                value={form.title}
                onChange={(event) => setForm((cur) => ({ ...cur, title: event.target.value }))}
              />
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>{a.taskTitleEnglishReminder}</p>
              {hasChineseInput ? (
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.78rem", color: "var(--danger)" }}>{a.taskTitleChineseDetectedReminder}</p>
              ) : null}
            </div>
            <div>
              <label className="label" htmlFor="timeBlock">{a.timeBlock}</label>
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

          <div style={{ marginTop: "0.85rem" }}>
            <label className="label" htmlFor="notes">{a.notes}</label>
            <textarea
              id="notes"
              className="textarea"
              value={form.notes}
              onChange={(event) => setForm((cur) => ({ ...cur, notes: event.target.value }))}
            />
          </div>

          <div style={{ marginTop: "0.85rem", maxWidth: 320 }}>
            <label className="label" htmlFor="frequency">{a.frequency}</label>
            <select
              id="frequency"
              className="select"
              value={form.frequencyType}
              onChange={(event) => setForm((cur) => ({ ...cur, frequencyType: event.target.value as FrequencyType }))}
            >
              <option value={FREQUENCY_TYPE.DAILY}>{a.daily}</option>
              <option value={FREQUENCY_TYPE.WEEKDAYS}>{a.specificWeekdays}</option>
              <option value={FREQUENCY_TYPE.ONCE}>{a.oneTime}</option>
            </select>
          </div>

          {form.frequencyType === FREQUENCY_TYPE.WEEKDAYS ? (
            <div style={{ marginTop: "0.85rem" }}>
              <div className="label">{a.weekdays}</div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {a.weekdayNames.map((label, day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleWeekday(day)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      background: form.weekdays.includes(day) ? "#007aff" : "rgba(120,120,128,0.08)",
                      color: form.weekdays.includes(day) ? "#fff" : "#636366",
                      transition: "all 180ms ease",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {form.frequencyType === FREQUENCY_TYPE.ONCE ? (
            <div style={{ marginTop: "0.85rem", maxWidth: 320 }}>
              <label className="label" htmlFor="oneTimeDate">{a.oneTimeDate}</label>
              <input
                id="oneTimeDate"
                className="input"
                type="date"
                required
                value={form.oneTimeDate}
                onChange={(event) => setForm((cur) => ({ ...cur, oneTimeDate: event.target.value }))}
              />
            </div>
          ) : null}

          {error ? <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{error}</p> : null}
          <div className="admin-action-row" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ minHeight: 46, borderRadius: 14, fontSize: "0.95rem" }}>
              {loading ? a.saving : editingId ? a.updateTemplate : a.createTemplateBtn}
            </button>
            {editingId ? (
              <button type="button" className="btn btn-ghost" onClick={resetForm} style={{ minHeight: 46, borderRadius: 14 }}>
                {a.cancelEdit}
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* Task List */}
      <section className="card admin-card-pad">
        <div className="admin-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
            {a.taskTemplates}
            <span style={{ fontWeight: 500, color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.4rem" }}>
              ({tasks.length})
            </span>
          </div>
          <div className="admin-list-actions" style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" className="btn btn-ghost" style={{ fontSize: "0.82rem", padding: "0.35rem 0.65rem" }} onClick={() => setSelectedIds(tasks.map((t) => t.id))} disabled={tasks.length === 0}>
              {a.selectAll}
            </button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: "0.82rem", padding: "0.35rem 0.65rem" }} onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              {a.clearSelection}
            </button>
            {selectedIds.length > 0 ? (
              <button type="button" className="btn btn-danger" style={{ fontSize: "0.82rem", padding: "0.35rem 0.65rem" }} onClick={deleteSelected}>
                {a.deleteSelected} ({selectedIds.length})
              </button>
            ) : null}
          </div>
        </div>
        <div className="ios-grouped">
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className="ios-row admin-list-row"
              style={{
                borderTop: idx > 0 ? "1px solid var(--separator)" : "none",
                background: selectedIds.includes(task.id) ? "rgba(0,122,255,0.04)" : "transparent",
              }}
            >
              <label className="admin-list-row-main" style={{ display: "flex", alignItems: "center", gap: "0.55rem", flex: 1, minWidth: 0, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(task.id)}
                  onChange={(event) => {
                    setSelectedIds((current) =>
                      event.target.checked ? [...current, task.id] : current.filter((id) => id !== task.id),
                    );
                  }}
                  style={{ width: 18, height: 18, accentColor: "#007aff", flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{task.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                    {timeBlockLabel(task.timeBlock)} ·{" "}
                    {task.frequencyType === FREQUENCY_TYPE.DAILY
                      ? a.daily
                      : task.frequencyType === FREQUENCY_TYPE.WEEKDAYS
                        ? formatWeekdays(task.weekdays)
                        : `${a.oneTime}${task.oneTimeDate ? ` (${task.oneTimeDate})` : ""}`}
                  </div>
                  {task.notes ? <div style={{ marginTop: "0.15rem", color: "var(--muted)", fontSize: "0.78rem" }}>{task.notes}</div> : null}
                </div>
              </label>
              <div className="admin-list-row-actions" style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                <button className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => startEdit(task)}>
                  {a.edit}
                </button>
                <button className="btn btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => deleteTask(task.id)}>
                  {a.delete}
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--muted)", fontSize: "0.92rem" }}>{a.noTemplates}</div>
          ) : null}
        </div>
      </section>
      {onboardingOpen ? (
        <div className="admin-onboard-overlay" onClick={closeOnboarding}>
          <div className="admin-onboard-modal" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontWeight: 700 }}>{a.onboardingTitle}</div>
              <button type="button" className="btn btn-ghost" style={{ padding: "0.35rem 0.55rem" }} onClick={closeOnboarding}>
                {a.onboardingSkip}
              </button>
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              {a.onboardingStepLabel} {onboardingStep + 1}/3
            </div>
            <div style={{ marginTop: "0.5rem", fontWeight: 700, fontSize: "1rem" }}>{onboardingSteps[onboardingStep].title}</div>
            <div style={{ marginTop: "0.35rem", color: "var(--secondary)", lineHeight: 1.45 }}>{onboardingSteps[onboardingStep].body}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOnboardingStep((current) => Math.max(current - 1, 0))}
                disabled={onboardingStep === 0}
              >
                {a.onboardingBack}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (onboardingStep === onboardingSteps.length - 1) {
                    closeOnboarding();
                    return;
                  }
                  setOnboardingStep((current) => Math.min(current + 1, onboardingSteps.length - 1));
                }}
              >
                {onboardingStep === onboardingSteps.length - 1 ? a.onboardingDone : a.onboardingNext}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
