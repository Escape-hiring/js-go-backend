import { type NextFunction, type Request, type Response } from "express";
import { AuthenticationError } from "../helpers/errors";
import { authenticate } from "../lib/auth";

export const isAuthenticatedMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) return next(new AuthenticationError());

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) return next(new AuthenticationError());

  try {
    const user = await authenticate(token);
    req.user = user;
    return next();
  } catch (error) {
    return next(new AuthenticationError());
  }
};
