import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// Change 1: Use 'any' for props to avoid strict type errors with Next.js 15 promises
export default async function EventAttendeesPage(props: any) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Change 2: Await the params (Required for Next.js 15) and handle folder naming fallbacks
  const resolvedParams = await props.params;
  const actualEventId = resolvedParams.eventId || resolvedParams.id;

  let tickets = [];
  try {
    // Change 3: Inject the safely resolved ID into the fetch URL
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${actualEventId}/tickets`, {
      cache: "no-store",
    });
    if (res.ok) {
      tickets = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch tickets", error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Attendee List</h1>
          <p className="text-gray-500">View and manage ticket holders for this event.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Buyer Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Phone</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No tickets sold yet. Share your event link to get started!
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{ticket.buyerName}</td>
                    <td className="px-6 py-4 text-gray-600">{ticket.buyerEmail}</td>
                    <td className="px-6 py-4 text-gray-600">{ticket.buyerPhone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        ticket.status === 'checked-in' ? 'bg-violet-100 text-violet-700' :
                        ticket.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}