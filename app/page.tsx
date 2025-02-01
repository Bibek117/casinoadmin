'use client';
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
    </div>
  );
}
