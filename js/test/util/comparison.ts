export function assertBuffersEqual(
  b1: Buffer | Uint8Array,
  b2: Buffer | Uint8Array
): void {
  if (!(b1 instanceof Buffer)) {
    b1 = Buffer.from(b1);
  }
  if (!(b2 instanceof Buffer)) {
    b2 = Buffer.from(b2);
  }

  return expect(b1.toString("hex")).toBe(b2.toString("hex"));
}
