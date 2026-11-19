import React, { useState } from "react";
import { X } from "lucide-react";

// backend ki Suggestion.Category ke saath same values
const CATEGORIES = [
  { value: "citizen", label: "Citizen" },
  { value: "university", label: "University" },
  { value: "industrial", label: "Industrial" },
  { value: "expert", label: "Experts" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Other" },
];

const ROLE_TAGS = [
  { value: "saviour", label: "Saviour" },
  { value: "helper", label: "Helper" },
];

const MAX_NEEDS = 10;

const getErrorMessage = (err) => {
  const data = err.response?.data;
  if (!data || typeof data !== "object") return "Couldn't post. Try again.";
  const firstKey = Object.keys(data)[0];
  const value = data[firstKey];
  return Array.isArray(value) ? value[0] : String(value);
};

// defaultCategory: modal mein jo tab khula hai wahi pehle se chuna hua dikhe
const NewSuggestionForm = ({ onSubmit, onCancel, defaultCategory = "citizen" }) => {
  const [category, setCategory] = useState(defaultCategory);
  const [roleTag, setRoleTag] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [needs, setNeeds] = useState([]);
  const [needInput, setNeedInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addNeed = () => {
    const value = needInput.trim();
    if (!value || needs.length >= MAX_NEEDS) return;
    setNeeds((prev) => [...prev, value]);
    setNeedInput("");
  };

  const removeNeed = (index) => {
    setNeeds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || submitting) return;

    // input mein jo likha reh gaya (Enter nahi dabaya) use bhi jod do
    const lastNeed = needInput.trim();
    const allNeeds = lastNeed && needs.length < MAX_NEEDS ? [...needs, lastNeed] : needs;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        needs: allNeeds,
        category,
        role_tag: roleTag,
      });
      // success par modal form ko band kar deta hai
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">New suggestion</h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs text-text-muted mb-1.5">I am suggesting as</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                category === c.value
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-text-secondary border-border hover:bg-secondary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role tag (optional) */}
      <div>
        <p className="text-xs text-text-muted mb-1.5">My role (optional)</p>
        <div className="flex flex-wrap gap-2">
          {ROLE_TAGS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setRoleTag(roleTag === t.value ? "" : t.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                roleTag === t.value
                  ? "bg-error/10 text-error border-error/30"
                  : "bg-surface text-text-secondary border-border hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">
          Title<span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Better waste management in our city"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">
          Description<span className="text-error">*</span>
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          placeholder="Explain your solution"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Needs */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Needs</label>

        {needs.length > 0 && (
          <ol className="list-decimal list-inside text-xs text-text-secondary flex flex-col gap-1 mb-2">
            {needs.map((need, index) => (
              <li key={index} className="break-words">
                {need}
                <button
                  type="button"
                  onClick={() => removeNeed(index)}
                  aria-label="Remove need"
                  className="ml-2 text-text-muted hover:text-error align-middle"
                >
                  <X className="w-3 h-3 inline" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={needInput}
            onChange={(e) => setNeedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // form submit na ho
                addNeed();
              }
            }}
            maxLength={200}
            disabled={needs.length >= MAX_NEEDS}
            placeholder={
              needs.length >= MAX_NEEDS ? "Max 10 needs" : "Type a need and press Enter"
            }
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addNeed}
            disabled={!needInput.trim() || needs.length >= MAX_NEEDS}
            className="text-sm font-medium text-primary disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !description.trim()}
          className="bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-full px-5 py-2 transition-colors disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post suggestion"}
        </button>
      </div>
    </form>
  );
};

export default NewSuggestionForm;