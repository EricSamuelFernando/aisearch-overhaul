'use client';

import { useState, useRef, useEffect } from 'react';

interface SpeechToTextHook {
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

interface SpeechRecognition extends EventTarget {
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const useSpeechToText = (): SpeechToTextHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current!.lang = 'en-US';
      recognition.current!.continuous = true;
      recognition.current!.interimResults = true;

      recognition.current!.onresult = (event: SpeechRecognitionEvent) => {
        const interimTranscript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setTranscript(interimTranscript);
      };

      recognition.current!.onend = () => {
        if (listening) {
          recognition.current?.start();
        }
      };
    }
  }, [listening]);

  const startListening = () => {
    if (recognition.current && !listening) {
      recognition.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition.current && listening) {
      recognition.current.stop();
      setListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechToText;
