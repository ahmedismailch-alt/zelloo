import { readableTextColor } from "@/lib/branding";

export type TemplateId = "table" | "poster" | "square" | "story";

export type TemplateInfo = {
  id: TemplateId;
  label: string;
  size: string;
  width: number;
  height: number;
  filename: string;
  printable: boolean;
  pageSize?: string;
};

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "table",
    label: "Tischaufsteller",
    size: "A6",
    width: 1240,
    height: 1748,
    filename: "zelloo-tischaufsteller-a6.png",
    printable: true,
    pageSize: "A6",
  },
  {
    id: "poster",
    label: "Poster",
    size: "A4",
    width: 1654,
    height: 2339,
    filename: "zelloo-poster-a4.png",
    printable: true,
    pageSize: "A4",
  },
  {
    id: "square",
    label: "Social Post",
    size: "1080 × 1080",
    width: 1080,
    height: 1080,
    filename: "zelloo-social-quadrat.png",
    printable: false,
  },
  {
    id: "story",
    label: "Story",
    size: "1080 × 1920",
    width: 1080,
    height: 1920,
    filename: "zelloo-social-story.png",
    printable: false,
  },
];

type TemplateCopy = { headline: string; sub: string };

export const TEMPLATE_COPY: Record<TemplateId, TemplateCopy> = {
  table: {
    headline: "Scannen & bestellen",
    sub: "Ohne App. Ohne Warten.",
  },
  poster: {
    headline: "Vorbestellen & abholen",
    sub: "QR-Code scannen, Menü ansehen, bestellen. Ohne Anstehen.",
  },
  square: {
    headline: "Jetzt direkt bei uns bestellen",
    sub: "QR-Code scannen oder Link öffnen.",
  },
  story: {
    headline: "Jetzt direkt bei uns bestellen",
    sub: "QR-Code scannen oder Link öffnen.",
  },
};

export type DrawOptions = {
  name: string;
  brandColor: string;
  logo: HTMLImageElement | null;
  qr: HTMLCanvasElement | null;
  displayUrl: string;
  tableNumber: number | null;
  poweredBy: boolean;
  fontFamily: string;
};

type Ctx = CanvasRenderingContext2D;

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  weight: number,
  color: string,
  align: CanvasTextAlign,
  fontFamily: string,
  lineHeight = 1.15
): number {
  ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  const lines = wrapLines(ctx, text, maxWidth);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * fontSize * lineHeight);
  });
  return lines.length * fontSize * lineHeight;
}

function drawLogo(
  ctx: Ctx,
  logo: HTMLImageElement,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  align: "center" | "left"
): { w: number; h: number } {
  const ratio = logo.naturalWidth / logo.naturalHeight || 1;
  let h = maxH;
  let w = h * ratio;
  if (w > maxW) {
    w = maxW;
    h = w / ratio;
  }
  const dx = align === "center" ? x - w / 2 : x;
  ctx.drawImage(logo, dx, y, w, h);
  return { w, h };
}

function drawQrBox(
  ctx: Ctx,
  qr: HTMLCanvasElement | null,
  x: number,
  y: number,
  size: number,
  border: string,
  borderWidth: number
) {
  const radius = size * 0.07;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, size, size, radius);
  ctx.fill();
  if (borderWidth > 0) {
    ctx.strokeStyle = border;
    ctx.lineWidth = borderWidth;
    roundRect(ctx, x + borderWidth / 2, y + borderWidth / 2, size - borderWidth, size - borderWidth, radius);
    ctx.stroke();
  }
  if (qr) {
    const pad = size * 0.09;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, x + pad, y + pad, size - pad * 2, size - pad * 2);
    ctx.imageSmoothingEnabled = true;
  }
}

