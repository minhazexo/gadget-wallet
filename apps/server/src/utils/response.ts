import type { Context } from "hono";

export function success(c: Context, data: any, message?: string) {
  return c.json({ success: true, data, message });
}

export function error(c: Context, status: number, error: string) {
  return c.json({ success: false, error }, status);
}

export function paginated(c: Context, data: any[], total: number, page: number, limit: number) {
  return c.json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
