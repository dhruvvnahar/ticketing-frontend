"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";

export default function ContinuousScannerPage() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processTicket = async (scannedText: string) => {
    // Prevent double-scanning the same code rapidly
    if (isProcessing || !user) return;
    setIsProcessing(true);
    setStatus(null);

    try {
      const parts = scannedText.split("/verify/");
      const ticketId = parts.length > 1 ? parts[1] : scannedText;


      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";
      const res = await fetch(`${baseUrl}/api/tickets/${ticketId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id }),
      });

      const data = await res.json();

      if (!data.success) {
        setStatus({
          text: data.message || "Invalid Ticket",
          type: data.status === "used" ? "warning" : "error",
        });
      } else {
        setStatus({
          text: `✅ Verified: ${data.buyerName || "Attendee"}`,
          type: "success",
        });
      }
    } catch (error) {
      setStatus({ text: "Network error during scan.", type: "error" });
    } finally {
      // 4-second pause so the attendee's name is clearly readable
      setTimeout(() => {
        setIsProcessing(false);
        setStatus(null);
      }, 4000);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-black mb-2 text-red-600">Access Restricted</h1>
          <p className="text-gray-500 mb-6">Please log in to your dashboard to use the scanner.</p>
          <Link href="/sign-in" className="block w-full bg-black text-white font-bold py-3 rounded-xl">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-md flex justify-between items-center mb-8 pt-4">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white font-bold text-sm bg-gray-800 px-4 py-2 rounded-lg transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-xl font-black">Gate Scanner</h1>
      </div>

      <div className="w-full max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
        <div className="aspect-square relative">
          <Scanner
            onScan={(detectedCodes) => {
              const scannedText = detectedCodes[0]?.rawValue;
              if (scannedText) void processTicket(scannedText);
            }}
            onError={(error) => console.error(error)}
            scanDelay={500}
          />

          {isProcessing && status && (
            <div
              onClick={() => {
                setIsProcessing(false);
                setStatus(null);
              }}
              className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-black/90 cursor-pointer ${
                status.type === "success"
                  ? "text-green-400"
                  : status.type === "warning"
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              <span className="text-6xl mb-4">
                {status.type === "success" ? "✅" : status.type === "warning" ? "⚠️" : "❌"}
              </span>
              <h2 className="text-2xl font-black mb-2">{status.text}</h2>
              <button
                type="button"
                className="mt-6 px-5 py-2 text-sm font-bold text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm border border-white/10"
              >
                Tap anywhere to scan next
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-900 border-t border-gray-800">
          <p className="text-center text-sm font-medium text-gray-400">
            {isProcessing ? "Processing ticket..." : "Point camera at an attendee's QR code"}
          </p>
        </div>
      </div>
    </main>
  );
}