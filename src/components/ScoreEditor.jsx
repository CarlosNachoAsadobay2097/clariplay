import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import * as Tone from "tone";
import { parseMusicXMLToNotes } from "../utils/parseMusicXMLToNotes";

export default function ScoreEditor({ xmlContent }) {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const samplerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);

  // Cargar sampler (una vez)
  useEffect(() => {
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
          E6: "E6.mp3"
        },
        baseUrl: "/audio/samples/piano/",
        release: 1,
        onload: () => console.log("🎹 Sampler cargado"),
      }).toDestination();
    }
  }, []);

  // Renderizar partitura cuando xmlContent cambia
  useEffect(() => {
    if (!xmlContent || !containerRef.current) {
      return;
    }
    setLoading(true);
    setError(null);

    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
        drawingParameters: "compacttight",
        autoResize: true,
        drawTitle: true,
      });
    }

    osmdRef.current.load(xmlContent)
      .then(() => osmdRef.current.render())
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Error cargando la partitura:", err);
        setError("Error al cargar la partitura");
        setLoading(false);
      });
  }, [xmlContent]);

  // Función para reproducir partitura
  const handlePlayScore = async () => {
    if (!samplerRef.current || !osmdRef.current) {
      alert("Sampler o partitura no cargados aún");
      return;
    }
    if (!xmlContent) {
      alert("No hay partitura para reproducir");
      return;
    }

    setPlaying(true);

    try {
      const { notes, tempo } = parseMusicXMLToNotes(xmlContent);
      if (!notes || notes.length === 0) {
        alert("No se encontraron notas para reproducir");
        setPlaying(false);
        return;
      }

      await Tone.start();
      await Tone.loaded();

      const bpm = tempo || 120;
      const delayBeforeStart = 0.2;

      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      Tone.Transport.bpm.value = bpm;

      osmdRef.current.cursor.reset();
      osmdRef.current.cursor.hide();

      let cursorMoved = false;

      const part = new Tone.Part((time, noteObj) => {
        if (!noteObj.note || !noteObj.duration) return;

        const note = noteObj.note.replaceAll("#", "s");
        const durSeconds = noteObj.duration * (60 / bpm);

        samplerRef.current.triggerAttackRelease(note, durSeconds, time);

        Tone.Draw.schedule(() => {
          try {
            if (!cursorMoved) {
              osmdRef.current.cursor.show();
              cursorMoved = true;
            } else if (!osmdRef.current.cursor.iterator.EndReached) {
              osmdRef.current.cursor.next();
            }
          } catch (e) {
            console.warn("Error moviendo cursor:", e);
          }
        }, time);
      }, notes.map(n => ({ ...n, time: n.time + delayBeforeStart })));

      part.start(0);
      Tone.Transport.start("+0.1");

      const totalDuration = notes[notes.length - 1].time + notes[notes.length - 1].duration + delayBeforeStart;

      setTimeout(() => {
        Tone.Transport.stop();
        part.dispose();
        osmdRef.current.cursor.reset();
        osmdRef.current.cursor.hide();
        setPlaying(false);
      }, (totalDuration + 0.5) * 1000);
    } catch (err) {
      console.error("Error reproduciendo la partitura:", err);
      setPlaying(false);
    }
  };

  return (
    <div style={{ padding: 20, backgroundColor: "white", borderRadius: 8 }}>
      <h3>🎼 Vista previa de la partitura</h3>
      {loading && <p>Cargando partitura...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div ref={containerRef} style={{ border: "1px solid #ccc", minHeight: 300, marginTop: 10 }} />

      <button
        onClick={handlePlayScore}
        disabled={playing || loading || !xmlContent}
        style={{
          marginTop: 15,
          padding: "0.5rem 1rem",
          backgroundColor: "#E51B23",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        {playing ? "Reproduciendo..." : "▶ Reproducir partitura"}
      </button>
    </div>
  );
}
