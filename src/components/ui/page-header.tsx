interface PageHeaderProps {
    heading: string;
    text?: string;
    children?: React.ReactNode;
}

export function PageHeader({ heading, text, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between px-2">
            <div className="grid gap-1">
                <h1 className="font-bold text-3xl tracking-tight text-white">{heading}</h1>
                {text && <p className="text-gray-400">{text}</p>}
            </div>
            {children}
        </div>
    );
}
