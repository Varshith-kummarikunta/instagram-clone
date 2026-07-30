import { Footer } from "../components/commons/footer";
import { LoginForm } from "../components/Login/LoginForm";
import hero from "../assets/hero.png";

export const Login = () => {
  return (
    <div className="flex flex-col gap-5 h-screen">
      <div className="flex justify-center items-center gap-[100px] h-4/5">
        <div className="flex justify-end items-center w-3/5">
          <img src={hero} className="max-h-[400px] w-auto object-contain" />
        </div>
        <div className="w-2/5 flex items-center justify-start">
          <LoginForm />
        </div>
      </div>
      <div className="h-1/5">
        <Footer />
      </div>
    </div>
  );
};
