import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "react-hot-toast";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f7] antialiased selection:bg-amber-500/30">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#f5f5f7",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px 20px",
            fontFamily: "Outfit, sans-serif",
          },
          success: {
            iconTheme: {
              primary: "#ff9500",
              secondary: "#0a0a0a",
            },
          },
          error: {
            iconTheme: {
              primary: "#ff453a",
              secondary: "#0a0a0a",
            },
          },
        }}
      />

      {isLoading ? (
        <LoadingScreen />
      ) : isAuthenticated ? (
        <Dashboard />
      ) : (
        <AuthScreen />
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="relative">
        {/* Eclipse glow */}
        <div className="absolute inset-0 blur-3xl opacity-60">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 animate-pulse" />
        </div>
        {/* Core */}
        <div className="relative w-24 h-24 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-amber-500 animate-spin" />
        </div>
      </div>
    </div>
  );
}
