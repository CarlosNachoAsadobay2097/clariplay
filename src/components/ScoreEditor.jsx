import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import * as Tone from "tone";

export default function ScoreEditor({ xmlContent, onDataChange }) {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [noteEvents, setNoteEvents] = useState([]);

  // Variables para WebAudioFont
  const audioContextRef = useRef(null);
  const playerRef = useRef(null);

  // Inicializar AudioContext y WebAudioFont Player una sola vez
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!playerRef.current && window.WebAudioFontPlayer) {
      playerRef.current = new window.WebAudioFontPlayer();
      playerRef.current.loader.decodeAfterLoading(audioContextRef.current);
    }
  }, []);

  // Cada vez que xmlContent cambia, cargar y renderizar la partitura
  useEffect(() => {
    if (!xmlContent || !containerRef.current) return;

    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current);
    }

    osmdRef.current.load(xmlContent).then(() => {
      osmdRef.current.render();
      extractNotes();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlContent]);

  // Extraer notas para reproducir
  const extractNotes = () => {
    if (!osmdRef.current) return;

    const notes = [];
    const measures = osmdRef.current.sheet?.measures || [];
    for (const measure of measures) {
      for (const voice of measure.voices) {
        for (const tickables of voice.tickables) {
          if (!tickables.isRest) {
            notes.push({
              midi: tickables.halfTone + 12, // nota MIDI aproximada
              duration: 0.5, // duración fija (media negra)
            });
          }
        }
      }
    }
    setNoteEvents(notes);
    // Avisar a padre del cambio en las notas si se quiere
    if (onDataChange) {
      onDataChange({ notes: notes, audioUrl: null });
    }
  };

  // Reproducir notas con WebAudioFont Player
  const play = async () => {
    if (!playerRef.current || !audioContextRef.current) return;
    await Tone.start();
    const ctx = audioContextRef.current;

    let time = ctx.currentTime;

    for (const note of noteEvents) {
      playerRef.current.queueWaveTable(
        ctx,
        ctx.destination,
        window._tone_0000_AcousticGrandPiano_sf2_file,
        time,
        note.midi,
        note.duration
      );
      time += note.duration;
    }
  };

  return (
    <div style={{ background: "#FFF1E6", padding: "1rem", borderRadius: "8px" }}>
      <h2>Editor de Partitura (Lectura + Reproducción con WebAudioFont)</h2>

      {/* Contenedor para renderizado */}
      <div
        ref={containerRef}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "6px",
          overflowX: "auto",
          backgroundColor: "white",
          minHeight: "300px",
        }}
      />

      <button
        onClick={play}
        disabled={noteEvents.length === 0}
        style={{
          marginTop: "1rem",
          backgroundColor: "#E51B23",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ▶ Reproducir
      </button>
    </div>
  );
}
