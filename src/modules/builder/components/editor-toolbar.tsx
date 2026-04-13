"use client";

import Link from "next/link";

interface EditorToolbarProps {
  pageName: string;
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;
  canUndo: boolean;
  canRedo: boolean;
  viewport: "desktop" | "tablet" | "mobile";
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSetViewport: (v: "desktop" | "tablet" | "mobile") => void;
  onTogglePublish: () => void;
  previewUrl: string;
}

export default function EditorToolbar({
  pageName,
  isDirty,
  isSaving,
  isPublished,
  canUndo,
  canRedo,
  viewport,
  onSave,
  onUndo,
  onRedo,
  onSetViewport,
  onTogglePublish,
  previewUrl,
}: EditorToolbarProps) {
  return (
    <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
      {/* Left: back + name */}
      <div className="flex items-center gap-3">
        <Link href="/pages" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <span className="text-sm font-medium text-white truncate max-w-[200px]">{pageName}</span>
        {isDirty && <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Unsaved changes" />}
      </div>

      {/* Center: undo/redo + viewport */}
      <div className="flex items-center gap-1">
        <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" /></svg>
        </button>

        <div className="w-px h-5 bg-gray-700 mx-2" />

        {(["desktop", "tablet", "mobile"] as const).map((v) => (
          <button
            key={v}
            onClick={() => onSetViewport(v)}
            className={`p-1.5 rounded transition-colors ${viewport === v ? "text-blue-400 bg-blue-900/30" : "text-gray-400 hover:text-white"}`}
            title={v.charAt(0).toUpperCase() + v.slice(1)}
          >
            {v === "desktop" && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            {v === "tablet" && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
            {v === "mobile" && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          </button>
        ))}
      </div>

      {/* Right: publish + save */}
      <div className="flex items-center gap-2">
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
            Preview
          </a>
        )}
        <button
          onClick={onTogglePublish}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isPublished ? "bg-green-600/20 text-green-400 border border-green-800 hover:bg-green-600/30" : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"}`}
        >
          {isPublished ? "Published" : "Publish"}
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
