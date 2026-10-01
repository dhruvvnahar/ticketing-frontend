"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StorefrontPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to fetch from backend");
        
        const data = await res.json();
        
        // Safely check if data is an array to prevent .map() crashes
        if (Array.isArray(data)) {
          setEvents(data);
          setError(false);
        } else {
          console.error("Backend returned unexpected data structure:", data);
          setEvents([]);
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
        setEvents([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gray-900 text-white pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-black to-orange-900/20 mix-blend-multiply"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Discover Local <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Experiences</span></h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">Book exclusive tickets to workshops, meetups, and events happening in your city.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-red-100">
            <h3 className="text-2xl font-bold text-red-600">Connection Error</h3>
            <p className="text-gray-500 mt-2">Could not connect to the backend server. Please wait a moment and refresh the page.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-800">No events found</h3>
            <p className="text-gray-500 mt-2">Check back later or run the /api/seed endpoint.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              
              return (
                <div key={event.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-violet-100 to-orange-50 relative p-6 flex flex-col justify-end">
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                      {eventDate}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-fuchsia-600 text-xs font-black px-3 py-1.5 rounded-full">
                      ₹{event.ticketPrice}
                    </div>
                  </div>
                  
                  <div className="p-6 sm:p-8 flex-grow flex flex-col">
                    <h2 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{event.title}</h2>
                    <p className="text-gray-500 font-medium text-sm mb-6 flex-grow">{event.description}</p>
                    
                    <div className="border-t border-gray-100 pt-6 mt-auto">
                      <Link 
                        href={`/checkout?eventId=${event.id}`}
                        className="block w-full text-center text-white bg-gray-900 hover:bg-black font-black rounded-xl text-base px-5 py-4 transition-colors"
                      >
                        Buy Tickets
                      </Link>
                      <p className="text-center text-xs text-gray-400 font-semibold mt-3 uppercase tracking-wider">
                        {event.totalSeats} seats remaining
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}