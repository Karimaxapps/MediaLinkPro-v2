"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
    text: string;
    className?: string;
    /** px per second — animation speed when text overflows. Default 30. */
    speed?: number;
    /** Gap (px) between the looping copies of the text. Default 32. */
    gap?: number;
}

/**
 * Renders text that scrolls right-to-left ONLY when it would overflow its
 * container. When the text fits, it renders as plain static text (no
 * animation). Used in tight UI like the sidebar to avoid horizontal scrollbars.
 */
export function MarqueeText({ text, className, speed = 30, gap = 32 }: MarqueeTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const [overflow, setOverflow] = useState(false);
    const [duration, setDuration] = useState(12);

    useEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;
        if (!container || !measure) return;

        const check = () => {
            const textWidth = measure.scrollWidth;
            const containerWidth = container.clientWidth;
            const isOverflow = textWidth > containerWidth + 1; // 1px tolerance
            setOverflow(isOverflow);
            if (isOverflow) {
                // Travel distance is textWidth + gap (one copy + gap before loop).
                const distance = textWidth + gap;
                setDuration(Math.max(6, distance / speed));
            }
        };

        check();
        const ro = new ResizeObserver(check);
        ro.observe(container);
        return () => ro.disconnect();
    }, [text, speed, gap]);

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden whitespace-nowrap", className)}
        >
            {/* Hidden measurer — uses the same font/size as the visible copy */}
            <span
                ref={measureRef}
                aria-hidden
                className="invisible absolute inline-block whitespace-nowrap"
            >
                {text}
            </span>

            {overflow ? (
                <div
                    className="inline-flex animate-marquee will-change-transform"
                    style={
                        {
                            ["--marquee-duration"]: `${duration}s`,
                            paddingRight: gap,
                        } as React.CSSProperties
                    }
                >
                    <span className="inline-block">{text}</span>
                    <span
                        className="inline-block"
                        aria-hidden
                        style={{ paddingLeft: gap }}
                    >
                        {text}
                    </span>
                </div>
            ) : (
                <span className="inline-block">{text}</span>
            )}
        </div>
    );
}
