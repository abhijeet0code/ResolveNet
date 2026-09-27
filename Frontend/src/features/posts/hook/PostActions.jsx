import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import axiosInstance from "../../../config/axiosInstance"; 
import PostComments from "../ui/components/PostComments";
import PulseHeart from './PulseHeart';


const PostActions = ({ postId, initialLiked, initialLikesCount, initialSaved, commentsCount }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [saved, setSaved] = useState(initialSaved);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = async () => {
    // optimistic update
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await axiosInstance.post(`/api/posts/${postId}/like/`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch {
      // revert on failure
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const toggleSave = async () => {
    setSaved((prev) => !prev);
    try {
      const res = await axiosInstance.post(`/api/posts/${postId}/save/`);
      setSaved(res.data.saved);
    } catch {
      setSaved((prev) => !prev);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/posts/${postId}`;
    if (navigator.share) {
      navigator.share({ url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 px-4 pt-5 pb-1 h-7">
        <button onClick={toggleLike} className="flex items-center gap-1.5">
          <PulseHeart
          defaultLiked={liked}
          count={likesCount}
           icon="heart"
           idleOutline
           size={25}
           corner={32}
           
           
           pillColor="#ffffff"
           textColor="#3e3e3e"
           duration={480}
           dotSize={0.3}
           overshoot={1.7}
           beat={3}
           rollDuration={350}
           disabled={false}
/>
          {/* <Heart
            className={`w-6 h-6 ${liked ? "" : "text-text-secondary"}  transition-transform duration-200 hover:scale-110 `}
            strokeWidth={1.8}
          /> */}
          {/* <span className="text-sm text-text-secondary">{likesCount}</span> */}
        </button>
        
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1.5"
        >
          <MessageCircle className="w-5 h-5 text-text-secondary hover:scale-110 transition-transform duration-200 " strokeWidth={1.8} />
          <span className="text-sm text-text-secondary">{commentsCount}</span>
        </button>

        <button onClick={handleShare}>
          <Share2 className="w-5 h-5 text-text-secondary hover:scale-110 transition-transform duration-200" strokeWidth={1.8} />
        </button>

        <button onClick={toggleSave} className="ml-auto">
          <Bookmark
            className={`w-5 h-5 ${saved ? "fill-primary text-primary" : "text-text-secondary"} hover:scale-110 transition-transform duration-200`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {showComments && <PostComments postId={postId} />}
    </div>
  );
};

export default PostActions;