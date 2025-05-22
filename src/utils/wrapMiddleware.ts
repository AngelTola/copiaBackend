import { Request, Response, NextFunction } from "express";

export const wrapMiddleware = (middleware: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
      if (err) {
        console.error("❌ Error en middleware:", err);
        return res.status(400).json({ message: "Error al procesar archivos" });
      }
      next();
    });
  };
};

