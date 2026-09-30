"use client";

import { useParams } from "next/navigation";

export default function EventDashboardPage() {
  const params = useParams();
  
  // Safely grab the ID whether it's an object or a promise-like structure
  const eventId = params?.eventId || "Loading...";

  return (
    <main style={{ padding: '50px', backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Debugger</h1>
      <p>If you can see this, the routing works!</p>
      <p style={{ color: '#a78bfa', marginTop: '20px' }}>
        <strong>Detected Event ID:</strong> {eventId}
      </p>
    </main>
  );
}