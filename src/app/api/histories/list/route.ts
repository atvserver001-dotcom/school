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

    // 이미지 URL을 서명 URL로 변환 (버킷이 비공개여도 접근 가능하도록)
    const items = Array.isArray(data)
      ? await Promise.all(
          data.map(async (row: any) => {
            const originalUrl: string | null = row.image_url ?? null;
            if (!originalUrl) return row;
            try {
              let objectPath: string | null = null;
              // 케이스 1: 전체 퍼블릭 URL (공개/비공개 상관없이 형식만 이용)
              if (/^https?:\/\//i.test(originalUrl)) {
                const url = new URL(originalUrl);
                const marker = `/object/public/${BUCKET}/`;
                const idx = url.pathname.indexOf(marker);
                if (idx !== -1) {
                  objectPath = url.pathname.slice(idx + marker.length);
                }
              }
              // 케이스 2: DB에 오브젝트 경로만 저장된 경우 (예: "histories/xxx.png")
              if (!objectPath && !/^https?:\/\//i.test(originalUrl)) {
                objectPath = originalUrl;
              }
              if (!objectPath) return row; // 인식 불가한 형식이면 원본 유지

              const { data: signed, error: signErr } = await supabaseAdmin
                .storage
                .from(BUCKET)
                .createSignedUrl(objectPath, 60 * 60); // 1시간 유효
              if (signErr || !signed?.signedUrl) return row;
              return { ...row, image_url: signed.signedUrl };
            } catch {
              return row;
            }
          })
        )
      : [];

    return NextResponse.json(items);
  } catch (e) {
    console.error('API 처리 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


