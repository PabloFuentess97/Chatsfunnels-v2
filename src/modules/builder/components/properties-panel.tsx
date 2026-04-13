"use client";

import { BuilderBlock, BlockStyles } from "../types";

interface PropertiesPanelProps {
  block: BuilderBlock | null;
  onUpdate: (id: string, updates: Partial<BuilderBlock>) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function PropertiesPanel({ block, onUpdate, onDuplicate, onRemove }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="w-72 bg-gray-900 border-l border-gray-800 flex items-center justify-center p-6">
        <p className="text-sm text-gray-500 text-center">Select a block to edit its properties</p>
      </div>
    );
  }

  const updateStyle = (key: keyof BlockStyles, value: string) => {
    onUpdate(block.id, { styles: { [key]: value } });
  };

  const updateContent = (content: string) => {
    onUpdate(block.id, { content });
  };

  const updateProp = (key: string, value: string) => {
    onUpdate(block.id, { props: { ...(block.props || {}), [key]: value } });
  };

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white capitalize">{block.type} Block</h3>
        <div className="flex gap-1">
          <button onClick={() => onDuplicate(block.id)} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="Duplicate">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => onRemove(block.id)} className="p-1.5 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {block.type !== "spacer" && block.type !== "section" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {block.type === "image" ? "Image URL" : "Content"}
            </label>
            {block.type === "text" ? (
              <textarea
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
                rows={3}
                className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        )}

        {block.type === "button" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Link URL</label>
            <input
              type="text"
              value={block.props?.href || ""}
              onChange={(e) => updateProp("href", e.target.value)}
              placeholder="https://..."
              className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {block.type === "image" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Alt Text</label>
            <input
              type="text"
              value={block.props?.alt || ""}
              onChange={(e) => updateProp("alt", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Typography */}
        {(block.type === "heading" || block.type === "text" || block.type === "button") && (
          <>
            <SectionLabel>Typography</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Font Size</label>
                <input type="text" value={block.styles.fontSize || ""} onChange={(e) => updateStyle("fontSize", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Font Weight</label>
                <select value={block.styles.fontWeight || ""} onChange={(e) => updateStyle("fontWeight", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white">
                  <option value="normal">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Text Align</label>
              <div className="flex bg-gray-800 rounded-md p-0.5">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle("textAlign", align)}
                    className={`flex-1 py-1 text-xs rounded ${block.styles.textAlign === align ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Colors */}
        <SectionLabel>Colors</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {block.type !== "spacer" && (
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Text Color</label>
              <div className="flex gap-1">
                <input type="color" value={block.styles.color || "#ffffff"} onChange={(e) => updateStyle("color", e.target.value)} className="w-8 h-7 rounded border border-gray-700 cursor-pointer bg-transparent" />
                <input type="text" value={block.styles.color || ""} onChange={(e) => updateStyle("color", e.target.value)} className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">Background</label>
            <div className="flex gap-1">
              <input type="color" value={block.styles.backgroundColor || "#000000"} onChange={(e) => updateStyle("backgroundColor", e.target.value)} className="w-8 h-7 rounded border border-gray-700 cursor-pointer bg-transparent" />
              <input type="text" value={block.styles.backgroundColor || ""} onChange={(e) => updateStyle("backgroundColor", e.target.value)} className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
            </div>
          </div>
        </div>

        {/* Spacing */}
        <SectionLabel>Spacing</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">Padding</label>
            <input type="text" value={block.styles.padding || ""} onChange={(e) => updateStyle("padding", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" placeholder="16px" />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">Margin</label>
            <input type="text" value={block.styles.margin || ""} onChange={(e) => updateStyle("margin", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" placeholder="0" />
          </div>
        </div>

        {/* Dimensions */}
        {(block.type === "image" || block.type === "section" || block.type === "spacer") && (
          <>
            <SectionLabel>Dimensions</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {block.type === "spacer" && (
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Height</label>
                  <input type="text" value={block.styles.height || ""} onChange={(e) => updateStyle("height", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Max Width</label>
                <input type="text" value={block.styles.maxWidth || ""} onChange={(e) => updateStyle("maxWidth", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Border Radius</label>
                <input type="text" value={block.styles.borderRadius || ""} onChange={(e) => updateStyle("borderRadius", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
              </div>
            </div>
          </>
        )}

        {block.type === "button" && (
          <>
            <SectionLabel>Button</SectionLabel>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Border Radius</label>
              <input type="text" value={block.styles.borderRadius || ""} onChange={(e) => updateStyle("borderRadius", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2 pb-1 border-t border-gray-800">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{children}</span>
    </div>
  );
}
