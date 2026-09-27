import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; // adjust to your actual path

const PostComments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts/${postId}/comments/`);
        setComments(res.data.results || res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setPosting(true);
    try {
      const res = await axiosInstance.post(`/api/posts/${postId}/comments/`, { text: text.trim() });
      setComments((prev) => [...prev, res.data]);
      setText("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="border-t border-border px-4 py-3 mt-4 flex flex-col gap-3">
      {loading ? (
        <p className="text-xs text-text-muted">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-muted">No comments yet.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="text-sm">
            <span className="font-medium text-text-primary">{c.author?.username}</span>{" "}
            <span className="text-text-secondary">{c.text}</span>
          </div>
        ))
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-card border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={posting}
          className="text-sm font-medium text-primary disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default PostComments;