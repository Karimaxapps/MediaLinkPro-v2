"use client";

import {
  Boxes,
  Camera,
  Mic,
  Headphones,
  MonitorPlay,
  Network,
  HardDrive,
  Cpu,
} from "lucide-react";

export type DiagramNode = {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string | null;
  companyLogoUrl?: string | null;
  companyName?: string | null;
  /** When true, clicking scrolls to the matching product card (#product-<id>). */
  linkToCard?: boolean;
};

type SetupDiagramProps = {
  centerLabel: string;
  centerSublabel?: string;
  centerImageUrl?: string | null;
  centerCompanyLogoUrl?: string | null;
  centerCompanyName?: string | null;
  nodes: DiagramNode[];
};

// Pick an icon from a product/category label as a fallback when no image exists.
function renderFallbackIcon(text?: string, className?: string) {
  const t = (text ?? "").toLowerCase();
  if (/(camera|lens|capture|camcorder)/.test(t)) return <Camera className={className} />;
  if (/(mic|audio|microphone|sound)/.test(t)) return <Mic className={className} />;
  if (/(monitor|headphone|speaker|review)/.test(t)) return <Headphones className={className} />;
  if (/(edit|software|nle|grading|playout|vfx)/.test(t)) {
    return <MonitorPlay className={className} />;
  }
  if (/(router|switch|matrix|infrastructure|transmission|signal|network)/.test(t)) {
    return <Network className={className} />;
  }
  if (/(storage|nas|san|archive|backup|disk|drive)/.test(t)) {
    return <HardDrive className={className} />;
  }
  if (/(cloud|ai|compute|render|gpu|processing)/.test(t)) return <Cpu className={className} />;
  return <Boxes className={className} />;
}

// Radial positions (percentages) around the center, starting at the top.
function nodePosition(index: number, total: number) {
  const angle = -90 + (360 / total) * index;
  const rad = (angle * Math.PI) / 180;
  const rx = 39;
  const ry = 36;
  return { left: 50 + rx * Math.cos(rad), top: 50 + ry * Math.sin(rad) };
}

export function SetupDiagram({
  centerLabel,
  centerSublabel,
  centerImageUrl,
  centerCompanyLogoUrl,
  centerCompanyName,
  nodes,
}: SetupDiagramProps) {
  const shown = nodes.slice(0, 8);
  if (shown.length === 0) return null;

  const positions = shown.map((_, i) => nodePosition(i, shown.length));

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/30 h-[440px] sm:h-[480px]">
      {/* Connector lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {positions.map((pos, i) => (
          <line
            key={i}
            x1={50}
            y1={50}
            x2={pos.left}
            y2={pos.top}
            stroke="#C6A85E"
            strokeOpacity={0.55}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
            className="ai-flow-line"
          />
        ))}
      </svg>

      {/* Center / hub node */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: "50%", top: "50%" }}
      >
        <div className="flex flex-col items-center gap-2 w-32 text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#C6A85E] bg-[#1a1a1a] shadow-[0_0_24px_rgba(198,168,94,0.45)]">
            {centerImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={centerImageUrl}
                alt={centerLabel}
                className="h-full w-full object-cover"
              />
            ) : (
              renderFallbackIcon(centerSublabel ?? centerLabel, "h-9 w-9 text-[#C6A85E]")
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-semibold text-white leading-tight">{centerLabel}</p>
            {centerSublabel && (
              <p className="text-[11px] text-[#C6A85E] leading-tight">{centerSublabel}</p>
            )}
            {(centerCompanyLogoUrl || centerCompanyName) && (
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 mt-0.5">
                {centerCompanyLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={centerCompanyLogoUrl}
                    alt={centerCompanyName ?? ""}
                    className="h-3.5 w-3.5 rounded-full object-contain shrink-0"
                  />
                )}
                {centerCompanyName && (
                  <span className="text-[10px] text-gray-400 truncate leading-none">
                    {centerCompanyName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Surrounding product nodes */}
      {shown.map((node, i) => {
        const pos = positions[i];
        const inner = (
          <div className="flex flex-col items-center gap-1.5 w-28 text-center">
            {/* Product image */}
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#161616] transition-all group-hover:border-[#C6A85E]/70 group-hover:shadow-[0_0_16px_rgba(198,168,94,0.35)]">
              {node.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={node.imageUrl} alt={node.label} className="h-full w-full object-cover" />
              ) : (
                renderFallbackIcon(node.sublabel ?? node.label, "h-6 w-6 text-gray-300")
              )}
            </div>

            {/* Product name */}
            <p className="text-[12px] font-medium text-gray-200 leading-tight line-clamp-2">
              {node.label}
            </p>

            {/* Company strip */}
            {(node.companyLogoUrl || node.companyName) && (
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 max-w-[7rem]">
                {node.companyLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={node.companyLogoUrl}
                    alt={node.companyName ?? ""}
                    className="h-3.5 w-3.5 rounded-full object-contain shrink-0"
                  />
                )}
                {node.companyName && (
                  <span className="text-[10px] text-gray-400 truncate leading-none">
                    {node.companyName}
                  </span>
                )}
              </div>
            )}
          </div>
        );

        return (
          <div
            key={node.id}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
          >
            {node.linkToCard ? (
              <a href={`#product-${node.id}`} className="block">
                {inner}
              </a>
            ) : (
              inner
            )}
          </div>
        );
      })}
    </div>
  );
}
