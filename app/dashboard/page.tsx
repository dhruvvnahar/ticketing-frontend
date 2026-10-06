import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress || "no-email@provided.com";

  // 1. Sync creator on load
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync-creator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email: primaryEmail,
        name: user.firstName || "Creator",
      }),
    });
  } catch (error) {
    console.error("Failed to sync creator", error);
  }

  // 2. Fetch events for this user from FastAPI
  let events = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?clerk_id=${user.id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      events = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch events", error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-900">Creator Dashboard</h1>
        <UserButton />
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
            <p className="text-gray-500 text-sm">Manage and track your ticketed experiences.</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="px-4 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm shadow-sm"
          >
            + Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4">You haven't published any events yet.</p>
            <Link
              href="/dashboard/events/new"
              className="text-sm font-bold text-black underline underline-offset-4"
            >
              Publish your first event now →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-5">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-24 h-24 object-cover rounded-xl border border-gray-100 flex-shrink-0" 
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium flex-shrink-0">
                    No Image
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{event.date ? event.date.replace("T", " ") : ""}</p>
                  <p className="text-sm font-black text-gray-900 mt-2">₹{event.price.toFixed(2)}</p>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}