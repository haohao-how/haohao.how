export async function POST(request: Request) {
  const headers: [string, string][] = [];
  request.headers.forEach((value: string, key: string) =>
    headers.push([key, value]),
  );
  // eslint-disable-next-line no-console
  console.log(`req.headers.forEach=${JSON.stringify(headers)}`);
  // eslint-disable-next-line no-console
  console.log(
    `hi from the lambda, cookies=${request.headers.get(`cookie`)}, ${JSON.stringify(request.headers)}`,
  );
  const json = await request.text();
  // eslint-disable-next-line no-console
  console.log(`json body = ${json}`);

  return Response.json({
    success: true,
    sessionId: `foo8`,
  });
}
