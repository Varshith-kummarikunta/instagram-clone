import { useState, useEffect, useRef } from "react";
import { UserCard } from "../commons/UserCard";
import { FaRegHeart } from "react-icons/fa";
import { SiTheconversation } from "react-icons/si";
import { useContext } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import { Comments } from "../comments/Comments";
import { BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";

export const Posts = ({ refresh }) => {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [heartAnimation, setHeartAnimation] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [doubleClickHeart, setDoubleClickHeart] = useState({});
  const [menuPost, setMenuPost] = useState(null);
  const clickTimer = useRef(null);
  const [editPost, setEditPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");

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

  async function deletePost(postId) {
    const ok = window.confirm("Delete this post?");

    if (!ok) return;

    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setPosts((prev) => prev.filter((p) => p._id !== postId));

      setMenuPost(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function updatePost(postId) {
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: editCaption,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setPosts((prev) =>
        prev.map((post) => (post._id === data._id ? data : post)),
      );

      setEditPost(null);
      setEditCaption("");
    } catch (err) {
      console.log(err);
    }
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
              <div className="flex justify-between items-center">
                <Link to={`/profile/${post.author.username}`}>
                  <UserCard
                    username={post.author.username}
                    profileImg={
                      post.author.profilePicture ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                  />
                </Link>

                {post.author._id === user._id && (
                  <button onClick={() => setMenuPost(post)}>
                    <BsThreeDots size={20} />
                  </button>
                )}
              </div>

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
                <Link
                  to={`/profile/${post.author.username}`}
                  className="font-semibold hover:underline"
                >
                  {post.author.username}
                </Link>

                <span>{post.caption}</span>
              </div>
            </div>
          );
        })}
      </div>

      {menuPost && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setMenuPost(null)}
        >
          <div
            className="bg-[#222] rounded-lg w-72 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => deletePost(menuPost._id)}
              className="w-full p-4 border-b border-gray-700 text-red-500"
            >
              Delete
            </button>

            <button
              onClick={() => {
                setEditPost(menuPost);
                setEditCaption(menuPost.caption);
                setMenuPost(null);
              }}
              className="w-full p-4 border-b border-gray-700"
            >
              Edit Caption
            </button>

            <button onClick={() => setMenuPost(null)} className="w-full p-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      {editPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Caption</h2>

            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full bg-black p-3 rounded h-32"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditPost(null)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => updatePost(editPost._id)}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
