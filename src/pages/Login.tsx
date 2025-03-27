import { LoginForm } from "@/components/login-form";
// import logo_transparent from "../assets/logo_transparent.png";
import logo from "../assets/logex_logo.png";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-slate-950 bg-muted lg:flex h-full w-full">
        <div className="hidden lg:flex lg:flex-col items-center justify-center text-white absolute inset-0">
          <h1 className="font-semibold text-4xl flex flex-row items-center gap-0 -mb-20">
            Torre de Control{" "}
            <img
              src={logo}
              alt="Image"
              className="flex size-52 object-center object-contain dark:brightness-[0.2] px-4"
            />
          </h1>
          <small>Impulsado con la tecnología de LogeX</small>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
