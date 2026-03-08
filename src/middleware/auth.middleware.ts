import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string | null;
        role: UserRole;
        emailVerified: boolean;
      };
    }
  }
}

const isAuthUserPayload = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
      };

      if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Auth check failed" });
    }
  };
};

export default isAuthUserPayload;
