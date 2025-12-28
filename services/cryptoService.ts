
export async function calculateHash(input: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof input === 'string') {
    buffer = new TextEncoder().encode(input);
  } else {
    buffer = input;
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateTimestamp(): string {
  return new Date().toLocaleString();
}
