
"use client";

interface AdPlaceholderProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

export function AdPlaceholder({ className, width = "100%", height = 300 }: AdPlaceholderProps) {
    return (
        <div
            className={`bg-white/5 border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center ${className}`}
            style={{ width, height }}
        >
            <span className="text-white/20 font-medium">Advertisement Space</span>
            <span className="text-white/10 text-sm mt-1">
                {typeof width === 'number' ? width : 'Auto'} x {typeof height === 'number' ? height : 'Auto'}
            </span>
        </div>
    );
}
