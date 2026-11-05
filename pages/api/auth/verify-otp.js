import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { createEmbeddedWallet } from "../../../lib/wallet";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, code, purpose = "signup", fullName, password } = req.body || {};
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !/^\d{6}$/.test(code || "")) return res.status(400).json({ error: "A 6-digit verification code is required" });

  try {
    const challenge = await prisma.otpChallenge.findFirst({
      where: { email: normalizedEmail, purpose },
      orderBy: { createdAt: "desc" },
    });
    if (!challenge || challenge.expiresAt < new Date()) return res.status(410).json({ error: "This verification code has expired" });
    if (challenge.attempts >= 5) return res.status(429).json({ error: "Too many invalid attempts. Request a new code" });
    const valid = await bcrypt.compare(code, challenge.codeHash);
    if (!valid) {
      await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
      return res.status(401).json({ error: "Invalid verification code" });
    }

    if (purpose === "reset") {
      return res.status(200).json({ verified: true, resetToken: challenge.id });
    }

    const signupPayload = challenge.payload ? JSON.parse(challenge.payload) : null;
    if (!signupPayload?.fullName || !signupPayload?.passwordHash) return res.status(400).json({ error: "Signup details are missing" });
    if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) return res.status(409).json({ error: "An account with this email already exists" });
    const wallet = createEmbeddedWallet();
    const user = await prisma.user.create({
      data: {
        name: signupPayload.fullName,
        email: normalizedEmail,
        passwordHash: signupPayload.passwordHash,
        emailVerified: new Date(),
        walletAddress: wallet.address,
        encryptedWalletKey: wallet.encryptedPrivateKey,
      },
      select: { id: true, name: true, email: true, walletAddress: true },
    });
    await prisma.otpChallenge.delete({ where: { id: challenge.id } });
    return res.status(201).json({ user });
  } catch (error) {
    console.error("OTP verification failed", error);
    return res.status(500).json({ error: "Unable to complete account verification" });
  }
}
