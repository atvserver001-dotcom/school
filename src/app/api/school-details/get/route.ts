import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import type { Database } from '@/types/database.types';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';
const BUCKET = 'school-assets';
const ENABLE_SIGNING_FOR_PUBLIC = false;

function extractStorageKey(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // expected: /storage/v1/object/public/{bucket}/{key...}
    const idx = u.pathname.indexOf(`/storage/v1/object/public/${BUCKET}/`);
    if (idx === -1) return null;
    const key = u.pathname.slice(idx + `/storage/v1/object/public/${BUCKET}/`.length);
    return decodeURIComponent(key);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('school_details')
      .select(
        [
          'id',
          'principal_name',
          'principal_image_url',
          'greeting_url',
          'school_logo_url',
          'motto_url',
          'school_flower_url',
          'school_tree_url',
          'anthem_sheet_url',
          'anthem_audio_url',
          'founding_date',
        ].join(', ')
      )
      .eq('id', SINGLETON_ID)
      .maybeSingle();

    if (error) throw error;

    type SchoolDetailsRow = Database['public']['Tables']['school_details']['Row'];
    const row = (data as unknown) as SchoolDetailsRow | null;
    if (!row) return NextResponse.json({ row: null });

    const keys = {
      principal_image_url: extractStorageKey(row.principal_image_url ?? null),
      greeting_url: extractStorageKey(row.greeting_url ?? null),
      school_logo_url: extractStorageKey(row.school_logo_url ?? null),
      motto_url: extractStorageKey(row.motto_url ?? null),
      school_flower_url: extractStorageKey(row.school_flower_url ?? null),
      school_tree_url: extractStorageKey(row.school_tree_url ?? null),
      anthem_sheet_url: extractStorageKey(row.anthem_sheet_url ?? null),
      anthem_audio_url: extractStorageKey(row.anthem_audio_url ?? null),
    } as const;

    const signOne = async (key: string | null) => {
      if (!key) return null;
      const { data: signed, error: err } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(key, 60 * 60);
      if (err) return null;
      return signed?.signedUrl ?? null;
    };

    let signed:
      | {
          principal_image_url: string | null;
          greeting_url: string | null;
          school_logo_url: string | null;
          motto_url: string | null;
          school_flower_url: string | null;
          school_tree_url: string | null;
          anthem_sheet_url: string | null;
          anthem_audio_url: string | null;
        }
      | undefined;

    if (ENABLE_SIGNING_FOR_PUBLIC) {
      const [
        principal_image_signed,
        greeting_signed,
        school_logo_signed,
        motto_signed,
        flower_signed,
        tree_signed,
        anthem_sheet_signed,
        anthem_audio_signed,
      ] = await Promise.all([
        signOne(keys.principal_image_url),
        signOne(keys.greeting_url),
        signOne(keys.school_logo_url),
        signOne(keys.motto_url),
        signOne(keys.school_flower_url),
        signOne(keys.school_tree_url),
        signOne(keys.anthem_sheet_url),
        signOne(keys.anthem_audio_url),
      ]);
      signed = {
        principal_image_url: principal_image_signed,
        greeting_url: greeting_signed,
        school_logo_url: school_logo_signed,
        motto_url: motto_signed,
        school_flower_url: flower_signed,
        school_tree_url: tree_signed,
        anthem_sheet_url: anthem_sheet_signed,
        anthem_audio_url: anthem_audio_signed,
      };
    }

    return NextResponse.json(
      {
        row,
        signed,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ row: null, message: e?.message ?? '서버 오류' }, { status: 500 });
  }
}


