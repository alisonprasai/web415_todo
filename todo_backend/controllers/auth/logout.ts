import { Request, Response } from "express";

const logout = async (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Logout successful (delete token on client side)",
  });
};

export default logout;