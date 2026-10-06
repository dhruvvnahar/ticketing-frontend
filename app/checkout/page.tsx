"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId") || "";

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventIdFromUrl) {
      setError("No Event ID found. Please start from the home page.");
      setLoading(false);
      return;
    }

    // Fetch event details to pass price and ID to the CheckoutForm
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventIdFromUrl}`);
        if (res.ok) {
          const data = await res.json();
          setEventData(data);
        } else {
          // Fallback if endpoint is unavailable
          setEventData({ id: eventIdFromUrl, price: 700 }); 
        }
      } catch (err) {
        setEventData({ id: eventIdFromUrl, price: 700 });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventIdFromUrl]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-amber-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-purple-900/50 border border-white/50 p-8 sm:p-10 relative z-10 transition-all duration-500">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500 tracking-tight mb-2">Grab Your Spot</h1>
          <p className="text-sm font-medium text-gray-500">
            {eventData?.title ? `Checkout for ${eventData.title}` : "Fill in your details for instant access."}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 font-bold py-10">Loading event details...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 font-bold text-center">⚠️ {error}</div>
        ) : (
          /* Render the new multi-ticket component here! */
          <CheckoutForm event={eventData} />
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">Loading secure checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}