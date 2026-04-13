import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import toast from "react-hot-toast";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      toast.error(flow === "signIn" ? "Invalid credentials" : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      toast.error("Failed to continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Gradient mesh */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        {/* Logo & Branding */}
        <div className="mb-12 md:mb-16 text-center animate-fadeIn">
          {/* Eclipse icon */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 blur-xl opacity-60 animate-glow" />
            <div className="relative w-full h-full rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
              <svg className="w-10 h-10 md:w-12 md:h-12 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 0 0 20" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-3">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Eclipse
            </span>
            <span className="text-amber-500 font-medium ml-2">Studio</span>
          </h1>
          <p className="text-[#86868b] text-lg md:text-xl font-light max-w-md mx-auto">
            AI-powered app design with elegant, Apple-style interfaces
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="w-full max-w-md animate-fadeInUp"
          style={{ animationDelay: "150ms" }}
        >
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent opacity-50" />

            <div className="relative bg-[#141414]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 md:p-10">
              <h2 className="text-2xl font-medium mb-8 text-center">
                {flow === "signIn" ? "Welcome back" : "Create account"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-[#86868b] pl-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full h-14 px-5 rounded-2xl bg-[#1f1f1f] border border-white/[0.06] text-white placeholder:text-[#48484a] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#86868b] pl-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    className="w-full h-14 px-5 rounded-2xl bg-[#1f1f1f] border border-white/[0.06] text-white placeholder:text-[#48484a] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  />
                </div>

                <input name="flow" type="hidden" value={flow} />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full h-14 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold text-lg overflow-hidden group transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      flow === "signIn" ? "Sign In" : "Create Account"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-sm text-[#48484a]">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <button
                onClick={handleAnonymous}
                disabled={isLoading}
                className="mt-6 w-full h-14 rounded-2xl bg-[#1f1f1f] border border-white/[0.06] text-white font-medium hover:bg-[#252525] hover:border-white/10 transition-all duration-200 disabled:opacity-50"
              >
                Continue as Guest
              </button>

              <p className="mt-8 text-center text-[#86868b]">
                {flow === "signIn" ? "New to Eclipse? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {flow === "signIn" ? "Create account" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-[#48484a]">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
