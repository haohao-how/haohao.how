// This is only used when using the `usePopup=false` mode of Sign in with Apple.
export async function POST(request: Request) {
  await request.text();
  // TODO: redirect back
  return Response.json({ success: true });
}
