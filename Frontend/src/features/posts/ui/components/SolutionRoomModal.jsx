import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Lightbulb,
  Plus,
  Send,
  Users,
  GraduationCap,
  Factory,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; // adjust to your actual path
import logo from "../../../../assets/ResolveNet-favicon-white-detail.png"; // adjust to your actual path
import SuggestionCard from "./SuggestionCard";
import NewSuggestionForm from "./NewSuggestionForm";

// Upar ke tabs. value backend ki Suggestion.Category se same honi chahiye
const MAIN_TABS = [
  { value: "citizen", label: "Citizen", icon: Users },
  { value: "university", label: "University", icon: GraduationCap },
  { value: "industrial", label: "Industrial", icon: Factory },
  { value: "expert", label: "Experts", icon: UserCheck },
];

// "See More" dabane par ye niche khulte hain
const MORE_TABS = [
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Other" },
];

const ALL_TABS = [...MAIN_TABS, ...MORE_TABS];

const SolutionRoomModal = ({ post, onClose, onCountChange }) => {
  const [visible, setVisible] = useState(false);

  // kaunsa tab khula hai
  const [category, setCategory] = useState("citizen");
  const [showMore, setShowMore] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // id -> { items, loading, open, loaded }
  const [repliesById, setRepliesById] = useState({});

  // naya suggestion form khula hai ya nahi
  const [showForm, setShowForm] = useState(false);

  // neeche ka reply bar (Reply dabane par hi chalta hai)
  const [replyTarget, setReplyTarget] = useState(null); // { id (root), username }
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const author = post.author;
  const isMoreActive = MORE_TABS.some((t) => t.value === category);
  const currentLabel = ALL_TABS.find((t) => t.value === category)?.label;

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

  // suggestions load — jab bhi post ya tab badle
  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(`/api/posts/${post.id}/suggestions/`, {
          params: { category },
        });
        if (active) {
          setSuggestions(res.data.results || res.data);
          setNextUrl(res.data.next || null);
        }
      } catch {
        if (active) setError("Couldn't load suggestions.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [post.id, category]);

  // reply par click hote hi input par focus
  useEffect(() => {
    if (replyTarget) inputRef.current?.focus();
  }, [replyTarget]);

  const changeCategory = (value) => {
    if (value === category) return;
    setCategory(value);
    // purane tab ka reply target ab kaam ka nahi
    setReplyTarget(null);
    setReplyText("");
    setPostError("");
  };

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
    setReplyText(`@${username} `);
    setPostError("");
  };

  const cancelReply = () => {
    setReplyTarget(null);
    setReplyText("");
  };

  // NewSuggestionForm yahi function call karta hai. Error aaye to form ko throw kar do
  const handleCreateSuggestion = async (payload) => {
    const res = await axiosInstance.post(`/api/posts/${post.id}/suggestions/`, payload);
    onCountChange?.(1);
    setShowForm(false);

    if (res.data.category === category) {
      setSuggestions((prev) => [res.data, ...prev]); // nayi suggestion sabse upar
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // user ne doosri category chuni — us tab par chale jao, wahan list reload hogi
      setCategory(res.data.category);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    const value = replyText.trim();
    if (!value || posting || !replyTarget) return;

    setPosting(true);
    setPostError("");
    try {
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
      setReplyText("");
    } catch {
      setPostError("Couldn't post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  // tab button ki styling (main aur "more" dono me kaam aati hai)
  const tabClass = (active) =>
    `shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-primary text-white" : "bg-accent-light text-accent hover:bg-secondary"
    }`;

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 bg-black/60 flex items-center justify-center md:p-6 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full md:h-[88vh] md:max-h-[720px] md:max-w-5xl bg-surface md:rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border">
          <img src={logo} alt="ResolveNet" className="w-11 h-11 rounded-xl shrink-0" />
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-primary leading-tight">
              Suggested Solution Room
            </h2>
            <p className="text-xs text-text-secondary truncate">
              Real Problems • Shared Solution • A Greener Tomorrow
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto w-9 h-9 shrink-0 rounded-full bg-accent-light flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-accent" strokeWidth={1.8} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-4 sm:px-6 py-3 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            {MAIN_TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => changeCategory(value)}
                className={tabClass(category === value)}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                {label}
              </button>
            ))}

            <button onClick={() => setShowMore((prev) => !prev)} className={tabClass(isMoreActive)}>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}
                strokeWidth={1.8}
              />
              {isMoreActive ? currentLabel : "See More"}
            </button>
          </div>

          {showMore && (
            <div className="flex flex-wrap gap-2 mt-2">
              {MORE_TABS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => changeCategory(value)}
                  className={tabClass(category === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
          {/* Kis problem par suggestions de rahe hain */}
          <div className="flex gap-3 bg-card border border-border rounded-xl p-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface shrink-0">
              {post.media?.[0]?.image_url && (
                <img
                  src={post.media[0].image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted truncate">
                Issue reported by{" "}
                <span className="font-medium text-text-primary">@{author?.username}</span>
                {post.city && ` · ${post.city}`}
              </p>
              <p className="text-sm text-text-primary mt-0.5 line-clamp-2 break-words">
                {post.caption}
              </p>
            </div>
          </div>

          {/* naya suggestion: button ya form */}
          {showForm ? (
            <NewSuggestionForm
              defaultCategory={category}
              onSubmit={handleCreateSuggestion}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 w-full border border-dashed border-border rounded-xl py-2.5 text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add suggestion
            </button>
          )}

          {loading ? (
            <p className="text-xs text-text-muted">Loading suggestions...</p>
          ) : error ? (
            <p className="text-sm text-error text-center py-6">{error}</p>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-text-muted">
              <Lightbulb className="w-8 h-8" strokeWidth={1.5} />
              <p className="text-sm text-center">
                No suggestions from {currentLabel} yet. Be the first to suggest a fix.
              </p>
            </div>
          ) : (
            <>
              {suggestions.map((s) => (
                <SuggestionCard
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

        {/* Reply composer (hamesha dikhta hai, Reply dabane par chalu hota hai) */}
        <div className="border-t border-border bg-surface">
          {replyTarget && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-card text-xs text-text-secondary">
              <span>Replying to @{replyTarget.username}</span>
              <button onClick={cancelReply} aria-label="Cancel reply">
                <X className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
          )}

          <form onSubmit={handleReplySubmit} className="flex items-center gap-2 px-4 sm:px-6 py-3">
            <input
              ref={inputRef}
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={!replyTarget}
              maxLength={1000}
              placeholder={
                replyTarget
                  ? `Reply to @${replyTarget.username}...`
                  : "Tap Reply on a suggestion to write a reply..."
              }
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={posting || !replyTarget || !replyText.trim()}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-full px-4 py-2.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>

          {postError && <p className="px-4 sm:px-6 pb-3 -mt-1 text-xs text-error">{postError}</p>}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SolutionRoomModal;