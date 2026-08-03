declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    JWT_SECRET: string;
    APP_URL: string;
    PORT: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    NODE_ENV: "development" | "production" | "test";
    API_PORT?: string;
  }
}

interface ImportMeta {
  dir: string;
}