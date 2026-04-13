import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import logger from "./logger";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiServerError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : "Internal server error";
  logger.error(`API Error${context ? ` [${context}]` : ""}`, {
    error: message,
    stack: error instanceof Error ? error.stack : undefined,
  });
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}

export function validateBody<T>(body: unknown, schema: ZodSchema<T>): { data: T } | { error: NextResponse } {
  try {
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { error: apiError(`Validation error: ${messages}`, 422) };
    }
    return { error: apiError("Invalid request body", 400) };
  }
}

export function getUserId(session: any): string {
  return session.user.id;
}
