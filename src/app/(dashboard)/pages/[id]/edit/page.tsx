"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBuilder } from "@/modules/builder/hooks/use-builder";
import { BuilderBlock, BlockType } from "@/modules/builder/types";
import EditorToolbar from "@/modules/builder/components/editor-toolbar";
import BlockPalette from "@/modules/builder/components/block-palette";
import EditorCanvas from "@/modules/builder/components/editor-canvas";
import PropertiesPanel from "@/modules/builder/components/properties-panel";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [pageName, setPageName] = useState("Loading...");
  const [pageSlug, setPageSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const {
    state,
    selectedBlock,
    canUndo,
    canRedo,
    addBlock,
    removeBlock,
    selectBlock,
    updateBlock,
    moveBlock,
    duplicateBlock,
    setBlocks,
    setViewport,
    undo,
    redo,
    markSaved,
    handleKeyDown,
    setAutoSaveCallback,
  } = useBuilder();

  // Load page data
  useEffect(() => {
    fetch(`/api/landing-pages/${params.id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setPageName(r.data.name);
          setPageSlug(r.data.slug);
          setIsPublished(r.data.published);
          const content = Array.isArray(r.data.content) ? r.data.content : [];
          setBlocks(content);
          setLoaded(true);
        } else {
          router.push("/pages");
        }
      })
      .catch(() => router.push("/pages"));
  }, [params.id, router, setBlocks]);

  // Save function
  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/landing-pages/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: state.blocks }),
      });
      markSaved();
    } catch (err) {
      console.error("Save failed:", err);
    }
    setIsSaving(false);
  }, [params.id, state.blocks, markSaved]);

  // Setup auto-save
  useEffect(() => {
    setAutoSaveCallback(save);
  }, [save, setAutoSaveCallback]);

  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Ctrl+S to save
  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    document.addEventListener("keydown", handleSave);
    return () => document.removeEventListener("keydown", handleSave);
  }, [save]);

  const togglePublish = async () => {
    const newState = !isPublished;
    await fetch(`/api/landing-pages/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: newState, content: state.blocks }),
    });
    setIsPublished(newState);
    markSaved();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state.blocks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const blocks = JSON.parse(text) as BuilderBlock[];
        if (Array.isArray(blocks)) setBlocks(blocks);
      } catch {
        alert("Invalid JSON file");
      }
    };
    input.click();
  };

  const handleLoadTemplate = (blocks: BuilderBlock[]) => {
    if (state.blocks.length > 0 && !confirm("This will replace all current blocks. Continue?")) return;
    setBlocks(blocks.map((b) => ({ ...b, id: "blk_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36) })));
  };

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950 z-50">
      <EditorToolbar
        pageName={pageName}
        isDirty={state.isDirty}
        isSaving={isSaving}
        isPublished={isPublished}
        canUndo={canUndo}
        canRedo={canRedo}
        viewport={state.viewport}
        onSave={save}
        onUndo={undo}
        onRedo={redo}
        onSetViewport={setViewport}
        onTogglePublish={togglePublish}
        previewUrl={isPublished ? `/lp/${pageSlug}` : ""}
      />

      <div className="flex flex-1 overflow-hidden">
        <BlockPalette
          onAddBlock={(type: BlockType) => addBlock(type)}
          onLoadTemplate={handleLoadTemplate}
          onExport={handleExport}
          onImport={handleImport}
        />

        <EditorCanvas
          blocks={state.blocks}
          selectedBlockId={state.selectedBlockId}
          viewport={state.viewport}
          onSelectBlock={selectBlock}
          onMoveBlock={moveBlock}
          onDeselectAll={() => selectBlock(null)}
        />

        <PropertiesPanel
          block={selectedBlock}
          onUpdate={updateBlock}
          onDuplicate={duplicateBlock}
          onRemove={removeBlock}
        />
      </div>
    </div>
  );
}
