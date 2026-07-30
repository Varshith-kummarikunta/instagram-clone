import { Footer } from "../components/commons/footer";
import { SignupForm } from "../components/Signup/SignupForm";

export const Signup = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 p-2">
      <SignupForm />
      <Footer />
    </div>
  );
};
