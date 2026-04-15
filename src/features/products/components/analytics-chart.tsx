"use client";

import { format } from "date-fns";
import type { AnalyticsPoint } from "../server/analytics-actions";

export function AnalyticsChart({ data }: { data: AnalyticsPoint[] }) {
    const maxValue = Math.max(1, ...data.map((d) => Math.max(d.views, d.scans)));
    const width = 720;
    const height = 220;
    const padX = 32;
    const padY = 20;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

    const scaleY = (v: number) => padY + innerH - (v / maxValue) * innerH;
    const pointX = (i: number) => padX + i * stepX;

    const buildPath = (getter: (p: AnalyticsPoint) => number) =>
        data
            .map((d, i) => `${i === 0 ? "M" : "L"} ${pointX(i).toFixed(1)} ${scaleY(getter(d)).toFixed(1)}`)
            .join(" ");

    const buildArea = (getter: (p: AnalyticsPoint) => number) => {
        const line = buildPath(getter);
        if (data.length === 0) return "";
        const lastX = pointX(data.length - 1).toFixed(1);
        const firstX = pointX(0).toFixed(1);
        const bottom = (padY + innerH).toFixed(1);
        return `${line} L ${lastX} ${bottom} L ${firstX} ${bottom} Z`;
    };

    const viewsPath = buildPath((p) => p.views);
    const viewsArea = buildArea((p) => p.views);
    const scansPath = buildPath((p) => p.scans);

    // Y-axis ticks (4 divisions)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        y: padY + innerH - t * innerH,
        label: Math.round(t * maxValue).toString(),
    }));

    // X-axis labels: first, middle, last
    const xLabelIndices =
        data.length <= 1
            ? data.map((_, i) => i)
            : [0, Math.floor(data.length / 2), data.length - 1];

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="viewsGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#C6A85E" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#C6A85E" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y grid lines */}
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line
                            x1={padX}
                            x2={width - padX}
                            y1={t.y}
                            y2={t.y}
                            stroke="rgba(255,255,255,0.06)"
                            strokeDasharray="2 3"
                        />
                        <text x={padX - 6} y={t.y + 3} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end">
                            {t.label}
                        </text>
                    </g>
                ))}

                {/* Views area */}
                <path d={viewsArea} fill="url(#viewsGradient)" />
                {/* Views line */}
                <path d={viewsPath} fill="none" stroke="#C6A85E" strokeWidth="2" />
                {/* Scans line */}
                <path d={scansPath} fill="none" stroke="#135bec" strokeWidth="2" strokeDasharray="4 3" />

                {/* X labels */}
                {xLabelIndices.map((i) => (
                    <text
                        key={i}
                        x={pointX(i)}
                        y={height - 4}
                        fontSize="10"
                        fill="rgba(255,255,255,0.4)"
                        textAnchor="middle"
                    >
                        {format(new Date(data[i].date), "MMM d")}
                    </text>
                ))}
            </svg>

            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 px-2">
                <div className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[#C6A85E]" />
                    Views
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-[#135bec]" style={{ borderTop: "1px dashed #135bec" }} />
                    QR Scans
                </div>
            </div>
        </div>
    );
}
