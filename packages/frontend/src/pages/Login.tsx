import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "../stores/authStore.js";
import { Brain, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

interface LoginProps {
  onToggleSignUp: () => void;
}

export default function Login({ onToggleSignUp }: LoginProps) {
  const { login, error, isLoading, clearError } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginSchemaType) => {
    await login(data.email, data.password);
  };

  React.useEffect(() => {
    clearError();
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      
      {/* Decorative center mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">
            Connect to MemBrain
          </h2>
          <p className="text-slate-400 text-sm">
            Temporal Importance Decay & Forgetting Registry Operator
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {(error || errors.email || errors.password) && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-mono rounded-lg flex flex-col gap-1.5">
              {error && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{error}</span>
                </div>
              )}
              {errors.email && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{errors.email.message}</span>
                </div>
              )}
              {errors.password && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2 font-semibold">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-200 outline-none placeholder-slate-600 transition-colors"
                  placeholder="name@agency.gov"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2 font-semibold">
                Authorization Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-200 outline-none placeholder-slate-600 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 shadow-lg shadow-indigo-900/30 active:translate-y-px transition-all duration-150 outline-none select-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing Node...</span>
                </>
              ) : (
                <>
                  <span>Initialize Security Session</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs">
            <span className="text-slate-500">New memory operator? </span>
            <button
              onClick={onToggleSignUp}
              className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 transition-colors outline-none"
            >
              Provision new node
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/60" />
          <span>AES-256 Memory Obfuscation Protocol Active</span>
        </div>
      </div>

    </div>
  );
}
