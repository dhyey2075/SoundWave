import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/spotify/callback`;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const codeVerifier = request.cookies.get('spotify_code_verifier')?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?spotify_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !codeVerifier) {
    return NextResponse.redirect(
      new URL('/dashboard?spotify_error=missing_code', request.url)
    );
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL('/dashboard?spotify_error=config_error', request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/dashboard?spotify_error=not_authenticated', request.url)
      );
    }

    // Store tokens in database (create a spotify_tokens table or use user metadata)
    // For now, we'll store in a cookie (less secure, but simpler)
    // In production, store in database with encryption
    const response = NextResponse.redirect(
      new URL('/dashboard?spotify_connected=true', request.url)
    );

    // Store access token in httpOnly cookie
    response.cookies.set('spotify_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in, // Spotify tokens expire in 3600 seconds (1 hour)
      path: '/',
    });

    if (refresh_token) {
      response.cookies.set('spotify_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }

    // Clear code verifier
    response.cookies.delete('spotify_code_verifier');

    return response;
  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?spotify_error=callback_failed', request.url)
    );
  }
}

