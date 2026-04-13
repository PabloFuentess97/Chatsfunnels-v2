"use client";

import { BuilderBlock } from "../types";

interface BlockRendererProps {
  block: BuilderBlock;
  isEditor?: boolean;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

export default function BlockRenderer({ block, isEditor = false, isSelected = false, onClick }: BlockRendererProps) {
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
              style={{ ...style, cursor: isEditor ? "pointer" : "pointer", textDecoration: "none", display: "inline-block" }}
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
              <BlockRenderer key={child.id} block={child} isEditor={isEditor} onClick={onClick} />
            ))}
            {(!block.children || block.children.length === 0) && isEditor && (
              <div className="text-center text-gray-600 py-8 text-sm">Empty section</div>
            )}
            {isEditor && <BlockLabel type="Section" />}
          </div>
        );

      case "spacer":
        return (
          <div style={style} className={wrapperClass} onClick={handleClick}>
            {isEditor && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-600">Spacer ({style.height})</span>
              </div>
            )}
            {isEditor && <BlockLabel type="Spacer" />}
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
    <span className="absolute -top-5 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {type}
    </span>
  );
}
