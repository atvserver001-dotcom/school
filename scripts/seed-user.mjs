import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL 환경변수가 없습니다. .env.local에 설정하세요.');
  process.exit(1);
}
if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. .env.local에 설정하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const loginId = process.env.SEED_LOGIN_ID || 'admin';
const plainPassword = process.env.SEED_PASSWORD || 'admin1234';
const role = process.env.SEED_ROLE || 'admin';
const name = process.env.SEED_NAME || '테스트관리자';

async function main() {
  const { data: exist, error: existErr } = await supabase
    .from('users')
    .select('id')
    .eq('login_id', loginId)
    .maybeSingle();

  if (existErr) {
    console.error('조회 오류:', existErr);
    process.exit(1);
  }

  if (exist) {
    console.log('이미 존재하는 아이디입니다:', loginId);
    console.log('로그인 정보 ->', { loginId, password: plainPassword });
    return;
  }

  const hashed = await bcrypt.hash(plainPassword, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ login_id: loginId, password: hashed, role, name })
    .select('id, login_id')
    .maybeSingle();

  if (error || !data) {
    console.error('생성 실패:', error);
    process.exit(1);
  }

  console.log('생성 성공:', data);
  console.log('로그인 정보 ->', { loginId, password: plainPassword });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


