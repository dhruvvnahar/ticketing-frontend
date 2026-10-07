"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function PaymentStatusContent() {
  const [status, setStatus] = useState<"success">("success");

  useEffect(() => {
    // Payment completed successfully via the modal callback
    setStatus("success");
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 text-center border border-white/50">
        <div className="py-6 space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-black text-gray-900">You're All Set!</h1>
          <p className="text-sm text-gray-600">
            Payment successful! We've sent your entry QR code pass directly to your email.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">Loading payment status...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}