import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SCRYPT_HASH_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

// Phase 1 seed stores hashes as: scrypt$<hex salt>$<hex hash>.
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, salt, storedHash] = passwordHash.split("$");

  if (algorithm !== SCRYPT_HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  let storedBuffer: Buffer;

  try {
    storedBuffer = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }

  if (storedBuffer.length !== SCRYPT_KEY_LENGTH) {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;

  return timingSafeEqual(derivedKey, storedBuffer);
}
