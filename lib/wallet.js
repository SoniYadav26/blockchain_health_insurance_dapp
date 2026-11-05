import crypto from "crypto";
import { Wallet } from "ethers";

function encryptionKey() {
  const value = process.env.AUTH_WALLET_ENCRYPTION_KEY;
  if (!value || !/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("AUTH_WALLET_ENCRYPTION_KEY must be a 32-byte hex value");
  }
  return Buffer.from(value, "hex");
}

export function createEmbeddedWallet() {
  const wallet = Wallet.createRandom();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(wallet.privateKey, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    address: wallet.address,
    encryptedPrivateKey: Buffer.concat([iv, tag, ciphertext]).toString("base64"),
  };
}
