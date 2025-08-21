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
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (e) {
    console.error('API 처리 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


