import { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as Tone from "tone";
import { db } from "../firebase";
import { parseMusicXMLToNotes } from "../utils/parseMusicXMLToNotes";
import "../css/main.css";

export default function ScoreViewer({ xmlUrl, onAudioUploaded, lessonId, courseId, userId }) {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioBlobRef = useRef(null);
  const samplerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [playing, setPlaying] = useState(false);

  // ✅ Verificar si ya se envió una lección
  useEffect(() => {
    if (!userId || !lessonId) return;
    const checkExisting = async () => {
      try {
        const q = query(
          collection(db, "audioRecordings"),
          where("studentId", "==", userId),
          where("lessonId", "==", lessonId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setSent(true);
      } catch (err) {
        console.error("Error verificando grabación:", err);
      }
    };
    checkExisting();
  }, [userId, lessonId]);

  // ✅ Cargar y renderizar partitura
  useEffect(() => {
    if (!xmlUrl) return;
    setLoading(true);
    setError(null);

    const osmd = osmdRef.current ?? new OpenSheetMusicDisplay(containerRef.current, {
      drawingParameters: "compacttight",
      autoResize: true,
      drawTitle: true,
    });

    osmdRef.current = osmd;

    fetch(xmlUrl)
      .then(res => res.text())
      .then(xml => osmd.load(xml))
      .then(() => osmd.render())
      .then(() => setLoading(false))
      .catch(err => {
        console.error("❌ Error cargando partitura:", err);
        setError("Error al cargar la partitura");
        setLoading(false);
      });

    // ✅ Cargar sampler
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
  }, [xmlUrl]);

  // ✅ Gráfico de onda
  useEffect(() => {
    if (!recording || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "#FFF1E6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#E51B23";
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [recording]);

  const startRecording = async () => {
    setError(null);
    setAudioUrl(null);
    audioBlobRef.current = null;
    setRecording(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        cancelAnimationFrame(animationIdRef.current);
        audioContextRef.current?.close();
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        audioBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
      };

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("No se pudo grabar:", err);
      setError("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleUploadClick = async () => {
    if (!audioBlobRef.current) return;
    const confirmar = window.confirm("¿Seguro que deseas enviar esta grabación?");
    if (!confirmar) return;

    try {
      await onAudioUploaded(audioBlobRef.current);
      setSent(true);
      setAudioUrl(null);
      audioBlobRef.current = null;
    } catch (err) {
      console.error("❌ Error al subir:", err);
      alert("Error al subir: " + err.message);
    }
  };

  // ✅ Reproduce la partitura con Tone.js
  const handlePlayScore = async () => {
    if (!samplerRef.current) return alert("Sampler no cargado aún");
    setPlaying(true);

    try {
      const xmlString = await (await fetch(xmlUrl)).text();
      const { notes, tempo } = parseMusicXMLToNotes(xmlString);

      await Tone.start();
      Tone.Transport.cancel();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      Tone.Transport.bpm.value = tempo || 120;

      const part = new Tone.Part((time, noteObj) => {
        const note = noteObj.note.replaceAll("#", "s");
        samplerRef.current.triggerAttackRelease(note, noteObj.duration, time);
      }, notes);

      part.start(0);
      Tone.Transport.start();

      const totalDuration = notes.length > 0
        ? notes[notes.length - 1].time + notes[notes.length - 1].duration
        : 0;

      setTimeout(() => {
        Tone.Transport.stop();
        setPlaying(false);
        part.dispose();
        console.log("✅ Fin de reproducción");
      }, (totalDuration + 0.5) * 1000);

    } catch (err) {
      console.error("❌ Error reproduciendo partitura:", err);
      setPlaying(false);
    }
  };

  return (
    <div className="score-viewer-container">
      <h3>🎼 Vista previa de la partitura</h3>
      {loading && <p>Cargando...</p>}
      {error && <p className="score-viewer-error">{error}</p>}
      <div ref={containerRef} className="score-viewer-osmd" />

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <button onClick={handlePlayScore} disabled={playing}>
          {playing ? "🔁 Reproduciendo..." : "▶ Reproducir partitura"}
        </button>
      </div>

      {!sent && !recording && (
        <button onClick={startRecording}>🎙 Iniciar grabación</button>
      )}
      {!sent && recording && (
        <button onClick={stopRecording}>⏹ Detener</button>
      )}
      {recording && <canvas ref={canvasRef} width={400} height={100} className="score-viewer-waveform" />}
      {sent && <p style={{ color: "green", fontWeight: "bold" }}>✅ Lección enviada</p>}
      {audioUrl && !sent && (
        <>
          <p>🎧 Escucha tu grabación:</p>
          <audio controls src={audioUrl} />
          <button onClick={handleUploadClick} style={{ marginTop: "0.5rem" }}>
            📤 Enviar lección
          </button>
        </>
      )}
    </div>
  );
}
