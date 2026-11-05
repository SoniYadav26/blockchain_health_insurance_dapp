import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, resetToken, password } = req.body || {};
  if (!email || !resetToken || !password) return res.status(400).json({ error: "Email, reset token, and password are required" });
  try {
    const challenge = await prisma.otpChallenge.findUnique({ where: { id: resetToken } });
    if (!challenge || challenge.expiresAt < new Date() || challenge.email !== email.trim().toLowerCase() || challenge.purpose !== "reset") return res.status(401).json({ error: "Invalid or expired reset token" });
    const user = await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: { passwordHash: await bcrypt.hash(password, 12) },
      select: { id: true },
    });
    await prisma.otpChallenge.delete({ where: { id: challenge.id } });
    return res.status(200).json({ updated: Boolean(user) });
  } catch (error) {
    console.error("Password reset failed", error);
    return res.status(500).json({ error: "Unable to reset password" });
  }
}
