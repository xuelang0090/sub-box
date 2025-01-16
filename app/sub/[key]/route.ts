import { NextResponse } from "next/server";

import { subscriptionService } from "@/server/services/subscription-service";
import { userService } from "@/server/services/user-service";
import { nodeClientService } from "@/server/services/node-client-service";
import { clashConfigService } from "@/server/services/clash-config-service";
import { type NodeClient } from "@/types";

export async function GET(request: Request, { params }: { params: { key: string } }) {
  try {
    // 1. 查找用户
    const user = await userService.findBySubscriptionKey(params.key);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    // 2. 获取用户的所有已启用节点
    const allClients = await nodeClientService.getByUserId(user.id);
    
    const enabledClients = allClients.filter((client: NodeClient) => client.enable);

    // 3. 生成订阅内容
    const originalYaml = await subscriptionService.generateSubscription({
      enabledClients,
      subconverterId: user.subconverterId,
    });

    // 4. 检查是否需要合并配置
    const url = new URL(request.url);
    const configKey = url.searchParams.get("config");
    let finalYaml = originalYaml;

    if (configKey) {
      const config = await clashConfigService.getAll();
      const targetConfig = config.find(c => c.key === configKey);
      if (targetConfig) {
        finalYaml = await clashConfigService.mergeConfig(originalYaml, targetConfig);
      }
    }

    // 5. 返回最终的 YAML
    return new NextResponse(finalYaml, {
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
