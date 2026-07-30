import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LeftNav } from "../components/Home/LeftNav";
import { Feed } from "../components/Home/Feed";
import { RightNav } from "../components/Home/RightNav";

export const Home = () => {
  const [refresh, setRefresh] = useState(false);
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex w-full justify-between">
      <LeftNav onPostCreated={() => setRefresh((prev) => !prev)} />

      <Feed refresh={refresh} />

      <RightNav />
    </div>
  );
};
