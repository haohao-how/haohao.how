/**
 * Stringify an object with one level of indentation to make diffs more readable.
 */
export function jsonStringifyIndentOneLevel(
  obj: unknown,
  indentString = ` `,
): string {
  return Array.isArray(obj)
    ? `[\n${obj.map((x) => indentString + JSON.stringify(x)).join(`,\n`)}\n]`
    : typeof obj === `object` && obj !== null
      ? `{\n${Object.entries(obj)
          .map(
            ([k, v]) =>
              indentString + `${JSON.stringify(k)}: ${JSON.stringify(v)}`,
          )
          .join(`,\n`)}\n}`
      : JSON.stringify(obj);
}
