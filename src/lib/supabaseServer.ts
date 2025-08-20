import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되어 있지 않습니다.");
}
if (!supabaseServiceKey) {
  // 로그인 시 users.password 접근을 위해서는 서비스 롤 키가 필요합니다.
  throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되어 있지 않습니다.");
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});


