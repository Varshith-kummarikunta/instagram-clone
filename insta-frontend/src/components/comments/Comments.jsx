import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export const Comments = ({ post, onClose, onCommentAdded }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const postId = post._id;
  async function loadComments() {
    try {
      const res = await fetch(`${BASE_URL}/comments/${postId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        console.log(data);
        return;
      }

      setComments(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (user) {
      loadComments();
    }
  }, [user, postId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  async function addComment() {
    if (!text.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/comments/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const newComment = await res.json();

      if (!res.ok) {
        console.log(newComment);
        return;
      }

      setComments((prev) => [newComment, ...prev]);

      onCommentAdded?.(newComment);

      setText("");
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black border border-gray-700 rounded-lg w-[900px] h-[650px] flex"
      >
        {/* Left Side - Image */}
        <div className="w-1/2">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col p-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <Link
  to={`/profile/${post.author.username}`}
  className="font-semibold hover:underline"
>
  {post.author.username}
</Link>

            <button onClick={onClose} className="text-xl">
              ✕
            </button>
          </div>

          {/* Caption */}
          <div className="py-3 border-b border-gray-700">
            <Link
  to={`/profile/${post.author.username}`}
  className="font-semibold hover:underline"
>
  {post.author.username}
</Link>{" "}
<span>{post.caption}</span>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto py-3">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-2 mb-2">
                <div key={comment._id} className="flex items-start gap-3 mb-3">
                  <img
                    src={
                      comment.author.profilePicture ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div>
                    <span className="font-semibold">
                      {comment.author.username}
                    </span>{" "}
                    <span>{comment.text}</span>
                  </div>
                </div>

                <span>{comment.text}</span>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addComment();
            }}
            className="border-t border-gray-700 pt-3 flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-transparent outline-none"
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="text-blue-500 font-semibold disabled:text-gray-500"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
