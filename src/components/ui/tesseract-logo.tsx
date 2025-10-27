
import { cn } from "@/lib/utils";

export function TesseractLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-24 h-24", className)}
      {...props}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)" stroke="hsl(var(--accent))" strokeWidth="2">
        {/* Outer cube */}
        <path d="M20 30 L50 15 L80 30 L80 70 L50 85 L20 70 Z" fill="hsl(var(--accent) / 0.05)" />
        <path d="M50 15 L50 50" fill="none" />
        <path d="M20 30 L50 50" fill="none" />
        <path d="M80 30 L50 50" fill="none" />
        {/* Inner cube */}
        <path d="M35 45 L50 35 L65 45 L65 65 L50 75 L35 65 Z" fill="hsl(var(--accent) / 0.1)" strokeOpacity="0.7" />
        <path d="M50 75 L50 50" fill="none" strokeOpacity="0.7" />
        <path d="M35 45 L50 50" fill="none" strokeOpacity="0.7" />
        <path d="M65 45 L50 50" fill="none" strokeOpacity="0.7" />
        {/* Connections */}
        <path d="M20 30 L35 45" fill="none" strokeOpacity="0.5" />
        <path d="M80 30 L65 45" fill="none" strokeOpacity="0.5" />
        <path d="M20 70 L35 65" fill="none" strokeOpacity="0.5" />
        <path d="M80 70 L65 65" fill="none" strokeOpacity="0.5" />
        <path d="M50 85 L50 75" fill="none" strokeOpacity="0.5" />
        <path d="M50 15 L50 35" fill="none" strokeOpacity="0.5" />
      </g>
    </svg>
  );
}
