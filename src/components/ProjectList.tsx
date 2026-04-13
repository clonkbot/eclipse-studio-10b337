import { Doc, Id } from "../../convex/_generated/dataModel";

interface ProjectListProps {
  projects: Doc<"projects">[] | undefined;
  selectedId: Id<"projects"> | null;
  onSelect: (id: Id<"projects">) => void;
  onNewProject: () => void;
}

export function ProjectList({ projects, selectedId, onSelect, onNewProject }: ProjectListProps) {
  const isLoading = projects === undefined;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-lg font-medium">Projects</h2>
        <span className="text-sm text-[#48484a]">
          {isLoading ? "..." : projects.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-[#141414] animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))
        ) : projects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#48484a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[#86868b] mb-4">No projects yet</p>
            <button
              onClick={onNewProject}
              className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
            >
              Create your first project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <button
              key={project._id}
              onClick={() => onSelect(project._id)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group animate-fadeIn ${
                selectedId === project._id
                  ? "bg-[#1f1f1f] border border-amber-500/30 shadow-lg shadow-amber-500/5"
                  : "bg-[#141414] border border-white/[0.06] hover:bg-[#1a1a1a] hover:border-white/10"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div
                  className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                    project.status === "complete"
                      ? "bg-green-500"
                      : project.status === "generating"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-[#48484a]"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{project.name}</h3>
                  <p className="text-sm text-[#86868b] mt-1 line-clamp-2">
                    {project.description}
                  </p>
                  <p className="text-xs text-[#48484a] mt-2">
                    {formatDate(project.createdAt)}
                  </p>
                </div>

                {/* Thumbnail if available */}
                {project.generatedImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1f1f1f] flex-shrink-0 border border-white/[0.06]">
                    <img
                      src={`data:image/png;base64,${project.generatedImage}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? "Just now" : `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
