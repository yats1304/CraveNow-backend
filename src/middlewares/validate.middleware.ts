import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import sanitize from "mongo-sanitize";

type ValidateSource = "body" | "query" | "params" | "file" | "files";

export const validate =
  <T>(schema: ZodSchema<T>, source: ValidateSource = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      let raw = req[source];

      if (source === "body" && raw) {
        raw = sanitize(JSON.parse(JSON.stringify(raw)));
      }

      const result = schema.safeParse(raw);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join(".") || "root",
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          errors,
        });
      }

      if (source === "body") req.body = result.data;
      if (source === "query") {
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (source === "params") {
        Object.defineProperty(req, "params", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (source === "file") {
        req.file = result.data as Express.Multer.File;
      }
      if (source === "files") {
        req.files = result.data as Express.Multer.File[];
      }

      next();
    } catch (err) {
      next(err);
    }
  };
