'use client';

import { useState, useEffect } from 'react';
import { 
  Music2, 
  Download, 
  Sparkles, 
  Import, 
  Shield,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundDots } from '@/components/BackgroundDots';
import { CursorFollower } from '@/components/CursorFollower';
import { MusicLoader } from '@/components/MusicLoader';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsChecking(false);
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router, supabase]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error signing in:', error);
        alert('Failed to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundDots />
        <CursorFollower />
        <div className="relative z-10">
          <MusicLoader />
        </div>
      </main>
    );
  }

  const features = [
    {
      icon: Zap,
      title: '2X High Quality Premium Music',
      description: 'Experience crystal-clear audio with premium quality streaming',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Download,
      title: 'Free Unlimited Downloads',
      description: 'Download your favorite tracks without any limits or restrictions',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Sparkles,
      title: 'Advanced Features',
      description: 'Access cutting-edge music features and personalized recommendations',
      color: 'from-pink-400 to-purple-500',
    },
    {
      icon: Import,
      title: 'Import Playlist from Popular Platforms',
      description: 'Seamlessly transfer your playlists from Spotify, YouTube, and more',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Absolutely Ad-Free Music',
      description: 'Enjoy uninterrupted music experience without any advertisements',
      color: 'from-indigo-400 to-violet-500',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundDots />
      <CursorFollower />

      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          <div className="w-full max-w-6xl mx-auto">
            {/* Logo and Title */}
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <div className="glass-strong rounded-3xl p-6 shadow-2xl">
                  <Music2 className="h-16 w-16 text-primary glow-text" />
                </div>
              </div>
              <h1 
                className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-pink-400 via-yellow-400 via-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'gradient 3s ease infinite',
                }}
              >
                SoundWave
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Your ultimate destination for premium music streaming, downloads, and discovery
              </p>
              
              {/* Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="h-14 px-8 text-lg font-semibold glass-strong hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="animate-spin">⟳</span>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Get Started with Google
                  </span>
                )}
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group glass-strong rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-16 text-center">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

