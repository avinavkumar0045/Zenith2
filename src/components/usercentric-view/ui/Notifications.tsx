import React, { useEffect, useState } from 'react';
import { Bell, Info, ShieldAlert } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'transit' | 'warning';
  time: string;
}

export default function Notifications() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add a toast
  const addToast = (text: string, type: 'info' | 'transit' | 'warning' = 'info') => {
    const id = Math.random().toString();
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setToasts(prev => [...prev, { id, text, type, time }]);

    // Remove toast after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    // Simulate premium sky events on mount to showcase real-time notification capability
    const timer1 = setTimeout(() => {
      addToast("ISS Pass starting in 2 minutes (Max Alt: 68°)", "transit");
    }, 4000);

    const timer2 = setTimeout(() => {
      addToast("Observation conditions improved: Cloud cover decreased to 8%", "info");
    }, 15000);

    const timer3 = setTimeout(() => {
      addToast("Saturn reaching Transit (Highest Altitude: 54°)", "info");
    }, 28000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 w-80 pointer-events-none select-none">
      {toasts.map(t => {
        const icon = t.type === 'transit' 
          ? <Bell size={14} className="text-cyan-400" />
          : t.type === 'warning'
          ? <ShieldAlert size={14} className="text-rose-400" />
          : <Info size={14} className="text-emerald-400" />;

        return (
          <div 
            key={t.id}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md shadow-2xl animate-fade-in-slide pointer-events-auto"
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[11px] font-bold text-white/90 leading-normal">{t.text}</span>
              <span className="text-[8px] font-semibold text-white/30">{t.time}</span>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .animate-fade-in-slide {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
