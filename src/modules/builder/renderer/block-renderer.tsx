"use client";

import { useState, useEffect } from "react";
import { BuilderBlock } from "../types";

interface BlockRendererProps {
  block: BuilderBlock;
  isEditor?: boolean;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  pageId?: string;
}

export default function BlockRenderer({ block, isEditor = false, isSelected = false, onClick, pageId }: BlockRendererProps) {
  const style: React.CSSProperties = { ...block.styles } as React.CSSProperties;

  const wrapperClass = isEditor
    ? `relative group cursor-pointer transition-all ${isSelected ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900" : "hover:ring-1 hover:ring-blue-400/50 hover:ring-offset-1 hover:ring-offset-gray-900"}`
    : "";

  const handleClick = (e: React.MouseEvent) => {
    if (isEditor && onClick) {
      e.stopPropagation();
      onClick(block.id);
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case "heading":
        return (
          <h2 style={style} className={wrapperClass} onClick={handleClick}>
            {block.content}
            {isEditor && <BlockLabel type="Heading" />}
          </h2>
        );

      case "text":
        return (
          <p style={style} className={wrapperClass} onClick={handleClick}>
            {block.content}
            {isEditor && <BlockLabel type="Text" />}
          </p>
        );

      case "image":
        return (
          <div style={style} className={wrapperClass} onClick={handleClick}>
            {block.content || block.props?.src ? (
              <img
                src={block.content || block.props?.src}
                alt={block.props?.alt || "Image"}
                style={{ width: "100%", height: "auto", borderRadius: style.borderRadius }}
              />
            ) : (
              <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center py-16">
                <span className="text-gray-500 text-sm">Click to set image URL</span>
              </div>
            )}
            {isEditor && <BlockLabel type="Image" />}
          </div>
        );

      case "button":
        return (
          <div className={wrapperClass} onClick={handleClick} style={{ textAlign: "center", margin: style.margin }}>
            <a
              href={isEditor ? undefined : (block.props?.href || "#")}
              target={block.props?.target || "_self"}
              style={{ ...style, cursor: "pointer", textDecoration: "none", display: "inline-block" }}
              onClick={(e) => { if (isEditor) e.preventDefault(); }}
            >
              {block.content}
            </a>
            {isEditor && <BlockLabel type="Button" />}
          </div>
        );

      case "section":
        return (
          <div style={style} className={wrapperClass} onClick={handleClick}>
            {block.children?.map((child) => (
              <BlockRenderer key={child.id} block={child} isEditor={isEditor} onClick={onClick} pageId={pageId} />
            ))}
            {(!block.children || block.children.length === 0) && isEditor && (
              <div className="text-center text-gray-600 py-8 text-sm">Empty section</div>
            )}
            {isEditor && <BlockLabel type="Section" />}
          </div>
        );

      case "spacer":
        return (
          <div style={style} className={`${wrapperClass} relative`} onClick={handleClick}>
            {isEditor && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-600">Spacer ({style.height})</span>
              </div>
            )}
            {isEditor && <BlockLabel type="Spacer" />}
          </div>
        );

      case "divider":
        return (
          <div className={wrapperClass} onClick={handleClick} style={{ margin: style.margin }}>
            <div style={{ height: style.height || "1px", backgroundColor: style.backgroundColor || "#374151", maxWidth: style.maxWidth, margin: "0 auto", borderRadius: style.borderRadius }} />
            {isEditor && <BlockLabel type="Divider" />}
          </div>
        );

      case "video":
        return (
          <div style={style} className={wrapperClass} onClick={handleClick}>
            {block.props?.url ? (
              <div style={{ position: "relative", paddingBottom: block.props?.aspectRatio === "16/9" ? "56.25%" : "75%", height: 0, overflow: "hidden", borderRadius: style.borderRadius }}>
                <iframe
                  src={block.props.url}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", borderRadius: style.borderRadius }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center py-20">
                <div className="text-center">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-gray-500 text-sm">Set video URL in properties</span>
                </div>
              </div>
            )}
            {isEditor && <BlockLabel type="Video" />}
          </div>
        );

      case "testimonial":
        return (
          <div style={style} className={`${wrapperClass}`} onClick={handleClick}>
            <svg className="w-8 h-8 mx-auto mb-3 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color: style.color }}>
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p style={{ fontSize: style.fontSize, color: style.color, lineHeight: "1.6", margin: "0 0 16px 0" }}>
              {block.content}
            </p>
            {(block.props?.author || block.props?.role) && (
              <div style={{ marginTop: "12px" }}>
                {block.props?.author && <p style={{ fontWeight: "600", color: style.color, fontSize: "14px", margin: "0" }}>{block.props.author}</p>}
                {block.props?.role && <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>{block.props.role}</p>}
              </div>
            )}
            {isEditor && <BlockLabel type="Testimonial" />}
          </div>
        );

      case "countdown":
        return (
          <div style={style} className={wrapperClass} onClick={handleClick}>
            {block.props?.label && (
              <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500", margin: "0 0 8px 0", textAlign: style.textAlign }}>{block.props.label}</p>
            )}
            <CountdownTimer targetDate={block.props?.targetDate} style={style} isEditor={isEditor} />
            {isEditor && <BlockLabel type="Countdown" />}
          </div>
        );

      case "columns":
        return (
          <div style={{ ...style, display: "flex", flexWrap: "wrap" as const }} className={wrapperClass} onClick={handleClick}>
            {block.children?.map((child) => (
              <div key={child.id} style={{ flex: 1, minWidth: "200px" }}>
                <BlockRenderer block={child} isEditor={isEditor} onClick={onClick} pageId={pageId} />
              </div>
            ))}
            {(!block.children || block.children.length === 0) && isEditor && (
              <div className="text-center text-gray-600 py-8 text-sm w-full">Empty columns — use templates with columns</div>
            )}
            {isEditor && <BlockLabel type="Columns" />}
          </div>
        );

      case "form":
        return (
          <div style={style} className={wrapperClass} onClick={handleClick}>
            <FormBlock block={block} isEditor={isEditor} pageId={pageId} />
            {isEditor && <BlockLabel type="Form" />}
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
}

function BlockLabel({ type }: { type: string }) {
  return (
    <span className="absolute -top-5 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {type}
    </span>
  );
}

function CountdownTimer({ targetDate, style, isEditor }: { targetDate?: string; style: React.CSSProperties; isEditor: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate && isEditor) {
    return <span style={{ fontSize: "14px", color: "#64748b" }}>Set target date in properties</span>;
  }

  const boxStyle: React.CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0 8px",
  };

  return (
    <div style={{ display: "flex", justifyContent: style.textAlign === "center" ? "center" : "flex-start", gap: "4px" }}>
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((item) => (
        <div key={item.label} style={boxStyle}>
          <span style={{ fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color }}>{String(item.value).padStart(2, "0")}</span>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal", marginTop: "2px" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function FormBlock({ block, isEditor, pageId }: { block: BuilderBlock; isEditor: boolean; pageId?: string }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fields = block.formFields || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditor) return;
    setSubmitting(true);
    try {
      await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingPageId: pageId, formBlockId: block.id, data: formData }),
      });
      setSubmitted(true);
    } catch {
      alert("Submission failed");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "24px" }}>
        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        <p style={{ color: "#10b981", fontSize: "18px", fontWeight: "600" }}>Thank you!</p>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>Your submission has been received.</p>
      </div>
    );
  }

  if (fields.length === 0 && isEditor) {
    return (
      <div style={{ textAlign: "center", padding: "24px" }}>
        <p style={{ color: "#64748b", fontSize: "14px" }}>No form fields yet. Add fields in properties panel.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.id} style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#cbd5e1", marginBottom: "6px" }}>
            {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "14px", resize: "vertical" }}
              disabled={isEditor}
            />
          ) : field.type === "select" ? (
            <select
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "14px" }}
              disabled={isEditor}
            >
              <option value="">{field.placeholder || "Select..."}</option>
              {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : field.type === "checkbox" ? (
            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={formData[field.id] === "true"}
                onChange={(e) => setFormData({ ...formData, [field.id]: String(e.target.checked) })}
                disabled={isEditor}
                style={{ width: "16px", height: "16px" }}
              />
              {field.placeholder || field.label}
            </label>
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "14px" }}
              disabled={isEditor}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={isEditor || submitting}
        style={{ width: "100%", padding: "12px", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "600", fontSize: "15px", border: "none", borderRadius: "8px", cursor: isEditor ? "default" : "pointer", opacity: isEditor ? 0.7 : 1 }}
      >
        {submitting ? "Submitting..." : block.content || "Submit"}
      </button>
    </form>
  );
}
