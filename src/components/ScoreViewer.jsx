import { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
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

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  // Verifica si ya hay una grabación enviada
  useEffect(() => {
    const checkExistingRecording = async () => {
      if (!userId || !lessonId) return;
      try {
        const q = query(
          collection(db, "audioRecordings"),
          where("studentId", "==", userId),
          where("lessonId", "==", lessonId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setSent(true);
        }
      } catch (err) {
        console.error("Error verificando grabación existente:", err);
      }
    };
    checkExistingRecording();
  }, [userId, lessonId]);

  // Renderiza la partitura
  useEffect(() => {
    if (!xmlUrl) return;
    setLoading(true);
    setError(null);

    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
        drawingParameters: "compacttight",
        autoResize: true,
        drawTitle: true,
      });
    } else {
      osmdRef.current.clear();
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    fetch(xmlUrl)
      .then((res) => res.text())
      .then((xml) => osmdRef.current.load(xml))
      .then(() => osmdRef.current.render())
      .then(() => setLoading(false))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar la partitura");
        setLoading(false);
      });
  }, [xmlUrl]);

  // Dibuja la onda de audio mientras graba
  useEffect(() => {
    if (!recording || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = analyser.frequencyBinCount;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#FFF1E6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#E51B23";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
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

  // Inicia grabación
  const startRecording = async () => {
    setError(null);
    setAudioUrl(null);
    audioBlobRef.current = null;
    setRecording(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        cancelAnimationFrame(animationIdRef.current);
        audioContextRef.current?.close();
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        audioBlobRef.current = audioBlob;
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

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

  // Envía la grabación al servidor
  const handleUploadClick = async () => {
    if (!audioBlobRef.current) return;

    const confirmar = window.confirm(
      "Esta es tu única oportunidad para enviar la lección. ¿Estás seguro de enviarla?"
    );
    if (!confirmar) return;

    try {
      await onAudioUploaded(audioBlobRef.current);
      setSent(true);
      setAudioUrl(null);
      audioBlobRef.current = null;
      setRecording(false);
    } catch (err) {
      console.error("❌ Error al subir la lección:", err);
      alert("Error al subir la lección: " + (err?.message || "Error desconocido"));
    }
  };

  return (
    <div className="score-viewer-container">
      <h3>🎵 Vista previa de la partitura</h3>
      {loading && <p>Cargando...</p>}
      {error && <p className="score-viewer-error">{error}</p>}

      <div ref={containerRef} className="score-viewer-osmd" />

      <div style={{ marginTop: "1rem" }}>
        {!sent && !recording && (
          <button onClick={startRecording}>🎙 Iniciar grabación</button>
        )}
        {!sent && recording && (
          <button onClick={stopRecording}>⏹ Detener</button>
        )}
        {sent && (
          <p style={{ color: "green", fontWeight: "bold" }}>
            ✅ Tu lección ya fue enviada.
          </p>
        )}
      </div>

      {recording && (
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="score-viewer-waveform"
        />
      )}

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
