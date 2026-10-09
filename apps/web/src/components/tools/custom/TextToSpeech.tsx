'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function supported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export default function TextToSpeech(): React.ReactElement {
  const [text, setText] = useState('Hello! Paste any text here and press Speak to hear it read aloud.');
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported()) {
      return;
    }
    const load = (): void => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (voiceURI === '' && list.length > 0) {
        const english = list.find((v) => v.lang.toLowerCase().startsWith('en'));
        setVoiceURI((english ?? list[0] as SpeechSynthesisVoice).voiceURI);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [voiceURI]);

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const seconds = Math.round((words / (150 * rate)) * 60 * 10) / 10;

  function speak(): void {
    if (!supported()) {
      setNotice('Speech is not supported in this browser — try Chrome, Edge or Safari.');
      return;
    }
    if (text.trim() === '') {
      setNotice('Enter some text first.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim().replace(/\s+/g, ' '));
    utterance.rate = rate;
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice !== undefined) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
    setNotice(null);
  }

  function togglePause(): void {
    if (!supported()) {
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop(): void {
    if (!supported()) {
      return;
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listen to text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!supported() ? (
          <p role="note" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            This browser has no speech engine. The estimator below still works — open this page in Chrome, Edge or Safari to hear voices.
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="tts-text">Text to speak</Label>
          <textarea
            id="tts-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tts-rate">Speed: {rate.toFixed(2)}×</Label>
            <input
              id="tts-rate"
              type="range"
              min={0.5}
              max={2}
              step={0.25}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tts-voice">Voice</Label>
            <select
              id="tts-voice"
              value={voiceURI}
              onChange={(event) => setVoiceURI(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Default voice</option>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
          {words} words · about {seconds} seconds at {rate.toFixed(2)}×
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={speak} disabled={speaking && !paused} className={cn(speaking && !paused && 'opacity-60')}>
            <Play className="h-4 w-4" aria-hidden="true" /> Speak
          </Button>
          <Button type="button" variant="outline" onClick={togglePause} disabled={!speaking}>
            <Pause className="h-4 w-4" aria-hidden="true" /> {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button type="button" variant="outline" onClick={stop} disabled={!speaking}>
            <Square className="h-4 w-4" aria-hidden="true" /> Stop
          </Button>
        </div>
        {notice !== null ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{notice}</p>
        ) : null}
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Speech runs locally through your browser&apos;s built-in voices — nothing you type is uploaded.
        </p>
      </CardContent>
    </Card>
  );
}
