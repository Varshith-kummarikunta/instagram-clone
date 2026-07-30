import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

export const LoginForm = () => {
  const { login } = useContext(AuthContext);

  function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    login(identifier, password);
  }

  return (
    <div className="flex flex-col gap-4 items-center text-xs">
      <h1
        className="text-4xl font-bold pb-10"
        style={{ fontFamily: "cursive" }}
      >
        Instagram
      </h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          className="w-64 p-2 bg-gray-800 border border-gray-600"
          placeholder="Phone number, username or email"
          name="identifier"
          type="text"
          required
        />
        <input
          className="w-64 p-2 bg-gray-800 border border-gray-600"
          placeholder="Password"
          type="password"
          name="password"
          required
        />
        <button type="submit" className="bg-blue-600 mt-2 p-1 w-64 rounded">
          Log in
        </button>
      </form>
      <div className="flex items-center gap-4">
        <span className="w-24 border border-gray-500" />
        <span className="text-gray-600 font-semibold">OR</span>
        <span className="w-24 border border-gray-500" />
      </div>
      <Link className="text-blue-500 font-semibold pt-2">
        Login with facebook
      </Link>
      <Link className="font-semibold">Forgot password?</Link>
      <span className="flex gap-1 pt-4">
        <span>Don't have an account?</span>
        <Link to="/signup" className="text-blue-500 font-semibold">
          Sign up
        </Link>
      </span>
    </div>
  );
};
