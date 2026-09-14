"use client";

import { useRef, useState } from "react";
import { Download, ImagePlus, RotateCcw } from "lucide-react";
import {
  IMAGE_CROP_RATIOS,
  IMAGE_FORMATS,
  clampCropBox,
  fitCropBox,
  imageQualityToRatio,
  type CropBox,
  type WebImageFormat,
} from "@rovotools/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canvasToBlob,
  downloadBlob,
  formatBytes,
  loadImageElement,
  replaceExtension,
} from "./imageUtils";

type OutputFormat = WebImageFormat | "same";

interface CroppedImage {
  name: string;
  dimensions: string;
  bytes: number;
  url: string;
  blob: Blob;
}

interface DragState {
  kind: "move" | "resize";
  startX: number;
  startY: number;
  box: CropBox;
  pointerId: number;
}

function sourceFormat(file: File): WebImageFormat {
  if (file.type === "image/png") {
    return "png";
  }
  if (file.type === "image/webp") {
    return "webp";
  }
  return "jpeg";
}

export default function ImageCropper(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [ratioKey, setRatioKey] = useState("free");
  const [box, setBox] = useState<CropBox | null>(null);
  const [format, setFormat] = useState<OutputFormat>("same");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CroppedImage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const ratio = IMAGE_CROP_RATIOS.find((entry) => entry.key === ratioKey) ?? IMAGE_CROP_RATIOS[0];

  function resetBox(naturalSize: { width: number; height: number }, key: string): void {
    const entry = IMAGE_CROP_RATIOS.find((item) => item.key === key);
    setBox(fitCropBox(naturalSize.width, naturalSize.height, entry?.w ?? null, entry?.h ?? null));
  }

  async function choose(next: File | null): Promise<void> {
    if (next === null || !next.type.startsWith("image/")) {
      return;
    }
    setError(null);
    setResult(null);
    try {
      const img = await loadImageElement(next);
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl(URL.createObjectURL(next));
      setFile(next);
      setNatural(size);
      resetBox(size, ratioKey);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not read that image.");
    }
  }

  function changeRatio(key: string): void {
    setRatioKey(key);
    if (natural !== null) {
      resetBox(natural, key);
    }
  }

  function displayScale(): number {
    const frame = frameRef.current;
    if (frame === null || natural === null) {
      return 1;
    }
    const rect = frame.getBoundingClientRect();
    return rect.width / natural.width;
  }

  function onBoxPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (box === null) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind: "move", startX: event.clientX, startY: event.clientY, box, pointerId: event.pointerId };
  }

  function onHandlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (box === null) {
      return;
    }
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind: "resize", startX: event.clientX, startY: event.clientY, box, pointerId: event.pointerId };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const drag = dragRef.current;
    if (drag === null || natural === null || event.pointerId !== drag.pointerId) {
      return;
    }
    const scale = displayScale();
    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;
    if (drag.kind === "move") {
      setBox(clampCropBox({ ...drag.box, x: drag.box.x + dx, y: drag.box.y + dy }, natural.width, natural.height));
    } else {
      const currentRatio = IMAGE_CROP_RATIOS.find((entry) => entry.key === ratioKey);
      const ratioW = currentRatio?.w ?? null;
      const ratioH = currentRatio?.h ?? null;
      const width = drag.box.width + dx;
      let height = drag.box.height + dy;
      if (ratioW !== null && ratioH !== null) {
        height = (width * ratioH) / ratioW;
      }
      setBox(clampCropBox({ ...drag.box, width, height }, natural.width, natural.height));
    }
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>): void {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function setField(patch: Partial<CropBox>): void {
    if (box === null || natural === null) {
      return;
    }
    const entry = IMAGE_CROP_RATIOS.find((item) => item.key === ratioKey);
    const width = Number.isFinite(Number(patch.width)) ? Number(patch.width) : box.width;
    const height = entry?.w != null && entry?.h != null
      ? (width * entry.h) / entry.w
      : Number.isFinite(Number(patch.height))
        ? Number(patch.height)
        : box.height;
    const merged: CropBox = {
      x: Number.isFinite(Number(patch.x)) ? Number(patch.x) : box.x,
      y: Number.isFinite(Number(patch.y)) ? Number(patch.y) : box.y,
      width,
      height,
    };
    setBox(clampCropBox(merged, natural.width, natural.height));
  }

  async function handleCrop(): Promise<void> {
    if (file === null || box === null || natural === null) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const entry = IMAGE_CROP_RATIOS.find((item) => item.key === ratioKey);
      const outW = entry?.exportWidth ?? Math.floor(box.width);
      const outH = entry?.exportHeight ?? Math.floor(box.height);
      const img = await loadImageElement(file);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (ctx === null) {
        throw new Error("Your browser would not give this page a canvas to draw on.");
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const outFormat: WebImageFormat = format === "same" ? sourceFormat(file) : format;
      const info = IMAGE_FORMATS[outFormat];
      if (!info.supportsAlpha) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, outW, outH);
      const blob = await canvasToBlob(canvas, info.mime, imageQualityToRatio(92));
      if (result !== null) {
        URL.revokeObjectURL(result.url);
      }
      setResult({
        name: replaceExtension(file.name, info.extension),
        dimensions: `${outW} × ${outH}`,
        bytes: blob.size,
        url: URL.createObjectURL(blob),
        blob,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Cropping failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    if (objectUrl !== null) {
      URL.revokeObjectURL(objectUrl);
    }
    if (result !== null) {
      URL.revokeObjectURL(result.url);
    }
    setFile(null);
    setObjectUrl(null);
    setNatural(null);
    setBox(null);
    setResult(null);
    setError(null);
    if (inputRef.current !== null) {
      inputRef.current.value = "";
    }
  }

  const upscales = ratioKey === "youtube" && box !== null && box.width < 1280;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {file === null || objectUrl === null || natural === null ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDrop={(event) => {
                  event.preventDefault();
                  void choose(event.dataTransfer.files[0] ?? null);
                }}
                onDragOver={(event) => event.preventDefault()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-8 text-sm dark:border-zinc-700"
              >
                <ImagePlus className="h-8 w-8 text-zinc-400" aria-hidden="true" />
                <span className="font-semibold">Drop an image here, or click to browse</span>
                <span className="text-xs text-zinc-500">JPG · PNG · WEBP</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void choose(event.target.files?.[0] ?? null);
                }}
              />
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Aspect ratio">
                {IMAGE_CROP_RATIOS.map((entry) => (
                  <Button
                    key={entry.key}
                    type="button"
                    role="tab"
                    aria-selected={ratioKey === entry.key}
                    variant={ratioKey === entry.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => changeRatio(entry.key)}
                  >
                    {entry.label}
                  </Button>
                ))}
              </div>
              <div ref={frameRef} className="relative select-none overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={objectUrl} alt="Crop source" className="block w-full" draggable={false} />
                {box !== null ? (
                  <div
                    role="application"
                    aria-label="Crop box. Drag to move, drag the corner to resize, or use the number fields below."
                    onPointerDown={onBoxPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="absolute cursor-move touch-none border-2 border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                    style={{
                      left: `${(box.x / natural.width) * 100}%`,
                      top: `${(box.y / natural.height) * 100}%`,
                      width: `${(box.width / natural.width) * 100}%`,
                      height: `${(box.height / natural.height) * 100}%`,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      onPointerDown={onHandlePointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      className="absolute -bottom-2 -right-2 h-6 w-6 cursor-nwse-resize touch-none rounded-sm border-2 border-white bg-indigo-500"
                    />
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-zinc-500">
                Drag inside the box to move it, or drag the corner to resize. On a phone, the number fields below are easier than the handle.
              </p>
              {box !== null ? (
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="crop-left">Left</Label>
                    <Input id="crop-left" inputMode="numeric" value={Math.round(box.x)} onChange={(event) => setField({ x: Number(event.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="crop-top">Top</Label>
                    <Input id="crop-top" inputMode="numeric" value={Math.round(box.y)} onChange={(event) => setField({ y: Number(event.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="crop-width">Width</Label>
                    <Input id="crop-width" inputMode="numeric" value={Math.round(box.width)} onChange={(event) => setField({ width: Number(event.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="crop-height">Height</Label>
                    <Input id="crop-height" inputMode="numeric" value={Math.round(box.height)} onChange={(event) => setField({ height: Number(event.target.value) })} disabled={ratio?.w != null} />
                  </div>
                </div>
              ) : null}
              {upscales ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  This crop is smaller than 1280px wide, so it will be scaled up to reach the YouTube size — that softens it. Crop a wider region where you can.
                </p>
              ) : null}
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="image-cropper-format">Save as</Label>
            <select
              id="image-cropper-format"
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="same">Same as source</option>
              <option value="webp">{IMAGE_FORMATS.webp?.label}</option>
              <option value="jpeg">{IMAGE_FORMATS.jpeg?.label}</option>
              <option value="png">{IMAGE_FORMATS.png?.label}</option>
            </select>
          </div>
          {error !== null ? (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={file === null || box === null || busy} onClick={() => void handleCrop()}>
              {busy ? "Cropping…" : "Crop image"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Cropped image</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <p className="text-sm text-zinc-500">Your cropped image appears here.</p>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url} alt={result.name} className="mx-auto max-h-80 rounded-lg" loading="lazy" />
              <p className="text-sm text-zinc-500">
                {result.dimensions} · {formatBytes(result.bytes)}
              </p>
              <Button type="button" variant="outline" onClick={() => downloadBlob(result.blob, result.name)}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
