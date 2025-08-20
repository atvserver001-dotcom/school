import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

// 업로드할 스토리지 버킷 이름 (공용 버킷 재사용)
const BUCKET = 'school-assets';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const date = String(form.get('date') ?? '');
    const title = String(form.get('title') ?? '');
    const content = String(form.get('content') ?? '');
    const image = form.get('image') as File | null;

    if (!date || !title || !content) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 });
    }

    // 개행 정규화 (CRLF -> LF)
    const normalizedContent = content.replace(/\r\n/g, '\n');

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const ext = image.name.split('.').pop() || 'png';
      // 공용 버킷 내 폴더 분리 보관
      const objectPath = `histories/hist_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(objectPath, image, { contentType: image.type, upsert: false });

      if (uploadErr) {
        console.error('이미지 업로드 실패:', uploadErr);
        return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 });
      }

      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
      imageUrl = pub.publicUrl ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from('histories')
      .insert([
        {
          date,
          title,
          content: normalizedContent,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('데이터 저장 중 오류 발생:', error);
      return NextResponse.json(
        { error: '데이터 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
