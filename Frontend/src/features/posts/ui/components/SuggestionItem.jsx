import React from "react";
import { ArrowBigUp } from "lucide-react";

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
    if (value >= 1) return `${value}${label}`;
  }
  return "now";
};

export const Avatar = ({ author, size = "md" }) => {
  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <div
      className={`${dim} rounded-full bg-card border border-border flex items-center justify-center overflow-hidden shrink-0`}
    >
      {author?.avatar_url ? (
        <img src={author.avatar_url} alt={author.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-text-secondary">
          {(author?.full_name || author?.username)?.[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
};

/**
 * item         -> suggestion ya reply object (API se)
 * root         -> reply ke case mein uski parent suggestion
 * repliesState -> { items, loading, open, loaded } (sirf top-level ke liye)
 */
const SuggestionItem = ({
  item,
  root,
  isReply = false,
  repliesState,
  onUpvote,
  onReply,
  onToggleReplies,
}) => {
  const username = item.author?.username;
  const replyTarget = root || item;

  return (
    <div className="flex gap-3">
      <Avatar author={item.author} size={isReply ? "sm" : "md"} />

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed break-words">
          <span className="font-medium text-text-primary">{username}</span>{" "}
          <span className="text-text-secondary">{item.text}</span>
        </p>

        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
          <span>{timeAgo(item.created_at)}</span>
          <button
            onClick={() => onReply(replyTarget, username)}
            className="font-medium hover:text-text-primary transition-colors"
          >
            Reply
          </button>
        </div>

        {!isReply && item.replies_count > 0 && (
          <button
            onClick={() => onToggleReplies(item.id)}
            className="mt-2 flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="w-6 h-px bg-border" />
            {repliesState?.open
              ? "Hide replies"
              : `View ${item.replies_count} ${item.replies_count === 1 ? "reply" : "replies"}`}
          </button>
        )}

        {!isReply && repliesState?.open && (
          <div className="mt-3 flex flex-col gap-3">
            {repliesState.loading && (
              <p className="text-xs text-text-muted">Loading replies...</p>
            )}
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

      <button
        onClick={() => onUpvote(item)}
        aria-label={item.is_upvoted ? "Remove upvote" : "Upvote"}
        className="shrink-0 self-start flex flex-col items-center gap-0.5 pt-0.5"
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
  );
};

export default SuggestionItem;