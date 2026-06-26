"use client";

import dynamic from 'next/dynamic';

// Disable SSR for Cesium/canvas rendering to prevent server-side window errors
const UserCentricView = dynamic(
  () => import('@/components/usercentric-view/UserCentricView'),
  { ssr: false }
);

export default function UserCentricViewPage() {
  return <UserCentricView />;
}
