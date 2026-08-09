import Busboy from "busboy";

/**
 * Parses a multipart/form-data request into { fields, files }.
 * files = [{ filename, mimetype, buffer }]. Used by the admin product
 * create + image upload endpoints (the frontend sends FormData there).
 */
export function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    const bb = Busboy({ headers: req.headers });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (d) => chunks.push(d));
      file.on("end", () => {
        files.push({
          filename: info.filename || "image",
          mimetype: info.mimeType || "application/octet-stream",
          buffer: Buffer.concat(chunks),
        });
      });
    });

    bb.on("error", reject);
    bb.on("finish", () => resolve({ fields, files }));
    req.pipe(bb);
  });
}
