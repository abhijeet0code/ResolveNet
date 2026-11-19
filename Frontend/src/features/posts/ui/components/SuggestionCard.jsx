import React from "react";
import { ArrowBigUp, MessageCircle } from "lucide-react";
import SuggestionItem, { Avatar } from "./SuggestionItem";

const CATEGORY_LABELS = {
  citizen: "Citizen",
  university: "University",
  industrial: "Industrial",
  expert: "Experts",
  government: "Government",
  ngo: "NGO",
  other: "Other",
};

const ROLE_LABELS = {
  saviour: "Saviour",
  helper: "Helper",
};

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label} ago`;
  }
  return "just now";
};

/**
 * Ek top-level suggestion ka card (mockup jaisa).
 * item         -> API se aayi suggestion
 * repliesState -> { items, loading, open, loaded }
 */
const SuggestionCard = ({ item, repliesState, onUpvote, onReply, onToggleReplies }) => {
  const author = item.author;
  const place = [author?.city, author?.state].filter(Boolean).join(", ");

  // purani suggestions me sirf `text` hota hai, description nahi
  const description = item.description || item.text;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar author={author} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{author?.username}</p>
          <p className="text-xs text-text-muted truncate">
            {[place, timeAgo(item.created_at)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Category + role chips */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-accent-light text-accent px-3 py-1 text-xs font-medium">
          {CATEGORY_LABELS[item.category] || item.category}
        </span>
        {item.role_tag && (
          <span className="rounded-full bg-error/10 text-error px-3 py-1 text-xs font-medium">
            {ROLE_LABELS[item.role_tag] || item.role_tag}
          </span>
        )}
      </div>

      {/* Title */}
      {item.title && (
        <div>
          <p className="text-xs text-text-muted mb-1">Title</p>
          <p className="text-sm font-semibold text-text-primary break-words">{item.title}</p>
        </div>
      )}

      {/* Description (zyada lamba ho to scroll) */}
      <div>
        <p className="text-xs text-text-muted mb-1">Description</p>
        <div className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary leading-relaxed max-h-32 overflow-y-auto break-words whitespace-pre-line">
          {description}
        </div>
      </div>

      {/* Needs */}
      {item.needs?.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-1">Needs</p>
          <ol className="list-decimal list-inside text-xs text-text-secondary flex flex-col gap-1 bg-surface border border-border rounded-lg px-3 py-2">
            {item.needs.map((need, index) => (
              <li key={index} className="break-words">
                {need}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onReply(item, author?.username)}
          className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-xs text-text-secondary hover:bg-surface transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.8} />
          Reply
        </button>

        <button
          onClick={() => onUpvote(item)}
          aria-label={item.is_upvoted ? "Remove upvote" : "Upvote"}
          className="flex items-center gap-1"
        >
          <ArrowBigUp
            className={`w-5 h-5 transition-transform duration-200 hover:scale-110 ${
              item.is_upvoted ? "fill-primary text-primary" : "text-text-secondary"
            }`}
            strokeWidth={1.8}
          />
          <span className="text-xs text-text-secondary">{item.upvotes_count}</span>
        </button>
      </div>

      {/* Replies */}
      {item.replies_count > 0 && (
        <button
          onClick={() => onToggleReplies(item.id)}
          className="text-xs text-text-muted hover:text-text-primary transition-colors text-left"
        >
          {repliesState?.open
            ? "Hide replies"
            : `View ${item.replies_count} ${item.replies_count === 1 ? "reply" : "replies"}`}
        </button>
      )}

      {repliesState?.open && (
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          {repliesState.loading && <p className="text-xs text-text-muted">Loading replies...</p>}
          {repliesState.items.map((reply) => (
            <SuggestionItem
              key={reply.id}
              item={reply}
              root={item}
              isReply
              onUpvote={onUpvote}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;