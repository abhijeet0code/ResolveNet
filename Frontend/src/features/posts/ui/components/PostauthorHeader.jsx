import React from "react";
import { MapPin } from "lucide-react";

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

const PostAuthorHeader = ({ author, city, state, createdAt }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
      {author?.avatar_url ? (
        <img src={author.avatar_url} alt={author.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-text-secondary">
          {author?.full_name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-text-primary">
        {author?.full_name || author?.username}
      </p>
      {(city || state) && (
        <p className="text-xs text-text-secondary flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {[city, state].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
    <span className="ml-auto text-xs text-text-muted">{timeAgo(createdAt)}</span>
  </div>
);

export default PostAuthorHeader;