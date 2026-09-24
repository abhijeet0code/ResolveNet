import React from "react";
import PostAuthorHeader from "./PostAuthorHeader";
import PostImageCarousel from "./PostImageCarousel ";
import PostActions from "../../hook/Postactions";

const PostCard = ({ post }) => (
  <div className="bg-surface border border-border rounded-xl overflow-hidden">
    <PostAuthorHeader
      author={post.author}
      city={post.city}
      state={post.state}
      createdAt={post.created_at}
    />

    <PostImageCarousel media={post.media} caption={post.caption} />

    <div className="px-4 pt-3">
      <p className="text-sm text-text-primary leading-relaxed">
        <span className="font-medium">{post.author?.username}</span> {post.caption}
      </p>
    </div>

    <PostActions
      postId={post.id}
      initialLiked={post.is_liked}
      initialLikesCount={post.likes_count}
      initialSaved={post.is_saved}
      commentsCount={post.comments_count}
    />
  </div>
);

export default PostCard;