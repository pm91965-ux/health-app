import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/store';

export async function GET() {
  const profile = getProfile();
  return NextResponse.json(profile);
}
