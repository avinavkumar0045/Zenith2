import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://project-zenith.vercel.app"),
  title: "Project Zenith - The Celestial Intelligence Platform",
  description: "Discover What Exists Above Any Point On Earth. Real-time satellite tracking, celestial positioning, and space weather intelligence.",
  keywords: ["space", "astronomy", "satellites", "ISS", "celestial", "situational awareness", "tracking"],
  authors: [{ name: "Project Zenith" }],
  openGraph: {
    title: "Project Zenith - The Celestial Intelligence Platform",
    description: "Discover What Exists Above Any Point On Earth in 3D.",
    url: "https://project-zenith.vercel.app",
    siteName: "Project Zenith",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Project Zenith Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Zenith",
    description: "Real-time celestial and satellite tracking.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zenith",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
