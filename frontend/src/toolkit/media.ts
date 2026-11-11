import {isolateMp4Audio,readVideoPcm,type AudioReadOptions} from './videoAudio';
import {clipAppearance,paintLayers,type ClipMotion,type VideoLayer} from './videoComposition';
import {paintStyledCaption,captionTypography,captionLines,type TextLook} from './textStyles';
import {recordingFrames,recordingCrop,type RecordingRatio} from './prompterFrame';
import type { Segment } from "./engine";
export function recordingMime() {
  if (typeof MediaRecorder === "undefined")
    throw new Error(
      "Este navegador no permite grabar. Prueba una versión reciente de Chrome, Edge o Safari.",
    );
  return (
    [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/mp4",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
  );
}
export async function compressImage(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Usa una imagen JPG, PNG o WebP.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Cada imagen puede pesar hasta 20 MB.");
  const bitmap = await createImageBitmap(file);
  const factor = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * factor);
  canvas.height = Math.round(bitmap.height * factor);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("No se pudo preparar la imagen.");
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("No se pudo comprimir.")),
      "image/jpeg",
      0.82,
    ),
  );
}
const decodedAudio=new WeakMap<File,AudioBuffer>();
export async function decodeAudio(file:File,options:AudioReadOptions={}) {
  if(options.signal?.aborted)throw new DOMException('Cancelado','AbortError');
  const cached=decodedAudio.get(file);if(cached)return cached;
  const context=new AudioContext();
  // Resume while the explicit button click still carries browser user activation.
  const activation=context.resume().catch(()=>{});
  try {
    if(options.signal?.aborted)throw new DOMException('Cancelado','AbortError');
    let result:AudioBuffer;
    try{result=await context.decodeAudioData(await file.arrayBuffer());}
    catch{
      if(options.signal?.aborted)throw new DOMException('Cancelado','AbortError');
      options.onProgress?.('Preparando la voz de tu video…');
      const carrier=isolateMp4Audio(await file.arrayBuffer());
      try{if(!carrier)throw new Error('No audio-only container');result=await context.decodeAudioData(carrier);}
      catch{await activation;result=await readVideoPcm(file,context,options);}
    }
    if(options.signal?.aborted)throw new DOMException('Cancelado','AbortError');
    decodedAudio.set(file,result);return result;
  } finally {await context.close();}
}
export function waitMedia(
  video: HTMLVideoElement,
  event: string,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => finish(new Error("El video tardó demasiado en responder.")),
      20_000,
    );
    const done = () => finish();
    const failed = () => finish(new Error("No se pudo reproducir el video."));
    const abort = () => finish(new DOMException("Cancelado", "AbortError"));
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      video.removeEventListener(event, done);
      video.removeEventListener("error", failed);
      signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve();
    };
    video.addEventListener(event, done, { once: true });
    video.addEventListener("error", failed, { once: true });
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}
function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
) {
  const size = Math.max(18, Math.round(width / 27));
  ctx.font = `600 ${size}px sans-serif`;
  ctx.textAlign = "center";
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (ctx.measureText(`${line} ${word}`).width > width * 0.88 && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  const visible = lines.slice(0, 4);
  const top = height * 0.87 - visible.length * size * 1.3;
  visible.forEach((value, i) => {
    const y = top + i * size * 1.3;
    const w = ctx.measureText(value).width;
    ctx.fillStyle = "rgba(0,0,0,.78)";
    ctx.fillRect((width - w) / 2 - 10, y - size, w + 20, size * 1.3);
    ctx.fillStyle = "#fff";
    ctx.fillText(value, width / 2, y);
  });
}
// Export runs in real time. Pause the recorder while seeking so removed intervals never enter the output.
export async function exportVideo(
  file: File,
  segments: Segment[],
  subtitles: Segment[],
  onProgress: (progress: number) => void,
  signal: AbortSignal,
  framing?:{ratio:RecordingRatio;focus:number},
  textLook?:TextLook,
  composition?:{layers:VideoLayer[];motions:ClipMotion[]},
): Promise<Blob> {
  if (!segments.length)
    throw new Error("Conserva al menos un fragmento del video.");
  const video = document.createElement("video");
  const url = URL.createObjectURL(file);
  video.src = url;
  video.playsInline = true;
  const audio = new AudioContext();
  let recorder: MediaRecorder | undefined;
  let stream: MediaStream | undefined;
  let raf = 0;
  try {
    if (video.readyState < 1) await waitMedia(video, "loadedmetadata", signal);
    // MediaRecorder WebM files commonly omit duration until the demuxer seeks to the end.
    if (!Number.isFinite(video.duration)) {
      const seek = waitMedia(video, "seeked", signal);
      video.currentTime = 1e10;
      await seek;
    }
    const canvas = document.createElement("canvas");
    const ratio = Math.min(
      1,
      1920 / Math.max(video.videoWidth, video.videoHeight),
    );
    canvas.width = Math.round(video.videoWidth * ratio);
    canvas.height = Math.round(video.videoHeight * ratio);
    if(framing){canvas.width=recordingFrames[framing.ratio].width;canvas.height=recordingFrames[framing.ratio].height;}
    if (!canvas.captureStream)
      throw new Error("Este navegador no admite exportación con subtítulos.");
    const ctx = canvas.getContext("2d")!;
    // Reject captions that would be silently truncated by the four-line renderer.
    const typography=textLook?captionTypography(canvas.width,textLook):{size:Math.max(18,Math.round(canvas.width/27)),weight:600,family:'sans-serif'};
    ctx.font=`${typography.weight} ${typography.size}px ${typography.family}`;
    for(const subtitle of subtitles){if(captionLines(ctx,subtitle.text,canvas.width*(textLook ? .82 : .88)).length>4)throw new Error('Este subtítulo ocupa más de cuatro líneas. Reduce su tamaño o divídelo antes de descargar.');}
    const source = audio.createMediaElementSource(video);
    const destination = audio.createMediaStreamDestination();
    source.connect(destination);
    // A zero-gain monitor keeps the audio graph active without audible playback.
    const gain = audio.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(audio.destination);
    await audio.resume();
    stream = new MediaStream([
      ...canvas.captureStream(30).getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ]);
    const mimeType=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type))??recordingMime();
    recorder = new MediaRecorder(stream, { ...(mimeType?{mimeType}:{}),videoBitsPerSecond:Math.min(16_000_000,Math.max(4_000_000,canvas.width*canvas.height*5)),audioBitsPerSecond:128000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    let recordingError: Error | null = null;
    recorder.onerror = () => {
      recordingError = new Error("No se pudo exportar el video.");
    };
    const images=new Map<string,HTMLImageElement>();await Promise.all((composition?.layers??[]).map(layer=>new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>{images.set(layer.id,img);resolve();};img.onerror=()=>reject(new Error('No pudimos cargar una superposición. Vuelve a añadirla.'));img.src=layer.url;})));
    let currentSegment=segments[0],currentIndex=0,completed=0;
    const paintVideo=()=>{const appearance=clipAppearance(video.currentTime,currentSegment,composition?.motions[currentIndex]);ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.globalAlpha=appearance.opacity;ctx.translate(canvas.width/2,canvas.height/2);ctx.scale(appearance.scale,appearance.scale);ctx.translate(-canvas.width/2,-canvas.height/2);if(framing){const crop=recordingCrop(video.videoWidth,video.videoHeight,canvas.width,canvas.height,framing.focus);ctx.drawImage(video,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);}else ctx.drawImage(video,0,0,canvas.width,canvas.height);ctx.restore();};
    const draw = () => {
      paintVideo();
      const text = subtitles
        .filter(
          (s) => video.currentTime >= s.start && video.currentTime < s.end,
        )
        .map((s) => s.text)
        .join(" ");
      if(text){if(textLook){const active=subtitles.filter(s=>video.currentTime>=s.start&&video.currentTime<s.end);paintStyledCaption(ctx,text,canvas.width,canvas.height,textLook,video.currentTime-Math.min(...active.map(s=>s.start)));}else drawCaption(ctx,text,canvas.width,canvas.height);}
      paintLayers(ctx,composition?.layers??[],images,completed+Math.max(0,video.currentTime-currentSegment.start),canvas.width,canvas.height);
      raf = requestAnimationFrame(draw);
    };
    const total = segments.reduce((sum, s) => sum + s.end - s.start, 0);

    for (const [segmentIndex,segment] of segments.entries()) {
      currentSegment=segment;currentIndex=segmentIndex;
      if (signal.aborted) throw new DOMException("Cancelado", "AbortError");
      video.pause();
      if (Math.abs(video.currentTime - segment.start) > 0.01) {
        const seek = waitMedia(video, "seeked", signal);
        video.currentTime = segment.start;
        await seek;
      }
      paintVideo();
      if (recorder.state === "inactive") {
        draw();
        recorder.start(250);
      } else if (recorder.state === "paused") recorder.resume();
      await video.play();
      await new Promise<void>((resolve, reject) => {
        let lastTime = video.currentTime;
        let lastAdvance = Date.now();
        const timer = window.setInterval(() => {
          if (video.currentTime > lastTime) {
            lastTime = video.currentTime;
            lastAdvance = Date.now();
          }
          if (
            signal.aborted ||
            recordingError ||
            video.error ||
            Date.now() - lastAdvance > 15_000
          ) {
            clearInterval(timer);
            reject(
              recordingError ??
                new Error(
                  signal.aborted
                    ? "Exportación cancelada."
                    : "El video se detuvo durante la exportación.",
                ),
            );
            return;
          }
          onProgress(
            Math.min(
              1,
              (completed + video.currentTime - segment.start) / total,
            ),
          );
          if (video.currentTime >= segment.end - 0.025 || video.ended) {
            clearInterval(timer);
            video.pause();
            if (recorder?.state === "recording") recorder.pause();
            resolve();
          }
        }, 20);
      });
      completed += segment.end - segment.start;
    }
    const stopped = new Promise<void>((resolve) => {
      recorder!.onstop = () => resolve();
    });
    recorder.stop();
    await stopped;
    return new Blob(chunks, { type: recorder.mimeType });
  } finally {
    cancelAnimationFrame(raf);
    video.pause();
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stream?.getTracks().forEach((t) => t.stop());
    await audio.close();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
