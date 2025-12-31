import { NextRequest } from "next/server";

const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, message, tenantId, userId } = body;

  if (!sessionId || !message) {
    return new Response(
      JSON.stringify({ error: "sessionId and message are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Call backend chat endpoint
        const response = await fetch(`${AI_URL}/ai/chat/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            tenant_id: tenantId || "default",
            message: message,
            user_id: userId,
            metadata: {
              source: "frontend",
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: errorText })}\n\n`)
          );
          controller.close();
          return;
        }

        // Check if the response is streaming
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("text/event-stream") && response.body) {
          // Forward streaming response
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          // Non-streaming response - send as single message
          const data = await response.json();

          // Send the message content in chunks to simulate streaming
          const content = data.message || data.content || "";
          const words = content.split(" ");

          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? " " : "");
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`)
            );
            // Small delay to simulate streaming
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          // Send suggestions if available
          if (data.suggestions && data.suggestions.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "suggestions", suggestions: data.suggestions })}\n\n`
              )
            );
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                sessionId: data.session_id || sessionId,
                metadata: data.metadata
              })}\n\n`
            )
          );
        }

        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error"
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Also support GET for simpler use cases
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session");
  const message = searchParams.get("msg");
  const tenantId = searchParams.get("tenant");

  if (!sessionId || !message) {
    return new Response(
      JSON.stringify({ error: "session and msg are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Delegate to POST handler
  const fakeRequest = new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message, tenantId }),
  });

  return POST(new NextRequest(fakeRequest));
}



