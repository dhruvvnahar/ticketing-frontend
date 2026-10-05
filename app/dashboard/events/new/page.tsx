"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewEventPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("price", price);
      formData.append("clerk_id", user?.id || "");
      if (imageFile) {
        formData.append("file", imageFile);
      }

      const response = await fetch(`${baseUrl}/api/events`, {
        method: "POST",
        // Note: Do NOT set Content-Type header manually when sending FormData. 
        // The browser sets it automatically with the correct multipart boundary.
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create event");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">Publish New Event</h1>
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pune Tech Meetup"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will attendees experience?"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event Poster Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-black cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Upload a cover image for your event.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-gray-400 font-medium">₹</span>
                <input
                  type="number"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="499"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? "Publishing Event..." : "Publish Event"}
          </button>
        </form>
      </div>
    </main>
  );
}