import { useState, useEffect, useRef } from "react";
import { UserCard } from "../commons/UserCard";
import { FaRegHeart } from "react-icons/fa";
import { SiTheconversation } from "react-icons/si";
import { useContext } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import { Comments } from "../comments/Comments";

export const Posts = ({ refresh }) => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [heartAnimation, setHeartAnimation] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [doubleClickHeart, setDoubleClickHeart] = useState({});
  const clickTimer = useRef(null);
  async function loadPosts() {
    try {
      const res = await fetch(`${BASE_URL}/posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }

      setPosts(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user, refresh]);

  async function toggleLike(postId) {
    try {
      const res = await fetch(`${BASE_URL}/posts/like/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const updatedPost = await res.json();

      if (!res.ok) {
        console.log(updatedPost);
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post,
        ),
      );

      // Trigger animation every click
      setHeartAnimation((prev) => ({
        ...prev,
        [postId]: Date.now(),
      }));
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDoubleClick(postId) {

    setSelectedPost(null);

    const post = posts.find((p) => p._id === postId);

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === user._id.toString(),
    );

    // Only like if not already liked
    if (!alreadyLiked) {
      await toggleLike(postId);
    }

    // Show big heart animation
    setDoubleClickHeart((prev) => ({
      ...prev,
      [postId]: Date.now(),
    }));

    // remove animation after 800ms
    setTimeout(() => {
      setDoubleClickHeart((prev) => ({
        ...prev,
        [postId]: null,
      }));
    }, 800);
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-[400px] text-sm">
        {posts.map((post) => {
          const isLiked = post.likes.some(
            (id) => id.toString() === user._id.toString(),
          );

          return (
            <div className="flex flex-col gap-2" key={post._id}>
              <UserCard
                username={post.author.username}
                profileImg="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              />

              <div
                className="relative cursor-pointer"
                onDoubleClick={() => {
                  clearTimeout(clickTimer.current);
                  handleDoubleClick(post._id);
                }}
              >
                <img
                  className="rounded"
                  src={post.imageUrl}
                  onClick={() => {
                    clickTimer.current = setTimeout(() => {
                      setSelectedPost(post);
                    }, 250);
                  }}
                />

                {doubleClickHeart[post._id] && (
                  <motion.div
                    key={doubleClickHeart[post._id]}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.5, 1],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <FaHeart size={100} className="text-white drop-shadow-lg" />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4">
                <span
                  onClick={() => toggleLike(post._id)}
                  className="flex gap-1 items-center cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <motion.div
                    key={heartAnimation[post._id]}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  >
                    {isLiked ? (
                      <FaHeart size={20} className="text-red-500" />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                  </motion.div>

                  {post.likes.length || ""}
                </span>

                <span
                  onClick={() => setSelectedPost(post)}
                  className="flex gap-1 items-center cursor-pointer"
                >
                  <SiTheconversation size={20} />
                  {post.commentCount || ""}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-semibold">{post.author.username}</span>

                <span>{post.caption}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <Comments
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onCommentAdded={(updatedComment) => {
            setPosts((prevPosts) =>
              prevPosts.map((p) =>
                p._id === selectedPost._id
                  ? {
                      ...p,
                      commentCount: p.commentCount + 1,
                    }
                  : p,
              ),
            );
          }}
        />
      )}
    </>
  );
};
