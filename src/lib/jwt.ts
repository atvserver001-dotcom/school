import jwt from "jsonwebtoken";

type JwtPayloadBase = {
  userId: string;
  loginId: string;
  role: string;
  name: string | null;
  email: string | null;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET 환경변수가 설정되어 있지 않습니다.");
  }
  return secret;
}

export function signJwt(payload: JwtPayloadBase, expiresIn: number  = 60 * 60 * 24 * 1): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt<T = JwtPayloadBase>(token: string): T | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
}

export type { JwtPayloadBase };


