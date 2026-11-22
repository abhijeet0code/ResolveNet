import React, { useEffect, useState } from "react";
import { ArrowRight, FileText, Lock } from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; // adjust to your actual path

const getErrorMessage = (err) => {
  const data = err.response?.data;
  if (!data || typeof data !== "object") return "Couldn't save. Try again.";
  const firstKey = Object.keys(data)[0];
  const value = data[firstKey];
  return Array.isArray(value) ? value[0] : String(value);
};

/**
 * Sirf official/government ko dikhta hai ("Admin Only").
 * suggestion -> jo suggestion select hai (null ho sakta hai)
 * onSaved(id, fields) -> save ke baad modal ki list update karne ke liye
 */
const AdminPanel = ({ suggestion, onSaved }) => {
  const [budget, setBudget] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // doosri suggestion select hone par fields us suggestion ki values se bhar do
  useEffect(() => {
    setBudget(suggestion?.approx_budget ?? "");
    setStart(suggestion?.approx_start ?? "");
    setEnd(suggestion?.approx_end ?? "");
    setMessage({ type: "", text: "" });
  }, [suggestion?.id]);

  const handleSave = async () => {
    if (!suggestion || saving) return;

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.patch(`/api/posts/suggestions/${suggestion.id}/manage/`, {
        approx_budget: budget === "" ? null : budget,
        approx_start: start || null,
        approx_end: end || null,
      });
      onSaved(suggestion.id, res.data);
      setMessage({ type: "ok", text: "Saved." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-4">
      {/* Admin Only + Collab card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-text-primary" strokeWidth={1.8} />
          <h3 className="text-sm font-semibold text-text-primary">Admin Only</h3>
        </div>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          This section is visible only to Government and authorized officials.
        </p>

        <div className="mt-3 bg-surface border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-text-secondary" strokeWidth={1.8} />
              <span className="text-sm font-medium text-text-primary">Collab</span>
            </div>
            <span className="rounded-full bg-primary text-white text-[10px] font-medium px-2 py-0.5">
              Government
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            View and manage government collaboration notes, actions and updates related to this
            solution.
          </p>
          <div className="flex justify-end mt-2">
            <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </div>
        </div>
      </div>

      {/* Budget + Time */}
      {suggestion ? (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs text-text-muted truncate">
            Suggestion:{" "}
            <span className="font-medium text-text-primary">
              {suggestion.title || suggestion.text}
            </span>
          </p>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Approx Budget
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Approx Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-text-muted">Start</span>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <span className="text-[10px] text-text-muted">End</span>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {message.text && (
            <p className={`text-xs ${message.type === "error" ? "text-error" : "text-text-secondary"}`}>
              {message.text}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-full py-2 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-text-muted text-center py-4">
          Select a suggestion to set its budget and time.
        </p>
      )}
    </div>
  );
};

export default AdminPanel;