import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export const SignupForm = () => {
  const { signup } = useContext(AuthContext);

  function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const identifier = formData.get("identifier");
    const password = formData.get("password");
    const username = formData.get("username");
    const name = formData.get("name");

    signup({
      identifier,
      password,
      username,
      name,
    });
  }

  return (
    <div className="w-[300px] flex flex-col items-center justify-center gap-2 text-sm">
      <div className="w-full border flex flex-col gap-3 items-center justify-center p-8">
        <span className="text-4xl font-bold" style={{ fontFamily: "cursive" }}>
          Instagram
        </span>
        <span className="text-gray-400 font-semibold">
          Sign up to see photos and videos from your friends.
        </span>
        <button type="submit" className="bg-blue-600 p-1 w-full rounded">
          Log in with facebook
        </button>
        <div className="flex items-center gap-4">
          <span className="w-24 border-[0.2px] border-gray-700" />
          <span className="text-gray-600 font-semibold">OR</span>
          <span className="w-24 border-[0.2px] border-gray-700" />
        </div>
        <form
          onSubmit={handleSignup}
          className="flex flex-col gap-1 w-full"
          autoComplete="on"
        >
          <input
            className="text-[11px] p-2 bg-gray-800 border border-gray-600"
            placeholder="Mobile number or email"
            name="identifier"
            type="text"
            required
          />
          <input
            className="text-[11px] p-2 bg-gray-800 border border-gray-600"
            placeholder="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
          />
          <input
            className="text-[11px] p-2 bg-gray-800 border border-gray-600"
            placeholder="Full name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
          <input
            className="text-[11px] p-2 bg-gray-800 border border-gray-600"
            placeholder="Username"
            type="text"
            name="username"
            autoComplete="username"
            required
          />
          <span className="text-[11px] mt-2 text-gray-400">
            <span>
              People who use our services may have uploaded your contact
              information to Instagram.
            </span>
            <span className="text-blue-600">Learn more</span>
          </span>
          <span className="text-[11px] mt-2 text-gray-400">
            <span>By signing up you agree to our </span>
            <span className="text-blue-600">Terms </span>
            <span>, </span>
            <span className="text-blue-600">Privacy Policy </span>
            <span>and </span>
            <span className="text-blue-600">Cookies.</span>
          </span>
          <button type="submit" className="bg-blue-600 mt-2 p-1 rounded">
            Sign up
          </button>
        </form>
      </div>
      <div className="w-full border flex flex-col items-center justify-center p-6 text-sm">
        <span>Have an account?</span>
        <Link to="/login" className="font-semibold text-blue-600">
          Log in
        </Link>
      </div>
    </div>
  );
};
