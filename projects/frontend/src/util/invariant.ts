export class Invariant extends Error {
  constructor(message?: string) {
    super(message);
    this.name = `InvariantException`;
  }
}

export function invariant(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new Invariant(message);
  }
}
