export async function playMusicXML(xmlString) {
  if (!isSamplerLoaded) {
    console.warn("⏳ Esperando que los samples se carguen...");
    await Tone.loaded();
  }

  const { notes, tempo } = parseMusicXMLToNotes(xmlString);

  if (!notes || notes.length === 0) {
    console.warn("⚠️ No se encontraron notas.");
    return;
  }

  console.log("🎼 Notas parseadas desde MusicXML:");
  notes.forEach(({ time, note, duration }, index) => {
    if (typeof time !== "number" || !duration) {
      console.warn(`⚠️ Nota ${index + 1} con datos inválidos`, { note, time, duration });
    } else {
      console.log(`🔔 Nota ${index + 1}: ${note}, duración: ${duration}, tiempo: ${time}`);
    }
  });

  await Tone.start();

  Tone.Transport.cancel();
  Tone.Transport.position = 0;
  Tone.Transport.bpm.value = tempo || 120;

  function normalizeNoteName(note) {
    const flatToSharp = {
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#",
      "Bb": "A#",
    };

    const notePart = note.slice(0, -1);
    const octave = note.slice(-1);

    let normalized = flatToSharp[notePart] || notePart;
    normalized = normalized.replaceAll("#", "s");

    return normalized + octave;
  }

  notes.forEach(({ time, note, duration }) => {
    const playTime = time * (60 / Tone.Transport.bpm.value);
    const durSeconds = duration * (60 / Tone.Transport.bpm.value);

    const cleanNoteName = normalizeNoteName(note);

    sampler.triggerAttackRelease(cleanNoteName, durSeconds, playTime);

    Tone.Transport.schedule((scheduledTime) => {
      sampler.triggerAttackRelease(cleanNoteName, durSeconds, scheduledTime);
    }, playTime);
  });

  const lastNote = notes[notes.length - 1];
  const endTimeInBeats = lastNote.time + lastNote.duration;
  const endTimeInSeconds = endTimeInBeats * (60 / Tone.Transport.bpm.value);

  console.log("Última nota:", lastNote);
  console.log("Tiempo final estimado (s):", endTimeInSeconds);

  Tone.Transport.scheduleOnce(() => {
    Tone.Transport.stop();
    console.log("⏹️ Reproducción terminada");
  }, endTimeInSeconds + 0.5);

  Tone.Transport.start();
}
