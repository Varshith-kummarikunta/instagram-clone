import { useState } from "react";
import { BASE_URL } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export const Search = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  async function handleSearch(value) {
    setQuery(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/search?q=${value}`);

      const data = await res.json();

      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="text-white p-6 w-[400px]">
      <h1 className="text-2xl font-bold mb-5">Search</h1>

      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search username..."
        className="w-full bg-[#222] p-3 rounded"
      />

      <div className="mt-5 flex flex-col gap-3">
        {users.map((user) => (
          <Link
            key={user._id}
            to={`/profile/${user.username}`}
            className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded"
          >
            <img
              src={
                user.profilePicture || "https://ui-avatars.com/api/?name=User"
              }
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <div className="font-semibold">{user.username}</div>

              <div className="text-gray-400">{user.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
