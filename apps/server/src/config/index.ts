export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "gadget-wallet-super-secret-jwt-key",
  appUrl: process.env.APP_URL || "http://localhost:5173",
};
