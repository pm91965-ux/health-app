import { NextResponse } from 'next/server';
import { getFavorites, saveFavorite, deleteFavorite } from '@/lib/favorites_store';

export async function GET() {
  return NextResponse.json(getFavorites());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fav = {
      id: Date.now().toString(),
      ...body
    };
    saveFavorite(fav);
    return NextResponse.json(fav);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    deleteFavorite(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
