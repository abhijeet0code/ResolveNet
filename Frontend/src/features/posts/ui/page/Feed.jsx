import React, { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; // adjust to your actual path
import PostCard from "../components/PostCard.jsx";

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
            <div key={i} className="aspect-square bg-card border border-border rounded-xl animate-pulse" />
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