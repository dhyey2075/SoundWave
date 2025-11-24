'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

// Type definitions for Speech Recognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new (): SpeechRecognition;
  };
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not available.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      setIsListening(false);
    } else {
      try {
        // Create a new recognition instance each time
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.resultIndex][0].transcript;
          setQuery(transcript);
          setIsListening(false);
          onSearch(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Show user-friendly error messages
          if (event.error === 'no-speech') {
            // User didn't speak, just stop listening silently
          } else if (event.error === 'audio-capture') {
            alert('No microphone found. Please ensure your microphone is connected and permissions are granted.');
          } else if (event.error === 'not-allowed') {
            alert('Microphone permission denied. Please enable microphone access in your browser settings.');
          } else if (event.error === 'network') {
            alert('Network error. Please check your internet connection.');
          } else {
            console.error('Speech recognition error:', event.error, event.message);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        if (error.message) {
          alert(`Error: ${error.message}`);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70 z-10" />
        <Input
          type="search"
          placeholder="Search for songs, artists, or albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass-strong pl-12 pr-20 h-14 text-lg rounded-2xl border-0 focus-visible:ring-2 focus-visible:ring-primary/50 bg-white/5 text-foreground placeholder:text-muted-foreground/50"
        />
        {isSupported && (
          <Button
            type="button"
            onClick={toggleListening}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full
              glass hover:bg-white/10 transition-all duration-300
              ${isListening 
                ? 'bg-red-500/20 hover:bg-red-500/30 animate-pulse' 
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
            aria-label={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? (
              <MicOff className="h-5 w-5 text-red-400" />
            ) : (
              <Mic className="h-5 w-5 text-primary/70" />
            )}
          </Button>
        )}
      </div>
      {isListening && (
        <div className="mt-2 text-center">
          <p className="text-sm text-primary animate-pulse flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Listening...
          </p>
        </div>
      )}
    </form>
  );
}