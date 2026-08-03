import { db, schema } from "@gadget-wallet/db";

export const serverServices = {
  async getHealthStatus() {
    return { ok: true, timestamp: new Date() };
  },
};
