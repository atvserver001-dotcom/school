import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

const BUCKET = 'school-assets';

function extractObjectPathFromUrl(urlString: string): string | null {
  try {
    if (!urlString) return null;
    // 퍼블릭 전체 URL인 경우
    if (/^https?:\/\//i.test(urlString)) {
      const url = new URL(urlString);
      const markerPublic = `/object/public/${BUCKET}/`;
      const idxPublic = url.pathname.indexOf(markerPublic);
      if (idxPublic !== -1) {
        return url.pathname.slice(idxPublic + markerPublic.length);
      }
      // 만약 public 경로가 아니어도 원래 오브젝트 경로만 저장되어 있을 수 있음
      return null;
    }
    // 오브젝트 경로만 저장된 경우 (예: histories/xxx.png)
    return urlString;
  } catch {
    return null;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'ID가 없습니다.' }, { status: 400 });

  try {
    // 기존 데이터 조회 (이미지 경로 확보)
    const { data: existing, error: findErr } = await supabaseAdmin
      .from('histories')
      .select('id, image_url')
      .eq('id', id)
      .single();
    if (findErr) {
      console.error('기존 데이터 조회 실패:', findErr);
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { error: delErr } = await supabaseAdmin
      .from('histories')
      .delete()
      .eq('id', id);
    if (delErr) {
      console.error('삭제 실패:', delErr);
      return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }

    // 스토리지 이미지 정리 (실패해도 무시)
    const objectPath = extractObjectPathFromUrl(existing?.image_url ?? '');
    if (objectPath) {
      await supabaseAdmin.storage.from(BUCKET).remove([objectPath]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('삭제 처리 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'ID가 없습니다.' }, { status: 400 });

  try {
    const form = await request.formData();
    const date = String(form.get('date') ?? '');
    const title = String(form.get('title') ?? '');
    const content = String(form.get('content') ?? '');
    const image = form.get('image') as File | null;

    if (!date || !title || !content) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 });
    }

    // 기존 데이터 조회 (기존 이미지 경로 확보)
    const { data: existing, error: findErr } = await supabaseAdmin
      .from('histories')
      .select('id, image_url')
      .eq('id', id)
      .single();
    if (findErr) {
      console.error('기존 데이터 조회 실패:', findErr);
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
    }

    const normalizedContent = content.replace(/\r\n/g, '\n');

    let nextImageUrl: string | null | undefined = undefined; // undefined면 변경 없음

    if (image && image.size > 0) {
      const ext = image.name.split('.').pop() || 'png';
      const objectPath = `histories/hist_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(objectPath, image, { contentType: image.type, upsert: false });
      if (uploadErr) {
        console.error('이미지 업로드 실패:', uploadErr);
        return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 });
      }
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
      nextImageUrl = pub.publicUrl ?? null;

      // 기존 이미지 삭제 (실패 무시)
      const oldObjectPath = extractObjectPathFromUrl(existing?.image_url ?? '');
      if (oldObjectPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldObjectPath]);
      }
    }

    const updatePayload: any = {
      date,
      title,
      content: normalizedContent,
    };
    if (nextImageUrl !== undefined) {
      updatePayload.image_url = nextImageUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('histories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('업데이트 실패:', error);
      return NextResponse.json({ error: '업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('업데이트 처리 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


