'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MusicLoader } from '@/components/MusicLoader';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/signin');
      }
    });
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <MusicLoader />
    </div>
  );
}
