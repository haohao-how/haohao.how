import z from "zod";

const parseString = (x: unknown) => z.string().min(1).parse(x);

export const replicacheLicenseKey = parseString(
  process.env.EXPO_PUBLIC_REPLICACHE_LICENSE_KEY,
);
