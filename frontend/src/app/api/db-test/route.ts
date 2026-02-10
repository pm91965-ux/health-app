import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await pool.query("select now() as now, current_database() as db");
    return Response.json({
      ok: true,
      now: result.rows[0]?.now ?? null,
      db: result.rows[0]?.db ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

