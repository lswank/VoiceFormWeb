declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onError?: (error: string) => void;
  debounceMs?: number;
}

interface VoiceInputResult {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useVoiceInput({
  language = 'en-US',
  continuous = true,
  interimResults = true,
  onError,
  debounceMs = 1000,
}: VoiceInputOptions = {}): VoiceInputResult {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Refs for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interimTranscriptRef = useRef('');
  const finalTranscriptRef = useRef('');

  // Clear the debounce timeout
  const clearDebounceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('Window is undefined');
      return;
    }

    // Check browser support
    if (!('webkitSpeechRecognition' in window)) {
      const errorMessage = 'Speech recognition is not supported in this browser.';
      console.log('Speech recognition not supported');
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    console.log('Creating speech recognition instance');
    // Create recognition instance
    const recognitionInstance = new window.webkitSpeechRecognition();

    // Configure recognition
    recognitionInstance.lang = language;
    recognitionInstance.continuous = continuous;
    recognitionInstance.interimResults = interimResults;

    // Set up event handlers
    recognitionInstance.onstart = () => {
      console.log('Recognition started');
      setIsRecording(true);
      setError(null);
      // Reset transcripts when starting new recording
      interimTranscriptRef.current = '';
      finalTranscriptRef.current = '';
      setTranscript('');
    };

    recognitionInstance.onend = () => {
      console.log('Recognition ended');
      setIsRecording(false);
      // Process any remaining interim transcript
      if (interimTranscriptRef.current) {
        finalTranscriptRef.current += interimTranscriptRef.current;
        setTranscript(finalTranscriptRef.current);
        interimTranscriptRef.current = '';
      }
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      console.log('Got recognition result');
      clearDebounceTimeout();

      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      interimTranscriptRef.current = interimTranscript;

      // Show interim results immediately for visual feedback
      setTranscript(finalTranscript + interimTranscript);

      // Debounce the final update
      timeoutRef.current = setTimeout(() => {
        if (interimTranscript) {
          finalTranscriptRef.current += interimTranscript;
          interimTranscriptRef.current = '';
          setTranscript(finalTranscriptRef.current);
        }
      }, debounceMs);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Recognition error:', event.error);
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);
      setIsRecording(false);
    };

    setRecognition(recognitionInstance);

    // Cleanup
    return () => {
      console.log('Cleaning up recognition');
      clearDebounceTimeout();
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [language, continuous, interimResults, onError, debounceMs, clearDebounceTimeout]);

  const startRecording = useCallback(() => {
    console.log('Starting recording, recognition:', !!recognition);
    if (!recognition) return;
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [recognition]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording, recognition:', !!recognition);
    if (!recognition) return;
    try {
      clearDebounceTimeout();
      recognition.stop();
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [recognition, clearDebounceTimeout]);

  const resetTranscript = useCallback(() => {
    clearDebounceTimeout();
    interimTranscriptRef.current = '';
    finalTranscriptRef.current = '';
    setTranscript('');
  }, [clearDebounceTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDebounceTimeout();
    };
  }, [clearDebounceTimeout]);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  };
} 