/**
 * Stringify an object with one level of indentation to make diffs more readable.
 */
export function jsonStringifyIndentOneLevel(
  obj: unknown,
  indentString = ``,
): string {
  if (Array.isArray(obj)) {
    // Leave arrays of numbers/strings on one line.
    if (typeof obj[0] === `object`) {
      return `[\n${obj.map((x) => indentString + JSON.stringify(x)).join(`,\n`)}\n]`;
    }
  } else if (typeof obj === `object` && obj !== null) {
    return `{\n${Object.entries(obj)
      .map(
        ([k, v]) => indentString + `${JSON.stringify(k)}:${JSON.stringify(v)}`,
      )
      .join(`,\n`)}\n}`;
  }

  return JSON.stringify(obj);
}
