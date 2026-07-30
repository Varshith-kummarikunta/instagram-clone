import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="bg-[#0d1114] text-white min-h-screen">
      <Outlet />
    </div>
  );
};
