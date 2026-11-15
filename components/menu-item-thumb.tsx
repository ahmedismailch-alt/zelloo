"use client";

import { useState } from "react";

type Props = {
  imageUrl: string | null;
  itemName?: string;
  busy?: boolean;
  onPickFile?: (file: File) => void;
};

export function MenuItemThumb({ imageUrl, itemName, busy, onPickFile }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  const visual = hasImage ? (
    <img
      src={imageUrl as string}
      alt=""
      className="size-16 shrink-0 rounded-lg object-cover border"
      onError={() => setFailedUrl(imageUrl)}
    />
  ) : (
    <div className="size-16 shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-1 text-center text-[11px] font-semibold leading-tight text-gray-400">
      Kein Foto
    </div>
  );

  if (!onPickFile) return visual;

  return (
    <label
      className="relative block size-16 shrink-0 cursor-pointer rounded-lg focus-within:ring-2 focus-within:ring-black"
      aria-label={
        hasImage
          ? `Foto von ${itemName ?? "Gericht"} ändern`
          : `Foto für ${itemName ?? "Gericht"} hochladen`
      }
    >
      {visual}
      <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border bg-white text-xs shadow-sm">
        {busy ? "…" : "+"}
      </span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPickFile(file);
        }}
      />
    </label>
  );
}
