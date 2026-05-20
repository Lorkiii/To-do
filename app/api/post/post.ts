import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { title, content } = await request.json();
  
  return new Response(JSON.stringify({ title, content }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
