"use client";

import { BlockType, BLOCK_DEFINITIONS, TEMPLATES, BuilderBlock } from "../types";

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  onLoadTemplate: (blocks: BuilderBlock[]) => void;
  onExport: () => void;
  onImport: () => void;
}

export default function BlockPalette({ onAddBlock, onLoadTemplate, onExport, onImport }: BlockPaletteProps) {
  const blockTypes = Object.entries(BLOCK_DEFINITIONS) as [BlockType, typeof BLOCK_DEFINITIONS[BlockType]][];

  return (
    <div className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Blocks</h3>
        <div className="grid grid-cols-2 gap-2">
          {blockTypes.map(([type, def]) => (
            <button
              key={type}
              onClick={() => onAddBlock(type)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-600 transition-colors text-gray-300 hover:text-white"
            >
              <span className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-sm font-bold">
                {def.icon}
              </span>
              <span className="text-[11px] font-medium">{def.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Templates</h3>
        <div className="space-y-2">
          {TEMPLATES.map((template, i) => (
            <button
              key={i}
              onClick={() => onLoadTemplate(template.blocks)}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-600 transition-colors text-sm text-gray-300 hover:text-white"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Import / Export</h3>
        <div className="space-y-2">
          <button
            onClick={onExport}
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={onImport}
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Import JSON
          </button>
        </div>
      </div>
    </div>
  );
}
