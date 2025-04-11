import { LoginForm } from "@/components/login-form";
// import logo_transparent from "../assets/logo_transparent.png";
import logo from "../assets/logex_logo.png";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-slate-950 bg-muted lg:flex h-full w-full">
        <div className="hidden lg:flex lg:flex-col items-center justify-center text-white dark:text-black absolute inset-0">
          <h1 className="font-semibold text-4xl flex flex-row items-center gap-0 -mb-20 dark:text-slate-200">
            Torre de Control{" "}
            <img
              src={logo}
              alt="Image"
              className="flex size-52 object-center object-contain dark:brightness-[.8] px-4"
            />
          </h1>
          <small className="dark:text-slate-200">
            Impulsado con la tecnología de LogeX
          </small>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10 dark:bg-gray-900">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
