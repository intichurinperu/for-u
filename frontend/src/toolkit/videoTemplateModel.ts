import {VIDEO_TEMPLATES, type VideoTemplateId} from './videoTemplates';
import {defaultTextLook, type TextLook} from './textStyles';
import type {Segment} from './engine';

export function videoTemplate(value: string | null) {
  return value && Object.hasOwn(VIDEO_TEMPLATES, value) ? VIDEO_TEMPLATES[value as VideoTemplateId] : undefined;
}

export function templateLook(id: VideoTemplateId): TextLook {
  return {...defaultTextLook, preset: id === 'story' ? 'editorial' : id === 'product' ? 'price' : id === 'flash' ? 'cta' : 'fade', font: id === 'story' ? 'editorial' : 'modern', position: 'middle'};
}

/** Editorial text timing, independent of speech transcription. */
export function templateCaptions(text: string, duration: number): Segment[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || !Number.isFinite(duration) || duration <= 0) return [];
  const rows: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > 80) { rows.push(line); line = ''; }
    line = line ? line + ' ' + word : word;
  }
  if (line) rows.push(line);
  return rows.map((text, index) => ({text, start: duration * index / rows.length, end: duration * (index + 1) / rows.length}));
}
