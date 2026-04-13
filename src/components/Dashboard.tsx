import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { ProjectList } from "./ProjectList";
import { ProjectEditor } from "./ProjectEditor";
import { NewProjectModal } from "./NewProjectModal";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const projects = useQuery(api.projects.list);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedProject = projects?.find((p: Doc<"projects">) => p._id === selectedProjectId);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 md:px-6 h-16 md:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 blur-lg opacity-50" />
              <div className="relative w-full h-full rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 0 0 20" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-light tracking-tight hidden sm:block">
              Eclipse <span className="text-amber-500 font-medium">Studio</span>
            </span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowNewProject(true)}
              className="h-11 px-5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
            <button
              onClick={() => signOut()}
              className="h-11 px-5 rounded-xl bg-[#1f1f1f] border border-white/[0.06] text-[#86868b] hover:text-white hover:border-white/10 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 rounded-xl bg-[#1f1f1f] border border-white/[0.06] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 border-t border-white/[0.06] pt-4 animate-fadeIn">
            <button
              onClick={() => {
                setShowNewProject(true);
                setMobileMenuOpen(false);
              }}
              className="w-full h-12 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
            <button
              onClick={() => signOut()}
              className="w-full h-12 rounded-xl bg-[#1f1f1f] border border-white/[0.06] text-[#86868b]"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - Projects List */}
        <aside
          className={`${
            selectedProjectId ? "hidden md:flex" : "flex"
          } flex-col w-full md:w-80 lg:w-96 border-r border-white/[0.06] bg-[#0a0a0a]`}
        >
          <ProjectList
            projects={projects}
            selectedId={selectedProjectId}
            onSelect={(id) => {
              setSelectedProjectId(id);
              setMobileMenuOpen(false);
            }}
            onNewProject={() => setShowNewProject(true)}
          />
        </aside>

        {/* Editor Area */}
        <div className={`flex-1 ${selectedProjectId ? "flex" : "hidden md:flex"}`}>
          {selectedProject ? (
            <ProjectEditor
              project={selectedProject}
              onBack={() => setSelectedProjectId(null)}
            />
          ) : (
            <EmptyState onNewProject={() => setShowNewProject(true)} />
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreated={(id) => {
            setSelectedProjectId(id);
            setShowNewProject(false);
          }}
        />
      )}

      {/* Footer */}
      <footer className="py-4 text-center border-t border-white/[0.06]">
        <p className="text-[11px] text-[#3a3a3a]">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

function EmptyState({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md animate-fadeIn">
        {/* Illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl" />
          <div className="relative w-full h-full rounded-3xl bg-[#141414] border border-white/[0.06] flex items-center justify-center">
            <svg className="w-14 h-14 text-[#48484a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path strokeLinecap="round" d="M4 9h16M9 4v16" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-medium mb-3">Start designing</h2>
        <p className="text-[#86868b] mb-8">
          Create your first project and let AI craft an elegant, Apple-style dark interface for your app.
        </p>

        <button
          onClick={onNewProject}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>
    </div>
  );
}
