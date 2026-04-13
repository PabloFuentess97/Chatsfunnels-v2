export type BlockType =
  | "heading" | "text" | "image" | "button" | "section" | "spacer"
  | "form" | "video" | "testimonial" | "countdown" | "divider" | "columns";

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
  gap?: string;
  lineHeight?: string;
  letterSpacing?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  opacity?: string;
  boxShadow?: string;
}

export interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select
}

export interface BuilderBlock {
  id: string;
  type: BlockType;
  content: string;
  styles: BlockStyles;
  props?: Record<string, string>;
  children?: BuilderBlock[];
  formFields?: FormField[];
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

export const BLOCK_DEFINITIONS: Record<BlockType, { label: string; icon: string; defaultContent: string; defaultStyles: BlockStyles; category: "basic" | "media" | "advanced" }> = {
  heading: {
    label: "Heading",
    icon: "H",
    category: "basic",
    defaultContent: "Your Heading Here",
    defaultStyles: { fontSize: "32px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "16px 24px", margin: "0" },
  },
  text: {
    label: "Text",
    icon: "T",
    category: "basic",
    defaultContent: "Write your paragraph text here. Click to edit.",
    defaultStyles: { fontSize: "16px", color: "#d1d5db", textAlign: "left", padding: "12px 24px", margin: "0", lineHeight: "1.6" },
  },
  image: {
    label: "Image",
    icon: "I",
    category: "media",
    defaultContent: "",
    defaultStyles: { width: "100%", maxWidth: "600px", margin: "16px auto", borderRadius: "8px" },
  },
  button: {
    label: "Button",
    icon: "B",
    category: "basic",
    defaultContent: "Click Here",
    defaultStyles: { fontSize: "16px", fontWeight: "600", color: "#ffffff", backgroundColor: "#3b82f6", padding: "14px 36px", borderRadius: "8px", textAlign: "center", margin: "16px auto", display: "block", border: "none" },
  },
  section: {
    label: "Section",
    icon: "S",
    category: "basic",
    defaultContent: "",
    defaultStyles: { padding: "48px 24px", backgroundColor: "transparent", maxWidth: "100%" },
  },
  spacer: {
    label: "Spacer",
    icon: "—",
    category: "basic",
    defaultContent: "",
    defaultStyles: { height: "48px" },
  },
  divider: {
    label: "Divider",
    icon: "÷",
    category: "basic",
    defaultContent: "",
    defaultStyles: { margin: "24px auto", maxWidth: "80%", border: "none", height: "1px", backgroundColor: "#374151" },
  },
  video: {
    label: "Video",
    icon: "V",
    category: "media",
    defaultContent: "",
    defaultStyles: { maxWidth: "720px", margin: "24px auto", borderRadius: "12px" },
  },
  testimonial: {
    label: "Testimonial",
    icon: "Q",
    category: "advanced",
    defaultContent: "This product changed my life! I can't recommend it enough.",
    defaultStyles: { fontSize: "18px", color: "#e2e8f0", backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", margin: "16px 24px", textAlign: "center", border: "1px solid #334155", maxWidth: "600px" },
  },
  countdown: {
    label: "Countdown",
    icon: "C",
    category: "advanced",
    defaultContent: "",
    defaultStyles: { textAlign: "center", padding: "24px", color: "#ffffff", fontSize: "36px", fontWeight: "bold", margin: "16px auto" },
  },
  columns: {
    label: "Columns",
    icon: "⊞",
    category: "advanced",
    defaultContent: "",
    defaultStyles: { display: "flex", gap: "24px", padding: "24px", maxWidth: "100%" },
  },
  form: {
    label: "Form",
    icon: "F",
    category: "advanced",
    defaultContent: "Submit",
    defaultStyles: { backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", margin: "16px 24px", maxWidth: "500px", border: "1px solid #334155" },
  },
};

function gid(): string {
  return "blk_" + Math.random().toString(36).substring(2, 10);
}

export const TEMPLATES: { name: string; category: string; description: string; blocks: BuilderBlock[] }[] = [
  {
    name: "Hero + CTA",
    category: "Basic",
    description: "Simple hero with call to action",
    blocks: [
      { id: gid(), type: "section", content: "", styles: { padding: "80px 24px", backgroundColor: "#0f172a" } },
      { id: gid(), type: "heading", content: "Transform Your Business Today", styles: { fontSize: "48px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0" } },
      { id: gid(), type: "text", content: "Join thousands of entrepreneurs who are already using our platform.", styles: { fontSize: "18px", color: "#94a3b8", textAlign: "center", padding: "16px 24px", margin: "0", maxWidth: "600px" } },
      { id: gid(), type: "button", content: "Get Started Free", styles: { fontSize: "18px", fontWeight: "600", color: "#ffffff", backgroundColor: "#3b82f6", padding: "16px 48px", borderRadius: "12px", textAlign: "center", margin: "24px auto", display: "block", border: "none" } },
    ],
  },
  {
    name: "Sales Page Pro",
    category: "Premium",
    description: "High-converting sales page with testimonials",
    blocks: [
      { id: gid(), type: "section", content: "", styles: { padding: "100px 24px", backgroundColor: "#0f172a", backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" } },
      { id: gid(), type: "text", content: "LIMITED TIME OFFER", styles: { fontSize: "14px", fontWeight: "600", color: "#f59e0b", textAlign: "center", letterSpacing: "3px", padding: "0", margin: "0 0 16px 0" } },
      { id: gid(), type: "heading", content: "10x Your Revenue With Our Proven System", styles: { fontSize: "52px", fontWeight: "800", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0", lineHeight: "1.1" } },
      { id: gid(), type: "text", content: "The all-in-one platform trusted by 50,000+ businesses worldwide. Start seeing results in just 7 days or get your money back.", styles: { fontSize: "20px", color: "#94a3b8", textAlign: "center", padding: "24px 24px 0", margin: "0 auto", maxWidth: "650px", lineHeight: "1.6" } },
      { id: gid(), type: "spacer", content: "", styles: { height: "16px" } },
      { id: gid(), type: "countdown", content: "", styles: { textAlign: "center", padding: "24px", color: "#f59e0b", fontSize: "42px", fontWeight: "bold", margin: "0 auto" }, props: { targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), label: "Offer expires in:" } },
      { id: gid(), type: "button", content: "Claim Your Spot Now — 50% OFF", styles: { fontSize: "20px", fontWeight: "700", color: "#ffffff", backgroundColor: "#dc2626", padding: "20px 56px", borderRadius: "12px", textAlign: "center", margin: "8px auto", display: "block", border: "none", boxShadow: "0 0 30px rgba(220,38,38,0.4)" } },
      { id: gid(), type: "text", content: "No credit card required • Cancel anytime • 30-day guarantee", styles: { fontSize: "13px", color: "#64748b", textAlign: "center", padding: "12px", margin: "0" } },
      { id: gid(), type: "divider", content: "", styles: { margin: "48px auto", maxWidth: "60%", height: "1px", backgroundColor: "#334155" } },
      { id: gid(), type: "heading", content: "What Our Customers Say", styles: { fontSize: "32px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0 0 24px 0" } },
      { id: gid(), type: "testimonial", content: "This platform literally doubled our conversion rate in 2 weeks. The ROI is insane.", styles: { fontSize: "18px", color: "#e2e8f0", backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", margin: "16px auto", textAlign: "center", border: "1px solid #334155", maxWidth: "600px" }, props: { author: "Sarah Johnson", role: "CEO, TechStart", avatar: "" } },
      { id: gid(), type: "testimonial", content: "I was skeptical at first, but the results speak for themselves. Best investment this year.", styles: { fontSize: "18px", color: "#e2e8f0", backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", margin: "16px auto", textAlign: "center", border: "1px solid #334155", maxWidth: "600px" }, props: { author: "Mike Chen", role: "Founder, GrowthLab", avatar: "" } },
      { id: gid(), type: "spacer", content: "", styles: { height: "32px" } },
      { id: gid(), type: "button", content: "Start Your Free Trial", styles: { fontSize: "18px", fontWeight: "600", color: "#ffffff", backgroundColor: "#3b82f6", padding: "16px 48px", borderRadius: "12px", textAlign: "center", margin: "16px auto", display: "block", border: "none" } },
    ],
  },
  {
    name: "Lead Capture",
    category: "Premium",
    description: "Lead generation page with form",
    blocks: [
      { id: gid(), type: "section", content: "", styles: { padding: "80px 24px", backgroundColor: "#0f172a" } },
      { id: gid(), type: "heading", content: "Get Your Free Strategy Guide", styles: { fontSize: "44px", fontWeight: "800", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0", lineHeight: "1.1" } },
      { id: gid(), type: "text", content: "Download our 50-page playbook used by Fortune 500 companies to scale their marketing.", styles: { fontSize: "18px", color: "#94a3b8", textAlign: "center", padding: "16px 24px", margin: "0 auto", maxWidth: "550px" } },
      { id: gid(), type: "spacer", content: "", styles: { height: "16px" } },
      { id: gid(), type: "form", content: "Download Now — It's Free", styles: { backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", margin: "0 auto", maxWidth: "460px", border: "1px solid #334155" }, formFields: [
        { id: "f1", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
        { id: "f2", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
        { id: "f3", type: "tel", label: "Phone (optional)", placeholder: "+1 (555) 000-0000", required: false },
      ] },
      { id: gid(), type: "text", content: "We respect your privacy. Unsubscribe at any time.", styles: { fontSize: "12px", color: "#64748b", textAlign: "center", padding: "12px", margin: "0" } },
    ],
  },
  {
    name: "Webinar Registration",
    category: "Premium",
    description: "Webinar signup with countdown",
    blocks: [
      { id: gid(), type: "section", content: "", styles: { padding: "80px 24px", backgroundColor: "#0f172a", backgroundImage: "linear-gradient(180deg, #0f172a 0%, #1a1a2e 100%)" } },
      { id: gid(), type: "text", content: "FREE LIVE WEBINAR", styles: { fontSize: "14px", fontWeight: "700", color: "#10b981", textAlign: "center", letterSpacing: "3px", padding: "0", margin: "0 0 16px 0" } },
      { id: gid(), type: "heading", content: "How to Build a 6-Figure Funnel in 30 Days", styles: { fontSize: "44px", fontWeight: "800", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0", lineHeight: "1.15" } },
      { id: gid(), type: "text", content: "Join our expert panel and learn step-by-step how top marketers are building funnels that convert at 15%+", styles: { fontSize: "18px", color: "#94a3b8", textAlign: "center", padding: "20px 24px 0", margin: "0 auto", maxWidth: "600px", lineHeight: "1.6" } },
      { id: gid(), type: "countdown", content: "", styles: { textAlign: "center", padding: "32px", color: "#10b981", fontSize: "48px", fontWeight: "bold", margin: "0 auto" }, props: { targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), label: "Webinar starts in:" } },
      { id: gid(), type: "video", content: "", styles: { maxWidth: "640px", margin: "0 auto 32px", borderRadius: "12px" }, props: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", aspectRatio: "16/9" } },
      { id: gid(), type: "form", content: "Reserve My Seat", styles: { backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", margin: "0 auto", maxWidth: "460px", border: "1px solid #334155" }, formFields: [
        { id: "f1", type: "text", label: "Your Name", placeholder: "Enter your name", required: true },
        { id: "f2", type: "email", label: "Your Email", placeholder: "Enter your email", required: true },
      ] },
      { id: gid(), type: "text", content: "Only 100 spots available. Reserve yours now!", styles: { fontSize: "14px", color: "#f59e0b", textAlign: "center", padding: "12px", margin: "0", fontWeight: "600" } },
    ],
  },
  {
    name: "Product Launch",
    category: "Premium",
    description: "Product launch with features and video",
    blocks: [
      { id: gid(), type: "section", content: "", styles: { padding: "100px 24px", backgroundColor: "#0f172a" } },
      { id: gid(), type: "text", content: "INTRODUCING", styles: { fontSize: "13px", fontWeight: "700", color: "#8b5cf6", textAlign: "center", letterSpacing: "4px", padding: "0", margin: "0 0 12px 0" } },
      { id: gid(), type: "heading", content: "The Future of Marketing Automation", styles: { fontSize: "56px", fontWeight: "800", color: "#ffffff", textAlign: "center", padding: "0 24px", margin: "0", lineHeight: "1.05" } },
      { id: gid(), type: "text", content: "AI-powered funnels. Drag-and-drop builder. Real-time analytics. Everything you need in one platform.", styles: { fontSize: "20px", color: "#94a3b8", textAlign: "center", padding: "20px 24px 0", margin: "0 auto", maxWidth: "650px", lineHeight: "1.6" } },
      { id: gid(), type: "spacer", content: "", styles: { height: "12px" } },
      { id: gid(), type: "button", content: "Watch Demo", styles: { fontSize: "16px", fontWeight: "600", color: "#ffffff", backgroundColor: "#8b5cf6", padding: "14px 40px", borderRadius: "10px", textAlign: "center", margin: "16px auto", display: "block", border: "none" } },
      { id: gid(), type: "spacer", content: "", styles: { height: "24px" } },
      { id: gid(), type: "video", content: "", styles: { maxWidth: "800px", margin: "0 auto", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }, props: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", aspectRatio: "16/9" } },
      { id: gid(), type: "divider", content: "", styles: { margin: "64px auto", maxWidth: "40%", height: "1px", backgroundColor: "#334155" } },
      { id: gid(), type: "heading", content: "Why Choose Us?", styles: { fontSize: "36px", fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: "0", margin: "0 0 32px 0" } },
      { id: gid(), type: "columns", content: "", styles: { display: "flex", gap: "24px", padding: "0 24px", maxWidth: "900px", margin: "0 auto" }, children: [
        { id: gid(), type: "section", content: "", styles: { backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155" }, children: [
          { id: gid(), type: "heading", content: "10x Faster", styles: { fontSize: "24px", fontWeight: "bold", color: "#3b82f6", textAlign: "center", padding: "0", margin: "0 0 8px 0" } },
          { id: gid(), type: "text", content: "Build landing pages in minutes, not hours. Our AI assistant helps you every step.", styles: { fontSize: "14px", color: "#94a3b8", textAlign: "center", padding: "0", margin: "0" } },
        ]},
        { id: gid(), type: "section", content: "", styles: { backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155" }, children: [
          { id: gid(), type: "heading", content: "A/B Testing", styles: { fontSize: "24px", fontWeight: "bold", color: "#10b981", textAlign: "center", padding: "0", margin: "0 0 8px 0" } },
          { id: gid(), type: "text", content: "Test different versions and let data decide. Automatic traffic split and analytics.", styles: { fontSize: "14px", color: "#94a3b8", textAlign: "center", padding: "0", margin: "0" } },
        ]},
        { id: gid(), type: "section", content: "", styles: { backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155" }, children: [
          { id: gid(), type: "heading", content: "Smart Forms", styles: { fontSize: "24px", fontWeight: "bold", color: "#f59e0b", textAlign: "center", padding: "0", margin: "0 0 8px 0" } },
          { id: gid(), type: "text", content: "Capture leads with beautiful forms. Export data, set up webhooks, automate follow-ups.", styles: { fontSize: "14px", color: "#94a3b8", textAlign: "center", padding: "0", margin: "0" } },
        ]},
      ]},
      { id: gid(), type: "spacer", content: "", styles: { height: "48px" } },
      { id: gid(), type: "button", content: "Start Building for Free", styles: { fontSize: "20px", fontWeight: "700", color: "#ffffff", backgroundColor: "#8b5cf6", padding: "18px 56px", borderRadius: "12px", textAlign: "center", margin: "0 auto", display: "block", border: "none", boxShadow: "0 0 30px rgba(139,92,246,0.3)" } },
    ],
  },
  {
    name: "Thank You Page",
    category: "Basic",
    description: "Post-conversion thank you page",
    blocks: [
      { id: gid(), type: "section", content: "", styles: { padding: "100px 24px", backgroundColor: "#0f172a", textAlign: "center" } },
      { id: gid(), type: "heading", content: "Thank You!", styles: { fontSize: "48px", fontWeight: "800", color: "#10b981", textAlign: "center", padding: "0", margin: "0 0 16px 0" } },
      { id: gid(), type: "text", content: "Your registration was successful. Check your email for next steps.", styles: { fontSize: "20px", color: "#94a3b8", textAlign: "center", padding: "0 24px", margin: "0 auto", maxWidth: "500px" } },
      { id: gid(), type: "spacer", content: "", styles: { height: "32px" } },
      { id: gid(), type: "button", content: "Go to Dashboard", styles: { fontSize: "16px", fontWeight: "600", color: "#ffffff", backgroundColor: "#3b82f6", padding: "14px 40px", borderRadius: "8px", textAlign: "center", margin: "0 auto", display: "block", border: "none" } },
    ],
  },
];
