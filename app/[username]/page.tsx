"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchCreator = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creators/${username}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        if (data.error) {
          setError(true);
        } else {
          setCreator(data);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-black text-gray-900">Creator Not Found</h1>
        <p className="text-gray-500 mt-2">This link might be broken or the handle doesn't exist.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* Creator Banner */}
      <div className="bg-gray-900 text-white pt-20 pb-16 px-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full mx-auto mb-4 shadow-xl flex items-center justify-center text-3xl font-black">
          {creator.name?.charAt(0) || "C"}
        </div>
        <h1 className="text-4xl font-black">{creator.name}</h1>
        <p className="text-gray-400 mt-2">@{creator.username}</p>
        {creator.bio && <p className="max-w-md mx-auto mt-4 text-gray-300">{creator.bio}</p>}
      </div>

      {/* Events List */}
      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        
        {!creator.events || creator.events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming events right now.</p>
        ) : (
          creator.events.map((event: any) => (
            <Link 
              href={`/checkout?eventId=${event.id}`} 
              key={event.id}
              className="block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-violet-600 transition-colors">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-violet-600 transition-colors">
                ₹{event.ticketPrice}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}