"use client";

import { useState } from "react";

type Props = {
  imageUrl: string | null;
};

export function MenuItemThumb({ imageUrl }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (imageUrl && failedUrl !== imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="size-16 shrink-0 rounded-lg object-cover border"
        onError={() => setFailedUrl(imageUrl)}
      />
    );
  }

  return (
    <div className="size-16 shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-1 text-center text-[11px] font-semibold leading-tight text-gray-400">
      Kein Foto
    </div>
  );
}
