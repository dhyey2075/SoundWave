import { NextRequest, NextResponse } from 'next/server';

// Shared progress store (in production, use Redis or database)
declare global {
  var spotifyImportProgress: Map<string, {
    current: number;
    total: number;
    imported: number;
    failed: number;
    skipped: number;
    currentTrack: string;
    errors: string[];
  }>;
}

if (!global.spotifyImportProgress) {
  global.spotifyImportProgress = new Map();
}

const progressStore = global.spotifyImportProgress;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  const progress = progressStore.get(sessionId);
  
  if (!progress) {
    return NextResponse.json(
      { error: 'Progress not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(progress);
}

