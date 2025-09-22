import { generateKeyPairSync } from 'node:crypto';

export const generateWgKeypair = () => {
  const { publicKey, privateKey } = generateKeyPairSync('x25519');

  // Get raw 32-byte keys via JWK, then encode as base64 (WireGuard style)
  const pubJwk = publicKey.export({ format: 'jwk' }) as { x: string };
  const privJwk = privateKey.export({ format: 'jwk' }) as { d: string };

  const publicKeyB64 = Buffer.from(pubJwk.x, 'base64url').toString('base64');
  const privateKeyB64 = Buffer.from(privJwk.d, 'base64url').toString('base64');

  return { publicKey: publicKeyB64, privateKey: privateKeyB64 };
};

export const getNetworkBase = (): string => {
  const cidr = process.env.WG_NETWORK_CIDR || '10.0.0.0/24';
  return cidr.split('/')[0];
};

export const nextIpFromExisting = (addresses: string[]): string => {
  const base = getNetworkBase().split('.').slice(0, 3).join('.');
  const used = new Set(addresses.map((a) => Number(a.split('.')[3])));
  for (let host = 2; host < 254; host++) {
    if (!used.has(host)) return `${base}.${host}`;
  }
  throw new Error('No free IPs');
};
