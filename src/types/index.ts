import { User, Funnel, Link, Click, Group, Round, Credit, Domain, TrackingPixel, Webhook } from "@prisma/client";

export type { User, Funnel, Link, Click, Group, Round, Credit, Domain, TrackingPixel, Webhook };

export type Role = "USER" | "ADMIN";
export type RoundStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type CreditType = "PURCHASE" | "USAGE" | "BONUS" | "REFUND";
export type PixelType = "FACEBOOK" | "GOOGLE_ANALYTICS" | "CUSTOM";

export interface FunnelWithLinks extends Funnel {
  links: Link[];
  _count?: { clicks: number };
}

export interface ClickData {
  ip: string;
  country?: string;
  city?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  referer?: string;
}

export interface AnalyticsData {
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
  clicksByCountry: { country: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
  topLinks: { url: string; clicks: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  totalFunnels: number;
  totalClicks: number;
  totalLinks: number;
  credits: number;
  recentClicks: { date: string; count: number }[];
}

export interface WebhookEvent {
  type: "user.registered" | "funnel.clicks_reached" | "round.new" | "round.completed";
  data: Record<string, unknown>;
  timestamp: string;
}
