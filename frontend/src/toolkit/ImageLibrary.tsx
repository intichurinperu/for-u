import { Link } from 'react-router-dom';
import { Card as DSCard } from '../components/ui/DesignSystem';
import { Input as DSInput, ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { askAI } from "./api";
import { compressImage } from "./media";
import { useToolkit } from "./ToolkitContext";
import type { UploadedImage } from "./types";
export default function ImageLibrary() {
  const { userId, projectId, business, docs, save, demo, track } = useToolkit();
  const [images, setImages] = useState<UploadedImage[]>(
    (docs.images as UploadedImage[]) ?? [],
  );
  const [urls, setUrls] = useState<Record<string, string>>(() => Object.fromEntries(images.filter(image=>image.demoUrl).map(image=>[image.path,image.demoUrl!])));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (demo || !supabase) return;
    let active = true;
    const paths = images.map((i) => i.path);
    if (!paths.length) return;
    void supabase.storage
      .from("user-uploads")
      .createSignedUrls(paths, 3600)
      .then(({ data, error }) => {
        if (!active) return;
        if (error)
          setNotice(
            "No pudimos cargar las imágenes. Vuelve a abrir la biblioteca.",
          );
        else
          setUrls(
            Object.fromEntries(
              (data ?? []).map((row) => [row.path, row.signedUrl]),
            ),
          );
      });
    return () => {
      active = false;
    };
  }, [images, demo]);
  async function upload(files: FileList | File[]) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    const additions: UploadedImage[] = [];
    const pendingPaths: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, 10)) {
        const blob = await compressImage(file);
        const id = crypto.randomUUID();
        const path = `${userId}/${projectId}/${id}.jpg`;
        let demoUrl: string | undefined;
        if (demo) {
          demoUrl = await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('No se pudo leer la imagen.'));reader.readAsDataURL(blob);});
          setUrls((current) => ({ ...current, [path]: demoUrl! }));
        } else {
          if (!supabase)
            throw new Error("Conecta tu cuenta para guardar imágenes.");
          const { error } = await supabase.storage
            .from("user-uploads")
            .upload(path, blob, { contentType: "image/jpeg", upsert: false });
          if (error)
            throw new Error(
              "No se pudo subir la imagen. Comprueba tu conexión y vuelve a intentar.",
            );
          pendingPaths.push(path);
        }
        additions.push({
          id,
          ...(demoUrl ? {demoUrl} : {}),
          path,
          name: file.name,
          tags: [business.industry, "sin etiquetar"],
          createdAt: new Date().toISOString(),
        });
      }
      const next = [...additions, ...images];
      await save("images", next);
      if (mounted.current) setImages(next);
      track("images", true);
      setNotice(
        `${additions.length} imágenes guardadas y comprimidas. Puedes generar sus etiquetas con IA.`,
      );
    } catch (e) {
      if (!demo && pendingPaths.length && supabase)
        await supabase.storage.from("user-uploads").remove(pendingPaths);
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function tags(image: UploadedImage) {
    setBusy(true);
    setNotice("");
    try {
      const response = await askAI(
        "tags",
        "Describe la imagen con 5 etiquetas cortas en español, separadas por comas. No identifiques personas.",
        business,
        { imagePath: image.path, projectId },
      );
      const list = response
        .split(/[,\n]/)
        .map((t) => t.trim().replace(/^[-#\d.\s]+/, ""))
        .filter(Boolean)
        .slice(0, 8);
      if (!list.length) throw new Error("No se recibieron etiquetas.");
      const next = images.map((item) =>
        item.id === image.id ? { ...item, tags: list } : item,
      );
      await save("images", next);
      setImages(next);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updateTags(image: UploadedImage, value: string) {
    const next = images.map((item) =>
      item.id === image.id
        ? {
            ...item,
            tags: value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 12),
          }
        : item,
    );
    try {
      await save("images", next);
      setImages(next);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  async function remove(image: UploadedImage) {
    setBusy(true);
    try {
      const next = images.filter((item) => item.id !== image.id);
      await save("images", next);
      setImages(next);
      if (!demo && supabase) {
        const { error } = await supabase.storage
          .from("user-uploads")
          .remove([image.path]);
        if (error)
          setNotice(
            "La imagen salió de la biblioteca, pero no se pudo eliminar el archivo de almacenamiento.",
          );
      }
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <DSCard as="section" className="tk-card tk-stack">
      <div className="tk-toolbar">
        <div>
          <div className="tk-eyebrow">LA ESENCIA DE TU MARCA</div>
          <h2>Tu biblioteca de imágenes</h2><Link to={'/dashboard/tools/profile?project='+projectId}>Archivos organizados por publicación →</Link>
        </div>
        <label className="tk-file-button">
          Subir imágenes
          <DSInput
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={(e) => {
              if (e.target.files) void upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div
        className="tk-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        Arrastra tus fotos aquí · JPG, PNG y WebP · hasta 20 MB por imagen
      </div>
      <p className="tk-tip">
        Para{" "}
        {business.industry === "gastronomy"
          ? "tu negocio gastronómico, empieza por fotos del plato estrella, preparación y empaque."
          : "tu negocio, empieza por fotos de tu trabajo, tus productos y sus detalles."}
      </p>
      <label>
        Buscar por nombre o etiqueta
        <DSInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="producto, local, proceso…"
        />
      </label>
      {busy && <p role="status">Preparando tus imágenes…</p>}
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
      <div className="tk-image-grid">
        {images
          .filter((i) =>
            `${i.name} ${i.tags.join(" ")}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((i) => (
            <DSCard as="article" key={i.id} className="tk-image-card">
              {urls[i.path] ? (
                <img src={urls[i.path]} alt={i.name} loading="lazy" />
              ) : (
                <div className="tk-drop">Cargando imagen…</div>
              )}
              <strong>{i.name}</strong>
              <small>{new Date(i.createdAt).toLocaleDateString("es-PE")}</small>
              <label>
                Etiquetas
                <DSInput
                  key={i.tags.join(",")}
                  defaultValue={i.tags.join(", ")}
                  disabled={busy}
                  onBlur={(e) => {
                    if (e.target.value !== i.tags.join(", "))
                      void updateTags(i, e.target.value);
                  }}
                />
              </label>
              <div className="tk-toolbar">
                <DSButtonSecondary disabled={busy || demo} onClick={() => tags(i)}>
                  Etiquetar con IA
                </DSButtonSecondary>
                <DSButtonSecondary disabled={busy} onClick={() => remove(i)}>
                  Eliminar
                </DSButtonSecondary>
              </div>
            </DSCard>
          ))}
      </div>
      {!images.length && (
        <p>Tus fotos aparecerán aquí. Solo tú puedes ver esta biblioteca.</p>
      )}
    </DSCard>
  );
}
