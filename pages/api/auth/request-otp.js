import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { sendOtpEmail } from "../../../lib/email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, fullName, password, purpose = "signup" } = req.body || {};
  const normalizedEmail = email?.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail || "")) return res.status(400).json({ error: "Enter a valid email address" });
  if (!["signup", "reset"].includes(purpose)) return res.status(400).json({ error: "Invalid OTP purpose" });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (purpose === "signup" && existingUser) return res.status(409).json({ error: "An account with this email already exists" });
    if (purpose === "reset" && !existingUser) return res.status(404).json({ error: "No account was found for this email" });
    if (purpose === "signup" && (!fullName?.trim() || !password)) return res.status(400).json({ error: "Full name and password are required" });

    const hasSmtpConfig = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
    ].every((key) => process.env[key]);
    const isDemoMode = process.env.NODE_ENV !== "production" && !hasSmtpConfig;
    const code = isDemoMode
      ? "123456"
      : crypto.randomInt(100000, 1000000).toString();
    await prisma.otpChallenge.deleteMany({ where: { email: normalizedEmail, purpose } });
    await prisma.otpChallenge.create({
      data: {
        email: normalizedEmail,
        purpose,
        codeHash: await bcrypt.hash(code, 12),
        payload: purpose === "signup"
          ? JSON.stringify({ fullName: fullName.trim(), passwordHash: await bcrypt.hash(password, 12) })
          : null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    if (!isDemoMode) {
      await sendOtpEmail({ email: normalizedEmail, code, purpose });
    }

    return res.status(202).json({
      message: isDemoMode ? "Demo OTP generated" : "Verification code sent",
      demoMode: isDemoMode,
      ...(isDemoMode ? { testOtp: code } : {}),
    });
  } catch (error) {
    console.error("OTP dispatch failed", error);
    return res.status(503).json({ error: "Email delivery is temporarily unavailable" });
  }
}
