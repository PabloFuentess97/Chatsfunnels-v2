"use client";

import { BuilderBlock, BlockStyles, FormField, BlockType } from "../types";

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

  const addFormField = () => {
    const fields = [...(block.formFields || [])];
    fields.push({
      id: "ff_" + Math.random().toString(36).substring(2, 8),
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
    });
    onUpdate(block.id, { formFields: fields });
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    const fields = (block.formFields || []).map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    onUpdate(block.id, { formFields: fields });
  };

  const removeFormField = (fieldId: string) => {
    const fields = (block.formFields || []).filter((f) => f.id !== fieldId);
    onUpdate(block.id, { formFields: fields });
  };

  const hasTypography = ["heading", "text", "button", "testimonial", "countdown"].includes(block.type);
  const hasContent = !["spacer", "section", "divider", "columns", "countdown"].includes(block.type);

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

      <div className="p-4 space-y-4">
        {/* Content */}
        {hasContent && block.type !== "form" && block.type !== "video" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {block.type === "image" ? "Image URL" : "Content"}
            </label>
            {block.type === "text" || block.type === "testimonial" ? (
              <textarea value={block.content} onChange={(e) => updateContent(e.target.value)} rows={3} className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            ) : (
              <input type="text" value={block.content} onChange={(e) => updateContent(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            )}
          </div>
        )}

        {/* Form: button text */}
        {block.type === "form" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Submit Button Text</label>
            <input type="text" value={block.content} onChange={(e) => updateContent(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        )}

        {/* Button props */}
        {block.type === "button" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Link URL</label>
            <input type="text" value={block.props?.href || ""} onChange={(e) => updateProp("href", e.target.value)} placeholder="https://..." className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        )}

        {/* Image alt */}
        {block.type === "image" && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Alt Text</label>
            <input type="text" value={block.props?.alt || ""} onChange={(e) => updateProp("alt", e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        )}

        {/* Video props */}
        {block.type === "video" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Video Embed URL</label>
              <input type="text" value={block.props?.url || ""} onChange={(e) => updateProp("url", e.target.value)} placeholder="https://youtube.com/embed/..." className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Aspect Ratio</label>
              <select value={block.props?.aspectRatio || "16/9"} onChange={(e) => updateProp("aspectRatio", e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white">
                <option value="16/9">16:9</option>
                <option value="4/3">4:3</option>
                <option value="1/1">1:1</option>
              </select>
            </div>
          </>
        )}

        {/* Testimonial props */}
        {block.type === "testimonial" && (
          <>
            <SectionLabel>Author Info</SectionLabel>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Author Name</label>
              <input type="text" value={block.props?.author || ""} onChange={(e) => updateProp("author", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Role / Company</label>
              <input type="text" value={block.props?.role || ""} onChange={(e) => updateProp("role", e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
            </div>
          </>
        )}

        {/* Countdown props */}
        {block.type === "countdown" && (
          <>
            <SectionLabel>Countdown</SectionLabel>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Target Date</label>
              <input type="datetime-local" value={(block.props?.targetDate || "").slice(0, 16)} onChange={(e) => updateProp("targetDate", new Date(e.target.value).toISOString())} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Label Text</label>
              <input type="text" value={block.props?.label || ""} onChange={(e) => updateProp("label", e.target.value)} placeholder="Offer expires in:" className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
            </div>
          </>
        )}

        {/* ─── FORM FIELDS EDITOR ─── */}
        {block.type === "form" && (
          <>
            <SectionLabel>Form Fields</SectionLabel>
            <div className="space-y-3">
              {(block.formFields || []).map((field, idx) => (
                <div key={field.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500 uppercase">Field {idx + 1}</span>
                    <button onClick={() => removeFormField(field.id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Type</label>
                      <select value={field.type} onChange={(e) => updateFormField(field.id, { type: e.target.value as FormField["type"] })} className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white">
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Label</label>
                      <input type="text" value={field.label} onChange={(e) => updateFormField(field.id, { label: e.target.value })} className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Placeholder</label>
                      <input type="text" value={field.placeholder || ""} onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })} className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white" />
                    </div>
                    {field.type === "select" && (
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Options (comma separated)</label>
                        <input type="text" value={(field.options || []).join(", ")} onChange={(e) => updateFormField(field.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white" placeholder="Option A, Option B" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-xs text-gray-400">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateFormField(field.id, { required: e.target.checked })} className="rounded" />
                      Required
                    </label>
                  </div>
                </div>
              ))}
              <button onClick={addFormField} className="w-full px-3 py-2 rounded-lg border border-dashed border-gray-600 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                + Add Field
              </button>
            </div>
          </>
        )}

        {/* Typography */}
        {hasTypography && (
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
                  <button key={align} onClick={() => updateStyle("textAlign", align)} className={`flex-1 py-1 text-xs rounded ${block.styles.textAlign === align ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
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
          {!["spacer", "divider"].includes(block.type) && (
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
        <SectionLabel>Dimensions</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {(block.type === "spacer" || block.type === "divider") && (
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

        {/* Box Shadow */}
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">Box Shadow</label>
          <input type="text" value={block.styles.boxShadow || ""} onChange={(e) => updateStyle("boxShadow", e.target.value)} placeholder="0 4px 20px rgba(0,0,0,0.3)" className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
        </div>
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
