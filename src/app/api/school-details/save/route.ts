import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyJwt } from '@/lib/jwt';
import type { Database } from '@/types/database.types';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ message: '인증 필요' }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: '토큰이 유효하지 않습니다.' }, { status: 401 });
    }

    // role 기반 권한 확인 (admin/editor만 쓰기 가능)
    const allowedWriterRoles = new Set(['admin', 'editor']);
    if (!('role' in (payload as any)) || !allowedWriterRoles.has((payload as any).role)) {
      return NextResponse.json({ message: '쓰기 권한이 없습니다.' }, { status: 403 });
    }

    const BUCKET = 'school-assets';
    const extractStorageKey = (url: string | null): string | null => {
      if (!url) return null;
      try {
        const u = new URL(url);
        const idx = u.pathname.indexOf(`/storage/v1/object/public/${BUCKET}/`);
        if (idx === -1) return null;
        const key = u.pathname.slice(idx + `/storage/v1/object/public/${BUCKET}/`.length);
        return decodeURIComponent(key);
      } catch {
        return null;
      }
    };
    const form = await req.formData();

    const foundingDate = (form.get('foundingDate') as string) || null;
    const principalName = (form.get('principalName') as string) || null;

    const greetingImage = form.get('greetingImage') as File | null;
    const schoolLogoImage = form.get('schoolLogoImage') as File | null;
    const principalImage = form.get('principalImage') as File | null;
    const mottoImage = form.get('mottoImage') as File | null;
    const flowerImage = form.get('flowerImage') as File | null;
    const treeImage = form.get('treeImage') as File | null;
    const anthemSheetImage = form.get('anthemSheetImage') as File | null;
    const anthemAudio = form.get('anthemAudio') as File | null;

    const uploadIfAny = async (
      file: File | null,
      folder: string
    ): Promise<{ publicUrl: string | null; key: string | null } | null> => {
      if (!file) return null;
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const path = `${folder}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
        contentType: file.type || undefined,
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
      return { publicUrl: data.publicUrl ?? null, key: path };
    };

    // 기존 레코드 조회 (이전 파일 키 삭제를 위해 필요)
    type SchoolDetailsRow = Database['public']['Tables']['school_details']['Row'];
    type ExistingRow = Pick<
      SchoolDetailsRow,
      | 'id'
      | 'principal_image_url'
      | 'greeting_url'
      | 'school_logo_url'
      | 'motto_url'
      | 'school_flower_url'
      | 'school_tree_url'
      | 'anthem_sheet_url'
      | 'anthem_audio_url'
    >;

    const { data: existingRowData, error: existingErr } = await supabaseAdmin
      .from('school_details')
      .select(
        [
          'id',
          'principal_image_url',
          'greeting_url',
          'school_logo_url',
          'motto_url',
          'school_flower_url',
          'school_tree_url',
          'anthem_sheet_url',
          'anthem_audio_url',
        ].join(', ')
      )
      .eq('id', SINGLETON_ID)
      .maybeSingle();
    if (existingErr && existingErr.code !== 'PGRST116') throw existingErr;
    const existingRow = (existingRowData as unknown) as ExistingRow | null;

    const [
      greetingUpload,
      schoolLogoUpload,
      principalImageUpload,
      mottoUpload,
      flowerUpload,
      treeUpload,
      anthemSheetUpload,
      anthemAudioUpload,
    ] = await Promise.all([
      uploadIfAny(greetingImage, 'greeting'),
      uploadIfAny(schoolLogoImage, 'school_logo'),
      uploadIfAny(principalImage, 'principal'),
      uploadIfAny(mottoImage, 'motto'),
      uploadIfAny(flowerImage, 'flower'),
      uploadIfAny(treeImage, 'tree'),
      uploadIfAny(anthemSheetImage, 'anthem_sheet'),
      uploadIfAny(anthemAudio, 'anthem_audio'),
    ]);

    // 업데이트 시에는 새로 업로드된 항목만 덮어쓰고, 미전송 항목은 유지합니다.
    const baseRow: Record<string, string | null> = {
      principal_name: principalName,
      founding_date: foundingDate,
    };
    if (principalImageUpload?.publicUrl) baseRow.principal_image_url = principalImageUpload.publicUrl;
    if (greetingUpload?.publicUrl) baseRow.greeting_url = greetingUpload.publicUrl;
    if (schoolLogoUpload?.publicUrl) baseRow.school_logo_url = schoolLogoUpload.publicUrl;
    if (mottoUpload?.publicUrl) baseRow.motto_url = mottoUpload.publicUrl;
    if (flowerUpload?.publicUrl) baseRow.school_flower_url = flowerUpload.publicUrl;
    if (treeUpload?.publicUrl) baseRow.school_tree_url = treeUpload.publicUrl;
    if (anthemSheetUpload?.publicUrl) baseRow.anthem_sheet_url = anthemSheetUpload.publicUrl;
    if (anthemAudioUpload?.publicUrl) baseRow.anthem_audio_url = anthemAudioUpload.publicUrl;

    // 단일 로우 보장: 고정 ID로 upsert
    const upsertRow = { id: SINGLETON_ID, ...baseRow } as Record<string, unknown>;
    // 신규 생성 시 빠진 필드까지 채우고 싶다면 아래를 병합하세요
    if (!existingRow) {
      Object.assign(upsertRow, {
        principal_image_url: principalImageUpload?.publicUrl ?? null,
        greeting_url: greetingUpload?.publicUrl ?? null,
        school_logo_url: schoolLogoUpload?.publicUrl ?? null,
        motto_url: mottoUpload?.publicUrl ?? null,
        school_flower_url: flowerUpload?.publicUrl ?? null,
        school_tree_url: treeUpload?.publicUrl ?? null,
        anthem_sheet_url: anthemSheetUpload?.publicUrl ?? null,
        anthem_audio_url: anthemAudioUpload?.publicUrl ?? null,
      });
    }
    const { error: upsertError } = await supabaseAdmin
      .from('school_details')
      .upsert(upsertRow, { onConflict: 'id' });
    if (upsertError) throw upsertError;

    // 새 업로드가 있는 항목들에 대해 기존 파일 삭제
    const keysToDelete: string[] = [];
    if (existingRow) {
      if (principalImage && existingRow.principal_image_url) {
        const k = extractStorageKey(existingRow.principal_image_url);
        if (k) keysToDelete.push(k);
      }
      if (greetingImage && existingRow.greeting_url) {
        const k = extractStorageKey(existingRow.greeting_url);
        if (k) keysToDelete.push(k);
      }
      if (schoolLogoImage && existingRow.school_logo_url) {
        const k = extractStorageKey(existingRow.school_logo_url);
        if (k) keysToDelete.push(k);
      }
      if (mottoImage && existingRow.motto_url) {
        const k = extractStorageKey(existingRow.motto_url);
        if (k) keysToDelete.push(k);
      }
      if (flowerImage && existingRow.school_flower_url) {
        const k = extractStorageKey(existingRow.school_flower_url);
        if (k) keysToDelete.push(k);
      }
      if (treeImage && existingRow.school_tree_url) {
        const k = extractStorageKey(existingRow.school_tree_url);
        if (k) keysToDelete.push(k);
      }
      if (anthemSheetImage && existingRow.anthem_sheet_url) {
        const k = extractStorageKey(existingRow.anthem_sheet_url);
        if (k) keysToDelete.push(k);
      }
      if (anthemAudio && existingRow.anthem_audio_url) {
        const k = extractStorageKey(existingRow.anthem_audio_url);
        if (k) keysToDelete.push(k);
      }
    }

    if (keysToDelete.length > 0) {
      await supabaseAdmin.storage.from(BUCKET).remove(keysToDelete);
    }

    return NextResponse.json({
      message: '저장되었습니다',
      urls: {
        greetingUrl: greetingUpload?.publicUrl ?? null,
        schoolLogoUrl: schoolLogoUpload?.publicUrl ?? null,
        principalImageUrl: principalImageUpload?.publicUrl ?? null,
        mottoUrl: mottoUpload?.publicUrl ?? null,
        flowerUrl: flowerUpload?.publicUrl ?? null,
        treeUrl: treeUpload?.publicUrl ?? null,
        anthemSheetUrl: anthemSheetUpload?.publicUrl ?? null,
        anthemAudioUrl: anthemAudioUpload?.publicUrl ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? '서버 오류' }, { status: 500 });
  }
}


