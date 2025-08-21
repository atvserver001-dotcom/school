import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
const BUCKET = 'school-assets';

function extractObjectPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    // 이미 오브젝트 경로만 저장된 경우
    if (!/^https?:\/\//i.test(url)) return url;
    const u = new URL(url);
    // 퍼블릭 URL
    const publicMarker = `/object/public/${BUCKET}/`;
    let idx = u.pathname.indexOf(publicMarker);
    if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + publicMarker.length));
    // 서명 URL
    const signMarker = `/object/sign/${BUCKET}/`;
    idx = u.pathname.indexOf(signMarker);
    if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + signMarker.length));
  } catch {
    // ignore
  }
  return null;
}

// GET - 역대 교장 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('principals')
      .select('*')
      .order('year', { ascending: false });

    if (error) {
      console.error('Error fetching principals:', error);
      return NextResponse.json({ error: 'Failed to fetch principals' }, { status: 500 });
    }

    // 공개 버킷 기준: DB에는 퍼블릭 URL을 저장하고 그대로 반환 (서명 생략)
    const items = Array.isArray(data) ? data : [];

    return NextResponse.json(
      { data: items },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 새로운 교장 추가
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const yearStr = String(form.get('year') ?? '');
    const name = String(form.get('name') ?? '');
    const image = form.get('image') as File | null;

    // 유효성 검사
    if (!yearStr || !name) {
      return NextResponse.json({ error: 'Year and name are required' }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    // 년도 중복 체크
    const { data: existing } = await supabaseAdmin
      .from('principals')
      .select('id')
      .eq('year', year)
      .single();

    if (existing) {
      return NextResponse.json({ error: '해당 년도에 이미 교장이 등록되어 있습니다.' }, { status: 400 });
    }

    // 이미지 업로드
    let publicImageUrl: string | null = null;
    if (image && image.size > 0) {
      const ext = image.name.split('.').pop() || 'png';
      const objectPath = `principals/principal_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(objectPath, image, { contentType: image.type, upsert: false });
      if (uploadErr) {
        console.error('이미지 업로드 실패:', uploadErr);
        return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 });
      }
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
      publicImageUrl = pub.publicUrl ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from('principals')
      .insert([
        {
          year,
          name: name.trim(),
          image_url: publicImageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating principal:', error);
      return NextResponse.json({ error: 'Failed to create principal' }, { status: 500 });
    }

    // 공개 버킷 기준: 퍼블릭 URL을 그대로 반환
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - 교장 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const yearStr = String(form.get('year') ?? '');
    const name = String(form.get('name') ?? '');
    const image = form.get('image') as File | null;
    const oldImageUrl = (form.get('old_image_url') as string) || '';

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (!yearStr || !name) {
      return NextResponse.json({ error: 'Year and name are required' }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    // 동일 연도 중복 방지 (본인 제외)
    const { data: conflict } = await supabaseAdmin
      .from('principals')
      .select('id')
      .eq('year', year)
      .neq('id', id)
      .maybeSingle();

    if (conflict) {
      return NextResponse.json({ error: '해당 년도에 이미 교장이 등록되어 있습니다.' }, { status: 400 });
    }

    let publicImageUrl: string | null | undefined = undefined; // undefined면 변경 없음
    if (image && image.size > 0) {
      const ext = image.name.split('.').pop() || 'png';
      const objectPath = `principals/principal_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(objectPath, image, { contentType: image.type, upsert: false });
      if (uploadErr) {
        console.error('이미지 업로드 실패:', uploadErr);
        return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 });
      }
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
      publicImageUrl = pub.publicUrl ?? null;

      // 기존 이미지 삭제 시도
      const oldObjectPath = extractObjectPathFromUrl(oldImageUrl);
      if (oldObjectPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldObjectPath]);
      }
    }

    const updatePayload: any = {
      year: Number(year),
      name: String(name).trim(),
      updated_at: new Date().toISOString(),
    };
    if (publicImageUrl !== undefined) {
      updatePayload.image_url = publicImageUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('principals')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating principal:', error);
      return NextResponse.json({ error: 'Failed to update principal' }, { status: 500 });
    }

    // 공개 버킷 기준: 퍼블릭 URL을 그대로 반환
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - 교장 삭제
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idFromQuery = url.searchParams.get('id');
    let id = idFromQuery as string | null;
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // ignore body parse error
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 기존 레코드 조회 (이미지 삭제 위해)
    const { data: existing, error: readErr } = await supabaseAdmin
      .from('principals')
      .select('id, image_url')
      .eq('id', id)
      .maybeSingle();
    if (readErr) {
      console.error('Error reading principal before delete:', readErr);
    }

    // 삭제
    const { error: delErr } = await supabaseAdmin
      .from('principals')
      .delete()
      .eq('id', id);
    if (delErr) {
      console.error('Error deleting principal:', delErr);
      return NextResponse.json({ error: 'Failed to delete principal' }, { status: 500 });
    }

    // 스토리지 파일 삭제 (실패 무시)
    const oldObjectPath = extractObjectPathFromUrl(existing?.image_url ?? null);
    if (oldObjectPath) {
      await supabaseAdmin.storage.from(BUCKET).remove([oldObjectPath]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
