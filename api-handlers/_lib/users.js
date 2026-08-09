// Canonical user column selector (camelCase aliases) shared by every endpoint
// that returns a user, so the shapes can't drift apart. A login/register/me
// mismatch previously returned snake_case from login while the frontend's
// AuthUser expects createdAt / isActive / twoFactorEnabled (camelCase).
export const USER_SELECT = `id, email, name, role, token_version AS "tokenVersion",
  is_active AS "isActive", two_factor_enabled AS "twoFactorEnabled",
  phone, avatar, created_at AS "createdAt"`;
