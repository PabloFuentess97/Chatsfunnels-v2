"use client";

import { useState } from "react";
import { BlockType, BLOCK_DEFINITIONS, TEMPLATES, BuilderBlock } from "../types";

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  onLoadTemplate: (blocks: BuilderBlock[]) => void;
  onExport: () => void;
  onImport: () => void;
}

export default function BlockPalette({ onAddBlock, onLoadTemplate, onExport, onImport }: BlockPaletteProps) {
  const [tab, setTab] = useState<"blocks" | "templates" | "tools">("blocks");
  const allBlocks = Object.entries(BLOCK_DEFINITIONS) as [BlockType, typeof BLOCK_DEFINITIONS[BlockType]][];

  const categories = [
    { key: "basic", label: "Basic" },
    { key: "media", label: "Media" },
    { key: "advanced", label: "Advanced" },
  ] as const;

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(["blocks", "templates", "tools"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === t ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "blocks" && (
          <div className="p-3 space-y-4">
            {categories.map((cat) => {
              const blocks = allBlocks.filter(([, def]) => def.category === cat.key);
              if (blocks.length === 0) return null;
              return (
                <div key={cat.key}>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">{cat.label}</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {blocks.map(([type, def]) => (
                      <button
                        key={type}
                        onClick={() => onAddBlock(type)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-600 transition-colors text-gray-400 hover:text-white"
                      >
                        <span className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center text-xs font-bold">{def.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{def.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "templates" && (
          <div className="p-3 space-y-2">
            {["Premium", "Basic"].map((cat) => {
              const tpls = TEMPLATES.filter((t) => t.category === cat);
              if (tpls.length === 0) return null;
              return (
                <div key={cat}>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1 mt-2">{cat}</h4>
                  {tpls.map((template, i) => (
                    <button
                      key={i}
                      onClick={() => onLoadTemplate(template.blocks)}
                      className="w-full text-left px-3 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-600 transition-colors mb-2"
                    >
                      <span className="text-sm font-medium text-gray-200">{template.name}</span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">{template.description}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {tab === "tools" && (
          <div className="p-3 space-y-2">
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Import / Export</h4>
            <button onClick={onExport} className="w-full px-3 py-2.5 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-colors text-left">Export as JSON</button>
            <button onClick={onImport} className="w-full px-3 py-2.5 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-colors text-left">Import from JSON</button>
          </div>
        )}
      </div>
    </div>
  );
}
