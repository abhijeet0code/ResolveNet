import { Search, X } from "lucide-react";



export default function SearchBar({
  value,
  onChange,
  onClear,
  onFocus,
  placeholder = "Search",
  autoFocus = false,
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-border bg-card
                 px-4 py-2.5 transition-colors focus-within:border-accent">
      <Search size={18} className="shrink-0 text-text-muted" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent text-sm text-text-primary
                   outline-none placeholder:text-text-muted"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="shrink-0 rounded-full bg-text-muted/20 p-1
                     transition-colors hover:bg-text-muted/30"
        >
          <X size={12} className="text-text-secondary" />
        </button>
      )}
    </div>
  );
}