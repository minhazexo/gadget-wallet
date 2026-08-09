// Response shapes match the old Hono helpers (apps/server/src/utils/response.ts)
// so the existing frontend keeps working unchanged.

export function ok(res, data, message) {
  return res.status(200).json({ success: true, data, message });
}

export function created(res, data, message) {
  return res.status(201).json({ success: true, data, message });
}

export function fail(res, status, error) {
  return res.status(status).json({ success: false, error });
}

export function paginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
