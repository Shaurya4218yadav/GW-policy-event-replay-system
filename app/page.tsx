"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="animate-pulse font-mono text-xs uppercase tracking-widest text-slate-500">
        Initializing Simulation Environment...
      </div>
    </div>
  );
}
