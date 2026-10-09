import Image from "next/image";

const SIZES = {
  sm: { mark: 28, text: "text-sm" },
  md: { mark: 36, text: "text-xl" },
  lg: { mark: 64, text: "text-4xl" },
} as const;

type LogoProps = {
  size?: keyof typeof SIZES;
  label?: string | null;
  className?: string;
};

export function Logo({ size = "md", label = "ZELLOO", className = "" }: LogoProps) {
  const { mark, text } = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} dir="ltr">
      <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white p-0.5">
        <Image
          src="/images/zelloo-logo-icon.png"
          alt={label ? "" : "Zelloo"}
          width={mark}
          height={Math.round((mark * 462) / 512)}
          priority
        />
      </span>
      {label ? <span className={`font-black tracking-tight ${text}`}>{label}</span> : null}
    </span>
  );
}