function drawPrintTemplate(
  ctx: Ctx,
  info: TemplateInfo,
  opts: DrawOptions,
  copy: TemplateCopy
) {
  const { width: w, height: h } = info;
  const u = w / 1000;
  const font = opts.fontFamily;
  const onBrand = readableTextColor(opts.brandColor);
  const isPoster = info.id === "poster";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const bandH = h * (isPoster ? 0.25 : 0.27);
  ctx.fillStyle = opts.brandColor;
  ctx.fillRect(0, 0, w, bandH);

  ctx.font = `800 ${(isPoster ? 118 : 112) * u}px ${font}`;
  const headSize = (isPoster ? 118 : 112) * u;
  const headLines = wrapLines(ctx, copy.headline, w * 0.84);
  const headBlock = headLines.length * headSize * 1.08;
  ctx.fillStyle = onBrand;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  headLines.forEach((line, index) => {
    ctx.fillText(line, w / 2, (bandH - headBlock) / 2 + index * headSize * 1.08);
  });

  let cursor = bandH + h * 0.035;

  if (opts.logo) {
    const lh = h * 0.07;
    const drawn = drawLogo(ctx, opts.logo, w / 2, cursor, w * 0.5, lh, "center");
    cursor += drawn.h + h * 0.012;
  }
  const nameSize = (opts.logo ? 46 : 62) * u;
  const nameHeight = drawParagraph(ctx, opts.name, w / 2, cursor, w * 0.84, nameSize, 800, "#111111", "center", font);
  cursor += nameHeight + h * 0.025;

  const tableLabelReserve = opts.tableNumber !== null ? 74 * u * 1.2 + h * 0.008 : 0;
  const subSize = 42 * u;
  ctx.font = `500 ${subSize}px ${font}`;
  const subHeight = wrapLines(ctx, copy.sub, w * 0.78).length * subSize * 1.25;
  const footerTop = isPoster
    ? h - h * (opts.poweredBy ? 0.062 : 0.035) - 34 * u
    : opts.poweredBy
      ? h - h * 0.028 - 28 * u
      : h;
  const textBelowQr = h * 0.025 + tableLabelReserve + subHeight;
  const available = footerTop - h * 0.015 - cursor - textBelowQr;
  const boxSize = Math.max(w * 0.3, Math.min(w * 0.64, available));
  const boxX = (w - boxSize) / 2;
  drawQrBox(ctx, opts.qr, boxX, cursor, boxSize, opts.brandColor, 10 * u);
  cursor += boxSize + h * 0.025;

  if (opts.tableNumber !== null) {
    const used = drawParagraph(ctx, `Tisch ${opts.tableNumber}`, w / 2, cursor, w * 0.8, 74 * u, 800, "#111111", "center", font);
    cursor += used + h * 0.008;
  }
  drawParagraph(ctx, copy.sub, w / 2, cursor, w * 0.78, 42 * u, 500, "#444444", "center", font, 1.25);

  if (isPoster) {
    ctx.font = `600 ${34 * u}px ${font}`;
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.displayUrl, w / 2, h - h * (opts.poweredBy ? 0.062 : 0.035));
  }

  if (opts.poweredBy) {
    ctx.font = `600 ${28 * u}px ${font}`;
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Powered by zelloo.ch", w / 2, h - h * 0.028);
  }
}

function drawSocialTemplate(
  ctx: Ctx,
  info: TemplateInfo,
  opts: DrawOptions,
  copy: TemplateCopy
) {
  const { width: w, height: h } = info;
  const font = opts.fontFamily;
  const onBrand = readableTextColor(opts.brandColor);
  const isStory = info.id === "story";

  ctx.fillStyle = opts.brandColor;
  ctx.fillRect(0, 0, w, h);

  const pad = 80;

  if (isStory) {
    let cursor = 170;
    if (opts.logo) {
      const drawn = drawLogo(ctx, opts.logo, w / 2, cursor, 360, 130, "center");
      cursor += drawn.h + 24;
    }
    cursor += drawParagraph(ctx, opts.name, w / 2, cursor, w - pad * 2, 54, 800, onBrand, "center", font) + 90;

    cursor += drawParagraph(ctx, copy.headline, w / 2, cursor, w - pad * 2, 116, 800, onBrand, "center", font, 1.08) + 80;

    const box = 600;
    drawQrBox(ctx, opts.qr, (w - box) / 2, cursor, box, opts.brandColor, 0);
    cursor += box + 60;

    cursor += drawParagraph(ctx, copy.sub, w / 2, cursor, w - pad * 2, 44, 600, onBrand, "center", font, 1.25) + 20;
    drawParagraph(ctx, opts.displayUrl, w / 2, cursor, w - pad * 2, 38, 700, onBrand, "center", font);

    if (opts.poweredBy) {
      ctx.font = `600 28px ${font}`;
      ctx.fillStyle = onBrand;
      ctx.globalAlpha = 0.7;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Powered by zelloo.ch", w / 2, h - 90);
      ctx.globalAlpha = 1;
    }
    return;
  }

  if (opts.logo) {
    const drawn = drawLogo(ctx, opts.logo, pad, pad, 220, 84, "left");
    drawParagraph(ctx, opts.name, pad + drawn.w + 24, pad + (drawn.h - 40) / 2, 520, 40, 800, onBrand, "left", font);
  } else {
    drawParagraph(ctx, opts.name, pad, pad, w - pad * 2, 48, 800, onBrand, "left", font);
  }

  const textWidth = 520;
  const headHeight = drawParagraph(ctx, copy.headline, pad, 240, textWidth, 88, 800, onBrand, "left", font, 1.08);
  drawParagraph(ctx, copy.sub, pad, 240 + headHeight + 36, textWidth, 38, 600, onBrand, "left", font, 1.25);

  const box = 380;
  drawQrBox(ctx, opts.qr, w - pad - box, h - pad - box - (opts.poweredBy ? 20 : 0) - 40, box, opts.brandColor, 0);

  drawParagraph(ctx, opts.displayUrl, pad, h - pad - 80, textWidth, 34, 700, onBrand, "left", font);
  if (opts.poweredBy) {
    ctx.font = `600 26px ${font}`;
    ctx.fillStyle = onBrand;
    ctx.globalAlpha = 0.7;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Powered by zelloo.ch", pad, h - pad + 10);
    ctx.globalAlpha = 1;
  }
}

export function drawTemplate(
  canvas: HTMLCanvasElement,
  id: TemplateId,
  opts: DrawOptions
) {
  const info = TEMPLATES.find((template) => template.id === id);
  if (!info) return;
  canvas.width = info.width;
  canvas.height = info.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, info.width, info.height);
  const copy = TEMPLATE_COPY[id];
  if (info.printable) {
    drawPrintTemplate(ctx, info, opts, copy);
  } else {
    drawSocialTemplate(ctx, info, opts, copy);
  }
}
