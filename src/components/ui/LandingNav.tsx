"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe2 } from 'lucide-react';
import clsx from 'clsx';

export default function LandingNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Globe2 className="w-6 h-6 text-blue-400" />
        <Link href="/" className="font-bold tracking-widest text-white uppercase hover:text-blue-400 transition-colors">
          Project Zenith
        </Link>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link 
          href="/docs" 
          className={clsx(
            "transition-colors",
            pathname === '/docs' ? "text-white" : "text-gray-400 hover:text-white"
          )}
        >
          Documentation
        </Link>
        <Link 
          href="/about" 
          className={clsx(
            "transition-colors",
            pathname === '/about' ? "text-white" : "text-gray-400 hover:text-white"
          )}
        >
          About
        </Link>
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors hidden sm:block"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
