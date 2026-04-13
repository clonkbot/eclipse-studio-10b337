import { useState, useRef, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import toast from "react-hot-toast";

interface ProjectEditorProps {
  project: Doc<"projects">;
  onBack: () => void;
}

export function ProjectEditor({ project, onBack }: ProjectEditorProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.listByProject, { projectId: project._id }) ?? [];
  const addMessage = useMutation(api.chat.addMessage);
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);
  const chat = useAction(api.ai.chat);
  const generateImage = useAction(api.ai.generateImage);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim() && messages.length === 0) return;

    const userMessage = input.trim() || `Design an elegant Apple-style dark interface for: ${project.description}`;
    setInput("");
    setIsGenerating(true);

    try {
      // Add user message
      await addMessage({
        projectId: project._id,
        role: "user",
        content: userMessage,
      });

      // Update status
      await updateProject({ id: project._id, status: "generating" });

      // Build conversation history
      const conversationHistory = [
        ...messages.map((m: Doc<"chatMessages">) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: userMessage },
      ];

      // Get AI response
      const systemPrompt = `You are Eclipse Studio, an expert UI/UX designer specializing in elegant, Apple-style dark interfaces. Your role is to help users design beautiful, modern app interfaces.

When designing interfaces:
- Use dark themes with deep blacks (#0a0a0a, #141414) and subtle glass morphism
- Apply warm accent colors (amber, orange) for highlights and CTAs
- Emphasize clean typography, generous whitespace, and refined micro-interactions
- Consider iOS design patterns: SF symbols, rounded corners, subtle shadows
- Provide specific design recommendations: colors, fonts, spacing, component styles

Format your responses with clear sections:
**Layout** - Overall structure and composition
**Colors** - Specific hex codes and gradients
**Typography** - Font recommendations and sizes
**Components** - Key UI elements and their styling
**Interactions** - Animations and micro-interactions

Be concise but thorough. Focus on practical, implementable design advice.`;

      const response = await chat({
        messages: conversationHistory,
        systemPrompt,
      });

      // Save assistant response
      await addMessage({
        projectId: project._id,
        role: "assistant",
        content: response,
      });

      // Generate preview image
      const imagePrompt = `Modern minimalist Apple-style dark mode UI mockup for a mobile app. Professional interface design with deep black background (#0a0a0a), subtle glass cards, amber accent highlights, elegant typography. Clean iOS-style layout showing: ${project.description}. High quality UI/UX design mockup, dribbble style, figma design.`;

      const imageBase64 = await generateImage({ prompt: imagePrompt });

      if (imageBase64) {
        await updateProject({
          id: project._id,
          generatedDesign: response,
          generatedImage: imageBase64,
          status: "complete",
        });
        toast.success("Design generated successfully!");
      } else {
        await updateProject({
          id: project._id,
          generatedDesign: response,
          status: "complete",
        });
        toast.success("Design advice ready!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
      await updateProject({ id: project._id, status: "draft" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject({ id: project._id });
      onBack();
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 md:px-6 py-4 border-b border-white/[0.06]">
        <button
          onClick={onBack}
          className="md:hidden w-10 h-10 rounded-xl bg-[#1f1f1f] border border-white/[0.06] flex items-center justify-center hover:bg-[#252525] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-medium truncate">{project.name}</h1>
          <p className="text-sm text-[#86868b] truncate">{project.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-xl bg-[#1f1f1f] border border-white/[0.06] flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 text-[#86868b] hover:text-red-400 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs (Mobile) */}
      <div className="md:hidden flex border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-[#86868b]"
          }`}
        >
          Design Chat
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-[#86868b]"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className={`flex-1 flex flex-col ${activeTab === "chat" ? "flex" : "hidden md:flex"} md:border-r md:border-white/[0.06]`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 && !isGenerating && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to design</h3>
                <p className="text-[#86868b] text-sm max-w-sm mx-auto mb-6">
                  Click "Generate Design" to create an elegant Apple-style interface, or describe your vision below.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Design
                </button>
              </div>
            )}

            {messages.map((msg: Doc<"chatMessages">, i: number) => (
              <MessageBubble key={msg._id} message={msg} index={i} />
            ))}

            {isGenerating && (
              <div className="flex items-start gap-3 animate-fadeIn">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#0a0a0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 0 0 20" />
                  </svg>
                </div>
                <div className="flex-1 bg-[#141414] border border-white/[0.06] rounded-2xl rounded-tl-md p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-sm text-[#86868b] ml-2">Crafting your design...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 md:p-6 border-t border-white/[0.06]">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleGenerate()}
                placeholder="Describe changes or refine your design..."
                disabled={isGenerating}
                className="flex-1 h-12 px-5 rounded-xl bg-[#1f1f1f] border border-white/[0.06] text-white placeholder:text-[#48484a] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-12 px-5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-[#0a0a0a] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{isGenerating ? "Generating" : "Generate"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`flex-1 flex flex-col ${activeTab === "preview" ? "flex" : "hidden md:flex"} bg-[#0a0a0a]`}>
          <div className="p-4 md:p-6 border-b border-white/[0.06]">
            <h2 className="text-lg font-medium">Preview</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
            {project.generatedImage ? (
              <div className="relative group animate-fadeIn">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
                  <img
                    src={`data:image/png;base64,${project.generatedImage}`}
                    alt="Generated UI Design"
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                </div>
              </div>
            ) : isGenerating ? (
              <div className="text-center animate-fadeIn">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-full h-full rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-amber-500 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="opacity-25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <p className="text-[#86868b]">Creating your design preview...</p>
              </div>
            ) : (
              <div className="text-center animate-fadeIn">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#141414] border border-white/[0.06] flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#48484a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <p className="text-[#86868b]">Generate a design to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { bg: "bg-[#48484a]/20", text: "text-[#86868b]", label: "Draft" },
    generating: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Generating" },
    complete: { bg: "bg-green-500/20", text: "text-green-400", label: "Complete" },
  }[status] ?? { bg: "bg-[#48484a]/20", text: "text-[#86868b]", label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status === "generating" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
      )}
      {config.label}
    </span>
  );
}

function MessageBubble({ message, index }: { message: Doc<"chatMessages">; index: number }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 animate-fadeIn ${isUser ? "flex-row-reverse" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-[#1f1f1f] border border-white/[0.06]"
            : "bg-gradient-to-br from-amber-500 to-orange-500"
        }`}
      >
        {isUser ? (
          <svg className="w-5 h-5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-[#0a0a0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 0 0 20" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`flex-1 max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
          isUser
            ? "bg-amber-500/10 border border-amber-500/20 rounded-tr-md"
            : "bg-[#141414] border border-white/[0.06] rounded-tl-md"
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content.split(/(\*\*.*?\*\*)/).map((part: string, i: number) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <span key={i} className="font-semibold text-amber-400">
                  {part.slice(2, -2)}
                </span>
              );
            }
            return part;
          })}
        </div>
      </div>
    </div>
  );
}
