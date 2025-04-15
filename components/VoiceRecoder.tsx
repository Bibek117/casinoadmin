"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, CirclePause, CirclePlay, CircleStop } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({
  onRecordingComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const sendRecording = () => {
    if (audioUrl) {
      fetch(audioUrl)
        .then((res) => res.blob())
        .then((blob) => {
          onRecordingComplete(blob);
          setAudioUrl(null);
        });
    }
  };

  const cancelRecording = () => {
    setAudioUrl(null);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={startRecording}
          className="rounded-full"
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={stopRecording}
          className="rounded-full"
        >
          <CircleStop className="h-4 w-4" />
        </Button>
      )}

      {audioUrl && (
        <div className="flex items-center gap-2">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            hidden
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={togglePlayback}
            className="rounded-full"
          >
            {isPlaying ? (
              <CirclePause className="h-4 w-4" />
            ) : (
              <CirclePlay className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={sendRecording}
          >
            Send
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelRecording}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
