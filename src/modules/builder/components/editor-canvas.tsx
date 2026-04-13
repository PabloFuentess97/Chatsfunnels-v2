"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BuilderBlock } from "../types";
import BlockRenderer from "../renderer/block-renderer";

interface EditorCanvasProps {
  blocks: BuilderBlock[];
  selectedBlockId: string | null;
  viewport: "desktop" | "tablet" | "mobile";
  onSelectBlock: (id: string) => void;
  onMoveBlock: (activeId: string, overId: string) => void;
  onDeselectAll: () => void;
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
}: {
  block: BuilderBlock;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 hover:opacity-100 cursor-grab active:cursor-grabbing z-10 p-1 rounded bg-gray-700 text-gray-400 hover:text-white transition-opacity"
        style={{ opacity: isDragging ? 1 : undefined }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
        </svg>
      </div>
      <div className="group">
        <BlockRenderer block={block} isEditor isSelected={isSelected} onClick={onSelect} />
      </div>
    </div>
  );
}

export default function EditorCanvas({
  blocks,
  selectedBlockId,
  viewport,
  onSelectBlock,
  onMoveBlock,
  onDeselectAll,
}: EditorCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onMoveBlock(active.id as string, over.id as string);
    }
  };

  const viewportWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-950 p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDeselectAll();
      }}
    >
      <div
        className="mx-auto min-h-[600px] bg-gray-900 rounded-lg shadow-2xl transition-all duration-300"
        style={{ maxWidth: viewportWidth[viewport] }}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-600">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm">Add blocks from the left panel or load a template</p>
                </div>
              </div>
            ) : (
              <div className="pl-10">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={onSelectBlock}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
