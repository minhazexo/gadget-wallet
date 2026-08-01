/// <reference types="bun-types" />

declare module "bun" {
  export {};
}

declare namespace Bun {
  export function file(path: string | URL, options?: { type?: string }): BunFile;
  export function serve(options: unknown): Server;
  interface BunFile extends File {
    exists(): Promise<boolean>;
  }
  interface Server {
    fetch: (request: Request) => Promise<Response> | Response;
    port: number;
    stop(): void;
  }
}

interface ImportMeta {
  dir: string;
}
