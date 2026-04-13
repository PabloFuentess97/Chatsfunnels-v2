"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import { BuilderBlock, EditorState, BlockType, BLOCK_DEFINITIONS } from "../types";

type Action =
  | { type: "ADD_BLOCK"; payload: { blockType: BlockType; index?: number } }
  | { type: "REMOVE_BLOCK"; payload: string }
  | { type: "SELECT_BLOCK"; payload: string | null }
  | { type: "UPDATE_BLOCK"; payload: { id: string; updates: Partial<BuilderBlock> } }
  | { type: "MOVE_BLOCK"; payload: { activeId: string; overId: string } }
  | { type: "DUPLICATE_BLOCK"; payload: string }
  | { type: "SET_BLOCKS"; payload: BuilderBlock[] }
  | { type: "SET_VIEWPORT"; payload: "desktop" | "tablet" | "mobile" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED" };

function generateId(): string {
  return "blk_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function pushHistory(state: EditorState, blocks: BuilderBlock[]): Partial<EditorState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(blocks)));
  // Keep max 50 history entries
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "ADD_BLOCK": {
      const def = BLOCK_DEFINITIONS[action.payload.blockType];
      const newBlock: BuilderBlock = {
        id: generateId(),
        type: action.payload.blockType,
        content: def.defaultContent,
        styles: { ...def.defaultStyles },
      };
      const blocks = [...state.blocks];
      const index = action.payload.index ?? blocks.length;
      blocks.splice(index, 0, newBlock);
      return {
        ...state,
        blocks,
        selectedBlockId: newBlock.id,
        isDirty: true,
        ...pushHistory(state, blocks),
      };
    }

    case "REMOVE_BLOCK": {
      const blocks = state.blocks.filter((b) => b.id !== action.payload);
      return {
        ...state,
        blocks,
        selectedBlockId: state.selectedBlockId === action.payload ? null : state.selectedBlockId,
        isDirty: true,
        ...pushHistory(state, blocks),
      };
    }

    case "SELECT_BLOCK":
      return { ...state, selectedBlockId: action.payload };

    case "UPDATE_BLOCK": {
      const blocks = state.blocks.map((b) => {
        if (b.id !== action.payload.id) return b;
        return {
          ...b,
          ...action.payload.updates,
          styles: { ...b.styles, ...(action.payload.updates.styles || {}) },
          props: { ...b.props, ...(action.payload.updates.props || {}) },
        };
      });
      return {
        ...state,
        blocks,
        isDirty: true,
        ...pushHistory(state, blocks),
      };
    }

    case "MOVE_BLOCK": {
      const { activeId, overId } = action.payload;
      if (activeId === overId) return state;
      const blocks = [...state.blocks];
      const oldIndex = blocks.findIndex((b) => b.id === activeId);
      const newIndex = blocks.findIndex((b) => b.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const [moved] = blocks.splice(oldIndex, 1);
      blocks.splice(newIndex, 0, moved);
      return {
        ...state,
        blocks,
        isDirty: true,
        ...pushHistory(state, blocks),
      };
    }

    case "DUPLICATE_BLOCK": {
      const sourceIndex = state.blocks.findIndex((b) => b.id === action.payload);
      if (sourceIndex === -1) return state;
      const source = state.blocks[sourceIndex];
      const duplicate: BuilderBlock = {
        ...JSON.parse(JSON.stringify(source)),
        id: generateId(),
      };
      const blocks = [...state.blocks];
      blocks.splice(sourceIndex + 1, 0, duplicate);
      return {
        ...state,
        blocks,
        selectedBlockId: duplicate.id,
        isDirty: true,
        ...pushHistory(state, blocks),
      };
    }

    case "SET_BLOCKS":
      return {
        ...state,
        blocks: action.payload,
        isDirty: false,
        history: [JSON.parse(JSON.stringify(action.payload))],
        historyIndex: 0,
      };

    case "SET_VIEWPORT":
      return { ...state, viewport: action.payload };

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        blocks: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        isDirty: true,
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        blocks: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        isDirty: true,
      };
    }

    case "MARK_SAVED":
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

export function useBuilder(initialBlocks: BuilderBlock[] = []) {
  const [state, dispatch] = useReducer(reducer, {
    blocks: initialBlocks,
    selectedBlockId: null,
    history: [JSON.parse(JSON.stringify(initialBlocks))],
    historyIndex: 0,
    viewport: "desktop",
    isDirty: false,
  });

  const addBlock = useCallback((blockType: BlockType, index?: number) => {
    dispatch({ type: "ADD_BLOCK", payload: { blockType, index } });
  }, []);

  const removeBlock = useCallback((id: string) => {
    dispatch({ type: "REMOVE_BLOCK", payload: id });
  }, []);

  const selectBlock = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_BLOCK", payload: id });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<BuilderBlock>) => {
    dispatch({ type: "UPDATE_BLOCK", payload: { id, updates } });
  }, []);

  const moveBlock = useCallback((activeId: string, overId: string) => {
    dispatch({ type: "MOVE_BLOCK", payload: { activeId, overId } });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    dispatch({ type: "DUPLICATE_BLOCK", payload: id });
  }, []);

  const setBlocks = useCallback((blocks: BuilderBlock[]) => {
    dispatch({ type: "SET_BLOCKS", payload: blocks });
  }, []);

  const setViewport = useCallback((viewport: "desktop" | "tablet" | "mobile") => {
    dispatch({ type: "SET_VIEWPORT", payload: viewport });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const markSaved = useCallback(() => dispatch({ type: "MARK_SAVED" }), []);

  const selectedBlock = state.selectedBlockId
    ? state.blocks.find((b) => b.id === state.selectedBlockId) || null
    : null;

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) { redo(); } else { undo(); }
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedBlockId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        removeBlock(state.selectedBlockId);
      }
    }
    if (e.key === "Escape") {
      selectBlock(null);
    }
  }, [state.selectedBlockId, undo, redo, removeBlock, selectBlock]);

  // Auto-save timer ref
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onAutoSaveRef = useRef<(() => void) | null>(null);

  const setAutoSaveCallback = useCallback((cb: () => void) => {
    onAutoSaveRef.current = cb;
  }, []);

  useEffect(() => {
    if (state.isDirty && onAutoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        onAutoSaveRef.current?.();
      }, 5000); // Auto-save after 5 seconds of inactivity
    }
    return () => clearTimeout(autoSaveRef.current);
  }, [state.blocks, state.isDirty]);

  return {
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
  };
}
