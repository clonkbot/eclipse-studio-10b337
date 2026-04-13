import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import toast from "react-hot-toast";

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: (id: Id<"projects">) => void;
}

export function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createProject = useMutation(api.projects.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsCreating(true);
    try {
      const id = await createProject({
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Project created");
      onCreated(id);
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-scaleIn">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent opacity-50" />

        <div className="relative bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">New Project</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[#1f1f1f] border border-white/[0.06] flex items-center justify-center hover:bg-[#252525] transition-colors"
            >
              <svg className="w-5 h-5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-[#86868b] pl-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fitness Tracker App"
                className="w-full h-14 px-5 rounded-2xl bg-[#1f1f1f] border border-white/[0.06] text-white placeholder:text-[#48484a] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#86868b] pl-1">Describe Your App</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the app you want to build. Include features, style preferences, and any specific requirements..."
                rows={4}
                className="w-full px-5 py-4 rounded-2xl bg-[#1f1f1f] border border-white/[0.06] text-white placeholder:text-[#48484a] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 resize-none"
              />
              <p className="text-xs text-[#48484a] pl-1">
                The AI will generate an Apple-style dark interface design based on your description.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl bg-[#1f1f1f] border border-white/[0.06] text-[#86868b] font-medium hover:bg-[#252525] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !name.trim() || !description.trim()}
                className="flex-1 h-12 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
