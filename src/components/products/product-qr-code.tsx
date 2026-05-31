"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Share2, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProductQRCodeProps {
  productId: string;
  productName: string;
  slug: string;
}

export function ProductQRCode({ productId, productName }: ProductQRCodeProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  // SSR-deterministic (uses build-time NEXT_PUBLIC_APP_URL, not window), so no
  // mount gate / effect is needed — same value renders on server and client.
  const scanUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${productId}`;

  const downloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${productName}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast.success("QR Code downloaded!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    toast.success("Tracking link copied to clipboard!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 text-[var(--brand)] hover:text-[#B5964A] transition-colors"
        >
          <QrCode className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1A1D21] border-white/10 text-white">
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="p-4 bg-white rounded-xl">
            {scanUrl && (
              <QRCodeCanvas
                ref={qrRef}
                value={scanUrl}
                size={200}
                level={"H"}
                includeMargin={true}
                imageSettings={{
                  src: "/brand/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            )}
          </div>

          <DialogHeader className="text-center space-y-1">
            <DialogTitle className="text-lg font-medium text-white text-center">
              Scan to View
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 text-center">
              Use this code at events or in print
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              className="flex-1 gap-2 border-white/20 bg-white hover:bg-white/90 text-black font-medium"
              onClick={downloadQR}
            >
              <Download className="w-4 h-4" />
              Save
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-white/20 bg-white hover:bg-white/90 text-black font-medium"
              onClick={copyLink}
            >
              <Share2 className="w-4 h-4" />
              Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
