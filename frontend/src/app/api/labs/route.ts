import { NextResponse } from 'next/server';
import { getLabs, saveLabResult, deleteLabResult } from '@/lib/labs_store';

export async function GET() {
  const data = getLabs();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = {
      id: Date.now().toString(),
      date: body.date || new Date().toISOString().split('T')[0],
      ...body
    };

    saveLabResult(result);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    deleteLabResult(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
