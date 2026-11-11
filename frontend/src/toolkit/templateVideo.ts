import {recordingMime} from './media';

/** Silent, editable video base. Captions remain separate in the editor. */
export async function createTemplateVideo(background: string, imageUrl: string, duration: number, signal: AbortSignal): Promise<File> {
  const mimeType = recordingMime();
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx || !canvas.captureStream) throw new Error('Tu navegador no permite preparar esta plantilla. Puedes usar una grabación.');
  let image: HTMLImageElement | undefined;
  if (imageUrl) {
    image = new Image(); image.crossOrigin = 'anonymous'; image.src = imageUrl;
    await image.decode();
  }
  signal.throwIfAborted();
  const draw = (progress: number) => {
    ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (image) {
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * (1 + progress * .06);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  draw(0);
  const stream = canvas.captureStream(30);
  try {
    return await new Promise<File>((resolve, reject) => {
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, {...(mimeType ? {mimeType} : {}), videoBitsPerSecond: 4_000_000});
      let timer: ReturnType<typeof setInterval> | undefined;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      let failed = false;
      const cleanup = () => { clearInterval(timer); clearTimeout(timeout); signal.removeEventListener('abort', cancel); };
      const fail = (error: unknown) => { failed = true; cleanup(); if (recorder.state !== 'inactive') recorder.stop(); reject(error); };
      const cancel = () => fail(new DOMException('Cancelado', 'AbortError'));
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onerror = () => fail(new Error('No pudimos preparar la plantilla. Puedes reintentar o elegir una grabación.'));
      recorder.onstop = () => {
        cleanup(); if (failed) return;
        const blob = new Blob(chunks, {type: recorder.mimeType});
        if (!blob.size) { reject(new Error('La plantilla no produjo un video. Reintenta.')); return; }
        resolve(new File([blob], 'mi-plantilla.' + (blob.type.includes('mp4') ? 'mp4' : 'webm'), {type: blob.type}));
      };
      signal.addEventListener('abort', cancel, {once: true});
      if (signal.aborted) { cancel(); return; }
      try {
        recorder.start(250);
        const start = performance.now();
        timer = setInterval(() => {
          try {
            const elapsed = (performance.now() - start) / 1000;
            draw(Math.min(1, elapsed / duration));
            if (elapsed >= duration && recorder.state === 'recording') recorder.stop();
          } catch (error) { fail(error); }
        }, 1000 / 30);
        timeout = setTimeout(() => fail(new Error('La preparación tardó demasiado. Mantén esta pestaña abierta y reintenta.')), (duration + 20) * 1000);
      } catch (error) { fail(error); }
    });
  } finally { stream.getTracks().forEach(track => track.stop()); }
}
