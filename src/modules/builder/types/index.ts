export type BlockType = "heading" | "text" | "image" | "button" | "section" | "spacer";

export interface BlockStyles {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
  borderRadius?: string;
  width?: string;
  maxWidth?: string;
  height?: string;
  border?: string;
  display?: string;
}

export interface BuilderBlock {
  id: string;
  type: BlockType;
  content: string;
  styles: BlockStyles;
  props?: Record<string, string>;
  children?: BuilderBlock[];
}

export interface LandingPageData {
  id: string;
  name: string;
  slug: string;
  funnelId: string | null;
  published: boolean;
  content: BuilderBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface EditorState {
  blocks: BuilderBlock[];
  selectedBlockId: string | null;
  history: BuilderBlock[][];
  historyIndex: number;
  viewport: "desktop" | "tablet" | "mobile";
  isDirty: boolean;
}

export const BLOCK_DEFINITIONS: Record<BlockType, { label: string; icon: string; defaultContent: string; defaultStyles: BlockStyles }> = {
  heading: {
    label: "Heading",
    icon: "H",
    defaultContent: "Your Heading Here",
    defaultStyles: { fontSize: "32px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "16px 24px", margin: "0" },
  },
  text: {
    label: "Text",
    icon: "T",
    defaultContent: "Write your paragraph text here. Click to edit.",
    defaultStyles: { fontSize: "16px", color: "#d1d5db", textAlign: "left", padding: "12px 24px", margin: "0" },
  },
  image: {
    label: "Image",
    icon: "I",
    defaultContent: "",
    defaultStyles: { width: "100%", maxWidth: "600px", margin: "16px auto", borderRadius: "8px" },
  },
  button: {
    label: "Button",
    icon: "B",
    defaultContent: "Click Here",
    defaultStyles: { fontSize: "16px", fontWeight: "600", color: "#ffffff", backgroundColor: "#3b82f6", padding: "12px 32px", borderRadius: "8px", textAlign: "center", margin: "16px auto", display: "block", border: "none" },
  },
  section: {
    label: "Section",
    icon: "S",
    defaultContent: "",
    defaultStyles: { padding: "48px 24px", backgroundColor: "transparent", maxWidth: "100%" },
  },
  spacer: {
    label: "Spacer",
    icon: "_",
    defaultContent: "",
    defaultStyles: { height: "48px" },
  },
};

export const TEMPLATES: { name: string; blocks: BuilderBlock[] }[] = [
  {
    name: "Hero + CTA",
    blocks: [
      { id: "t1-1", type: "section", content: "", styles: { padding: "80px 24px", backgroundColor: "#0f172a" }, children: [] },
      { id: "t1-2", type: "heading", content: "Transform Your Business Today", styles: { fontSize: "48px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0" } },
      { id: "t1-3", type: "text", content: "Join thousands of entrepreneurs who are already using our platform to grow their business.", styles: { fontSize: "18px", color: "#94a3b8", textAlign: "center", padding: "16px 24px", margin: "0", maxWidth: "600px" } },
      { id: "t1-4", type: "button", content: "Get Started Free", styles: { fontSize: "18px", fontWeight: "600", color: "#ffffff", backgroundColor: "#3b82f6", padding: "16px 48px", borderRadius: "12px", textAlign: "center", margin: "24px auto", display: "block", border: "none" } },
      { id: "t1-5", type: "spacer", content: "", styles: { height: "32px" } },
    ],
  },
  {
    name: "Simple Landing",
    blocks: [
      { id: "t2-1", type: "heading", content: "Welcome", styles: { fontSize: "36px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "32px 24px", margin: "0" } },
      { id: "t2-2", type: "text", content: "This is a simple landing page. Edit this text to match your needs.", styles: { fontSize: "16px", color: "#d1d5db", textAlign: "center", padding: "12px 24px", margin: "0" } },
      { id: "t2-3", type: "spacer", content: "", styles: { height: "24px" } },
      { id: "t2-4", type: "button", content: "Learn More", styles: { fontSize: "16px", fontWeight: "600", color: "#ffffff", backgroundColor: "#8b5cf6", padding: "12px 32px", borderRadius: "8px", textAlign: "center", margin: "16px auto", display: "block", border: "none" } },
    ],
  },
];
