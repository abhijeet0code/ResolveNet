import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lightbulb } from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; // adjust to your actual path
import PostImageCarousel from "./PostImageCarousel.jsx";
import SuggestionItem, { Avatar } from "./SuggestionItem";

const SuggestionModal = ({ post, onClose, onCountChange }) => {
  const [visible, setVisible] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // id -> { items, loading, open, loaded }
  const [repliesById, setRepliesById] = useState({});

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // { id (root), username }

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // fade-in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // body scroll lock + Esc to close
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // first page of suggestions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts/${post.id}/suggestions/`);
        setSuggestions(res.data.results || res.data);
        setNextUrl(res.data.next || null);
      } catch {
        setError("Couldn't load suggestions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [post.id]);

  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const res = await axiosInstance.get(nextUrl);
      setSuggestions((prev) => [...prev, ...(res.data.results || res.data)]);
      setNextUrl(res.data.next || null);
    } finally {
      setLoadingMore(false);
    }
  };

  // suggestion ya reply — jo bhi id ho, dono jagah update
  const patchItem = (id, fn) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? fn(s) : s)));
    setRepliesById((prev) => {
      const next = {};
      for (const key in prev) {
        next[key] = { ...prev[key], items: prev[key].items.map((r) => (r.id === id ? fn(r) : r)) };
      }
      return next;
    });
  };

  const toggleUpvote = async (item) => {
    const delta = item.is_upvoted ? -1 : 1;
    // optimistic update
    patchItem(item.id, (s) => ({
      ...s,
      is_upvoted: !item.is_upvoted,
      upvotes_count: s.upvotes_count + delta,
    }));

    try {
      const res = await axiosInstance.post(`/api/posts/suggestions/${item.id}/upvote/`);
      patchItem(item.id, (s) => ({
        ...s,
        is_upvoted: res.data.upvoted,
        upvotes_count: res.data.upvotes_count,
      }));
    } catch {
      // revert on failure
      patchItem(item.id, (s) => ({
        ...s,
        is_upvoted: item.is_upvoted,
        upvotes_count: item.upvotes_count,
      }));
    }
  };

  const loadReplies = async (id) => {
    setRepliesById((prev) => ({
      ...prev,
      [id]: { items: prev[id]?.items || [], loading: true, open: true, loaded: false },
    }));
    try {
      const res = await axiosInstance.get(`/api/posts/suggestions/${id}/replies/`);
      setRepliesById((prev) => ({
        ...prev,
        [id]: { items: res.data.results || res.data, loading: false, open: true, loaded: true },
      }));
    } catch {
      setRepliesById((prev) => ({
        ...prev,
        [id]: { items: prev[id]?.items || [], loading: false, open: false, loaded: false },
      }));
    }
  };

  const toggleReplies = (id) => {
    if (!repliesById[id]?.loaded) {
      loadReplies(id);
      return;
    }
    setRepliesById((prev) => ({ ...prev, [id]: { ...prev[id], open: !prev[id].open } }));
  };

  const startReply = (root, username) => {
    setReplyTarget({ id: root.id, username });
    setText(`@${username} `);
    setPostError("");
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTarget(null);
    setText("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || posting) return;

    setPosting(true);
    setPostError("");
    try {
      if (replyTarget) {
        const id = replyTarget.id;
        const res = await axiosInstance.post(`/api/posts/suggestions/${id}/replies/`, { text: value });
        patchItem(id, (s) => ({ ...s, replies_count: s.replies_count + 1 }));

        if (repliesById[id]?.loaded) {
          setRepliesById((prev) => ({
            ...prev,
            [id]: { ...prev[id], open: true, items: [...prev[id].items, res.data] },
          }));
        } else {
          // replies abhi load nahi hue the — server se poori list le aao (naya reply bhi aa jaayega)
          await loadReplies(id);
        }
        setReplyTarget(null);
      } else {
        const res = await axiosInstance.post(`/api/posts/${post.id}/suggestions/`, { text: value });
        setSuggestions((prev) => [res.data, ...prev]); // naya sabse upar
        onCountChange?.(1);
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
      setText("");
    } catch {
      setPostError("Couldn't post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  const author = post.author;

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 bg-black/60 flex items-center justify-center md:p-6 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full md:h-[85vh] md:max-h-[640px] md:max-w-4xl bg-surface md:rounded-xl overflow-hidden flex"
      >
        {/* Left: post image (desktop only) */}
        <div className="hidden md:flex md:w-1/2 bg-card items-center justify-center border-r border-border">
          <div className="w-full">
            <PostImageCarousel media={post.media} caption={post.caption} />
          </div>
        </div>

        {/* Right: suggestions */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Avatar author={author} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {author?.full_name || author?.username}
              </p>
              {post.city && <p className="text-xs text-text-secondary truncate">{post.city}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-card transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" strokeWidth={1.8} />
            </button>
          </div>

          {/* scrollable body */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
            {/* caption */}
            <div className="flex gap-3">
              <Avatar author={author} />
              <p className="text-sm leading-relaxed break-words">
                <span className="font-medium text-text-primary">{author?.username}</span>{" "}
                <span className="text-text-primary">{post.caption}</span>
              </p>
            </div>

            <div className="border-t border-border" />

            {loading ? (
              <p className="text-xs text-text-muted">Loading suggestions...</p>
            ) : error ? (
              <p className="text-sm text-error text-center py-6">{error}</p>
            ) : suggestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-text-muted">
                <Lightbulb className="w-8 h-8" strokeWidth={1.5} />
                <p className="text-sm text-center">No suggestions yet. Be the first to suggest a fix.</p>
              </div>
            ) : (
              <>
                {suggestions.map((s) => (
                  <SuggestionItem
                    key={s.id}
                    item={s}
                    repliesState={repliesById[s.id]}
                    onUpvote={toggleUpvote}
                    onReply={startReply}
                    onToggleReplies={toggleReplies}
                  />
                ))}

                {nextUrl && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="text-sm font-medium text-primary hover:text-primary-light py-2 disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* input */}
          <div className="border-t border-border">
            {replyTarget && (
              <div className="flex items-center justify-between px-4 py-2 bg-card text-xs text-text-secondary">
                <span>Replying to @{replyTarget.username}</span>
                <button onClick={cancelReply} aria-label="Cancel reply">
                  <X className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={1000}
                placeholder={replyTarget ? `Reply to @${replyTarget.username}...` : "Add a suggestion..."}
                className="flex-1 bg-card border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={posting || !text.trim()}
                className="text-sm font-medium text-primary disabled:opacity-50"
              >
                Post
              </button>
            </form>
            {postError && <p className="px-4 pb-3 -mt-1 text-xs text-error">{postError}</p>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SuggestionModal;