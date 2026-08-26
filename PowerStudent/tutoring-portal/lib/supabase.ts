import { createClient } from "@supabase/supabase-js";

// 服务端专用客户端：使用 Service Role Key，拥有完整数据库读写权限。
// 绝不能把 Service Role Key 暴露到浏览器端代码中。
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 环境变量，请检查 .env.local 或 Vercel 项目设置。"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
