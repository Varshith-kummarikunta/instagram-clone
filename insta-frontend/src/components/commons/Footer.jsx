export const Footer = () => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center text-gray-400 text-xs">
      <div className="flex gap-4">
        <span>Meta</span>
        <span>About</span>
        <span>Blogs</span>
        <span>Help</span>
        <span>API</span>
        <span>Privacy</span>
        <span>Terms</span>
        <span>Location</span>
        <span>Instagram Lite</span>
        <span>Meta AI</span>
        <span>Threads</span>
        <span>Contact</span>
        <span>Uploading & Non-users</span>
        <span>Meta</span>
        <span>Verified</span>
      </div>
      <div className="flex gap-4">
        <select className="bg-transparent">
          <option>English</option>
          <option>Telugu</option>
          <option>Hindi</option>
        </select>
        <span>&copy; 2026 Instagram from Meta</span>
      </div>
    </div>
  );
};
