import { NextResponse } from 'next/server';
import { getHistory, saveSession, getProfile, saveProfile } from '@/lib/store';
import { analyzeSession } from '@/lib/ai';

export async function GET() {
  const history = getHistory();
  return NextResponse.json(history);
}

export async function POST(request: Request) {
  try {
    const session = await request.json();
    
    // 1. Save Session
    saveSession(session);
    
    // 2. Auto-Learn (Background)
    // In a real app, we'd use a queue. Here we await it to ensure it finishes for the demo.
    const history = getHistory();
    const profile = getProfile();
    
    const analysis = await analyzeSession(session, history, profile);
    
    if (analysis.new_takeaways.length > 0 || analysis.updated_context.length > 0) {
        const newProfile = { ...profile };
        
        // Append unique takeaways
        if (analysis.new_takeaways.length > 0) {
            newProfile.takeaways = [...(newProfile.takeaways || []), ...analysis.new_takeaways];
        }
        
        // Merge physical context
        if (analysis.updated_context.length > 0) {
            // Simple append for now, could be smarter merge
            newProfile.physical_context = [...(newProfile.physical_context || []), ...analysis.updated_context];
        }
        
        saveProfile(newProfile);
    }

    return NextResponse.json({ success: true, analysis });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
