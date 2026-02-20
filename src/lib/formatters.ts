import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM yyyy');
}

export function formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
}
