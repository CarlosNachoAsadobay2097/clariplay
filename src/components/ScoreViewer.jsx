import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import * as Tone from "tone";
import { parseMusicXMLToNotes } from "../utils/parseMusicXMLToNotes";

const ScoreViewer = ({ xmlUrl, userId, courseId, lessonId, onAudioUploaded }) => {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const samplerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        const response = await fetch(xmlUrl);
        const xmlData = await response.text();

        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          backend: "svg",
          drawTitle: true,
          drawPartNames: true,
        });

        osmdRef.current = osmd;
        await osmd.load(xmlData);
        osmd.render();

        if (!samplerRef.current) {
          samplerRef.current = new Tone.Sampler({
            urls: {
              A3: "A3.mp3",
              "A#3": "As3.mp3",
              B3: "B3.mp3",
              C4: "C4.mp3",
              "C#4": "Cs4.mp3",
              D4: "D4.mp3",
              "D#4": "Ds4.mp3",
              E4: "E4.mp3",
              F4: "F4.mp3",
              "F#4": "Fs4.mp3",
              G4: "G4.mp3",
              "G#4": "Gs4.mp3",
              A4: "A4.mp3",
              "A#4": "As4.mp3",
              B4: "B4.mp3",
              C5: "C5.mp3",
              "C#5": "Cs5.mp3",
              D5: "D5.mp3",
              "D#5": "Ds5.mp3",
              E5: "E5.mp3",
              F5: "F5.mp3",
              "F#5": "Fs5.mp3",
              G5: "G5.mp3",
              "G#5": "Gs5.mp3",
              A5: "A5.mp3",
              "A#5": "As5.mp3",
              B5: "B5.mp3",
              C6: "C6.mp3",
              "C#6": "Cs6.mp3",
              D6: "D6.mp3",
              "D#6": "Ds6.mp3",
              E6: "E6.mp3",
            },
            baseUrl: "/audio/samples/piano/",
            release: 1,
            onload: () => console.log("✅ Samples cargados"),
          }).toDestination();
          await Tone.loaded();
        }

      } catch (error) {
        console.error("Error al cargar o renderizar la partitura:", error);
      }
    };

    fetchAndRender();
  }, [xmlUrl]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        if (onAudioUploaded) onAudioUploaded(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handlePlayScore = async () => {
    if (!samplerRef.current) {
      alert("Sampler no está listo aún");
      return;
    }

    setPlaying(true);

    try {
      const response = await fetch(xmlUrl);
      const xmlString = await response.text();

      const { notes, tempo } = parseMusicXMLToNotes(xmlString);

      await Tone.start();
      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      Tone.Transport.bpm.value = tempo || 120;

      const part = new Tone.Part((time, value) => {
        const noteName = value.note.replaceAll("#", "s");
        samplerRef.current.triggerAttackRelease(noteName, value.duration, time);
      }, notes.map(({ time, note, duration }) => ({
        time,
        note,
        duration,
      })));

      part.start(0);
      Tone.Transport.start();

      const totalDuration = notes.length > 0
        ? notes[notes.length - 1].time + notes[notes.length - 1].duration
        : 0;

      setTimeout(() => {
        Tone.Transport.stop();
        setPlaying(false);
        part.dispose();
      }, (totalDuration + 0.5) * 1000);

    } catch (error) {
      console.error("Error reproduciendo la partitura:", error);
      setPlaying(false);
    }
  };

  return (
    <div>
      <div ref={containerRef} style={{ width: "100%", overflowX: "auto" }} />

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handlePlayScore} disabled={playing}>
          {playing ? "🔁 Reproduciendo..." : "▶ Reproducir partitura"}
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {recording ? (
          <button onClick={handleStopRecording}>⏹ Detener grabación</button>
        ) : (
          <button onClick={handleStartRecording}>🎙 Iniciar grabación</button>
        )}
      </div>

      {audioBlob && (
        <div style={{ marginTop: "1rem" }}>
          <p>✅ Grabación completa:</p>
          <audio controls src={URL.createObjectURL(audioBlob)} />
        </div>
      )}
    </div>
  );
};

export default ScoreViewer;
