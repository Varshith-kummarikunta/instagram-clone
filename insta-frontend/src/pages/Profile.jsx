import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext, BASE_URL } from "../contexts/AuthContext";

import { createConversation } from "../api/conversation";

export const Profile = () => {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  async function fetchProfile() {
    try {
      const res = await fetch(`${BASE_URL}/profile/${username}`);
      const data = await res.json();
      console.log(data);
      setProfile(data);
      setIsFollowing(
        user &&
          data.user.followers.some(
            (id) => id.toString() === user._id.toString(),
          ),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function toggleFollow() {
    try {
      const res = await fetch(`${BASE_URL}/follow/${profile.user._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setIsFollowing(data.following);

      setProfile((prev) => ({
        ...prev,
        followers: data.followers,
        user: {
          ...prev.user,
          followers: data.following
            ? [...prev.user.followers, user._id]
            : prev.user.followers.filter(
                (id) => id.toString() !== user._id.toString(),
              ),
        },
      }));
    } catch (err) {
      console.log(err);
    }
  }

  async function handleMessage() {
    if (!profile?.user?._id) {
      console.log("User id missing");
      return;
    }

    try {
      const conversation = await createConversation(
        profile.user._id,
        user.token,
      );

      navigate("/messages", {
        state: {
          conversation,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (!profile) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }
  const isOwnProfile = user.username === profile.user.username;
  return (
    <div className="text-white max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex gap-10 items-center">
        {/* Profile Picture */}
        <div>
          <img
            src={
              profile.user.profilePicture ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>

        {/* User Info */}
        <div className="flex-1">
          {/* Username + Edit Button */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{profile.user.username}</h1>

            {isOwnProfile ? (
              <Link
                to="/accounts/edit"
                className="border border-gray-600 px-4 py-1 rounded font-semibold hover:bg-gray-800"
              >
                Edit Profile
              </Link>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-1 rounded font-semibold ${
                    isFollowing
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  onClick={handleMessage}
                  className="px-4 py-1 rounded font-semibold bg-gray-700 hover:bg-gray-600"
                >
                  Message
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-6">
            <span>
              <b>{profile.postCount}</b> posts
            </span>

            <span>
              <b>{profile.followers}</b> followers
            </span>

            <span>
              <b>{profile.following}</b> following
            </span>
          </div>

          {/* Name */}
          <h2 className="font-semibold mt-6">{profile.user.name}</h2>

          {/* Bio */}
          <p className="mt-2 whitespace-pre-line">{profile.user.bio}</p>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8 border-gray-700" />

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-2">
        {profile.posts.map((post) => (
          <div key={post._id} className="cursor-pointer">
            <img
              src={post.imageUrl}
              alt="Post"
              className="aspect-square object-cover w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
