import { NextResponse } from "next/server";

import { subscriptionService } from "@/server/services/subscription-service";

export async function GET(_request: Request, { params }: { params: { key: string } }) {
  try {
    const yaml = await subscriptionService.generateSubscription(params.key);
    return new NextResponse(yaml, {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Subscription generation failed:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}
