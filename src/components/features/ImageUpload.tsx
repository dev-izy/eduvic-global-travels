import { useEffect, useRef, useState, type DragEvent } from "react";
import { supabase } from "../../lib/supabase";

const BUCKET = "package-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const prettySize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Drag-and-drop cover image picker backed by Supabase Storage.
 *
 * Files go into the public `package-images` bucket; the public URL is handed
 * back through onChange and stored on the package row exactly as a pasted URL
 * would be, so nothing downstream has to change. A URL field is still
 * available behind a toggle for stock photos and existing packages.
 */
export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<string | null>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  // Release the object URL for the optimistic preview when it's replaced.
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const upload = async (file: File) => {
    setError("");

    if (!ACCEPTED.includes(file.type)) {
      setError("That file isn't an image. Use a JPG, PNG, WebP, AVIF or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is ${prettySize(file.size)}. The limit is 5 MB — try compressing it.`);
      return;
    }

    // Show the picked file immediately rather than waiting on the round trip.
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setLocalPreview(objectUrl);
    setUploading(true);

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      setUploading(false);
      setLocalPreview(null);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setError(
        /row-level security|not authorized|Unauthorized/i.test(uploadError.message)
          ? "Upload was refused — sign out and back in, then try again."
          : uploadError.message
      );
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    setLocalPreview(null);
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  // Paste an image straight from the clipboard while the picker is focused.
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const onPaste = (e: ClipboardEvent) => {
      if (disabled || uploading) return;
      const file = Array.from(e.clipboardData?.files || [])[0];
      if (file) {
        e.preventDefault();
        upload(file);
      }
    };

    zone.addEventListener("paste", onPaste as EventListener);
    return () => zone.removeEventListener("paste", onPaste as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, uploading]);

  const shown = localPreview || value;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = ""; // allow re-picking the same file
        }}
      />

      {shown ? (
        <div className="relative rounded-lg overflow-hidden border border-background-200 group animate-fade-in">
          <img
            src={shown}
            alt="Package cover"
            className="w-full h-44 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
            }}
          />

          {uploading && (
            <div className="absolute inset-0 bg-foreground-950/55 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-white">Uploading…</p>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-end gap-2 bg-gradient-to-t from-foreground-950/80 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-background-50/95 text-xs font-semibold text-foreground-800 hover:bg-background-50 transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setError("");
                }}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-red-500/95 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={zoneRef}
          tabIndex={0}
          role="button"
          aria-label="Upload a cover image"
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            // Ignore drags moving between children of the zone.
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center gap-2 h-44 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-accent-400 bg-accent-50 scale-[1.01]"
              : "border-background-300 bg-background-100 hover:border-primary-300 hover:bg-primary-50/40"
          } ${disabled || uploading ? "pointer-events-none opacity-70" : ""}`}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-foreground-600">Uploading…</p>
            </>
          ) : (
            <>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  dragging
                    ? "bg-accent-500 text-white scale-110"
                    : "bg-background-200 text-foreground-500"
                }`}
              >
                <i className={`text-xl ${dragging ? "ri-download-2-line" : "ri-image-add-line"}`} />
              </div>
              <p className="text-sm font-medium text-foreground-700">
                {dragging ? "Drop it here" : "Drag an image here"}
              </p>
              <p className="text-xs text-foreground-500">
                or <span className="text-primary-600 font-medium">browse your files</span> · JPG,
                PNG, WebP up to 5 MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5 animate-fade-in">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      <div className="mt-2">
        {showUrlField ? (
          <div className="animate-fade-in">
            <input
              className="w-full px-3.5 py-2.5 text-sm bg-background-50 border border-background-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15 text-foreground-950 placeholder:text-foreground-400 transition-all"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
            />
            <button
              type="button"
              onClick={() => setShowUrlField(false)}
              className="mt-1.5 text-xs text-foreground-500 hover:text-foreground-700 transition-colors"
            >
              Hide link field
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlField(true)}
            className="text-xs text-foreground-500 hover:text-primary-600 transition-colors"
          >
            Or paste an image link instead
          </button>
        )}
      </div>
    </div>
  );
}