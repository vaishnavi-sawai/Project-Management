import { getServerSession } from "next-auth";
import { authConfig } from "./config";
import type { NextApiRequest, NextApiResponse } from "next";

export const getServerAuthSession = async (opts: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  const { req, res } = opts;
  const session = await getServerSession(req, res, authConfig);
  return session;
};
