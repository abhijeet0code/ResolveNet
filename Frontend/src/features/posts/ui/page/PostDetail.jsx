import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; // adjust to your actual path
import PostCard from "../components/PostCard.jsx";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(`/api/posts/${postId}/`);
        setPost(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("This post doesn't exist.");
        } else {
          setError("Couldn't load the post.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {loading ? (
        <div className="aspect-square bg-card border border-border rounded-xl animate-pulse" />
      ) : error ? (
        <p className="text-sm text-error text-center py-10">{error}</p>
      ) : (
        <PostCard post={post} />
      )}
    </div>
  );
};

export default PostDetail