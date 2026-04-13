"use client";

import { BuilderBlock } from "../types";
import BlockRenderer from "./block-renderer";

interface PageRendererProps {
  blocks: BuilderBlock[];
  isEditor?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}

export default function PageRenderer({ blocks, isEditor = false, selectedBlockId, onSelectBlock }: PageRendererProps) {
  return (
    <div className="min-h-full">
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isEditor={isEditor}
          isSelected={selectedBlockId === block.id}
          onClick={onSelectBlock}
        />
      ))}
    </div>
  );
}
