import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

const BUCKET = 'school-assets';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('histories')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('목록 조회 오류:', error);
      return NextResponse.json({ error: '목록 조회 실패' }, { status: 500 });
    }

    // 공개 버킷 기준: 퍼블릭 URL을 그대로 반환 (서명 생략)
    const items = Array.isArray(data) ? data : [];

    return NextResponse.json(items, {
      headers: {
        // 목록은 변동이 잦으므로 브라우저 캐시는 비활성화, CDN은 짧게 허용
        'Cache-Control': 'no-store, s-maxage=60',
      },
    });
  } catch (e) {
    console.error('API 처리 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


