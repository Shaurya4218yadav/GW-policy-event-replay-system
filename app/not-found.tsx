"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="font-mono text-xs uppercase tracking-widest text-muted">Redirecting to Dashboard...</div>
      </div>
    </div>
  );
}
