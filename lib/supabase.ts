import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

/*
 * ── SQL SCHEMA (already created in Supabase) ─────────────────────────────────
 *
 * create table applications (
 *   id               uuid primary key default gen_random_uuid(),
 *   email            text not null,
 *   platform         text not null,
 *   profile_link     text,
 *   creator_type     text[] not null default '{}',
 *   content_niche    text,
 *   average_views    text,
 *   best_video_range text,
 *   score            integer not null default 0,
 *   category         text not null,
 *   tags             text[] not null default '{}',
 *   created_at       timestamptz not null default now()
 * );
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
