import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Inbox } from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; 

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

const PostCard = ({ post }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const media = post.media || [];

  const goPrev = () => setImgIndex((i) => (i === 0 ? media.length - 1 : i - 1));
  const goNext = () => setImgIndex((i) => (i === media.length - 1 ? 0 : i + 1));

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
          {post.author?.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-text-secondary">
              {post.author?.full_name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {post.author?.full_name || post.author?.username}
          </p>
          {(post.city || post.state) && (
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {[post.city, post.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <span className="ml-auto text-xs text-text-muted">
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Image carousel */}
      {media.length > 0 && (
        <div className="relative aspect-square bg-card">
          <img
            src={media[imgIndex]?.image_url}
            alt={media[imgIndex]?.alt_text || post.caption}
            className="w-full h-full object-cover"
          />

          {media.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/80 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-text-primary" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/80 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-text-primary" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {media.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === imgIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Caption */}
      <div className="px-4 py-3">
        <p className="text-sm text-text-primary leading-relaxed">
          <span className="font-medium">{post.author?.username}</span>{" "}
          {post.caption}
        </p>
      </div>
    </div>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async (url = "/api/posts/") => {
    try {
      const res = await axiosInstance.get(url);
      setPosts((prev) => [...prev, ...res.data.results]);
      setNextUrl(res.data.next);
    } catch (err) {
      setError("Couldn't load the feed.");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    await fetchPosts(nextUrl);
    setLoadingMore(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-error text-center py-10">{error}</p>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-text-muted">
          <Inbox className="w-8 h-8" strokeWidth={1.5} />
          <p className="text-sm">No posts yet. Be the first to report an issue.</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {nextUrl && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm font-medium text-primary hover:text-primary-light py-3 disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;