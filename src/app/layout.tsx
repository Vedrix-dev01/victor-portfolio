import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "victor, full-stack developer for apps, websites and AI agents",
  description:
    "Full-stack developer. Web apps, mobile apps, websites and AI agents built from scratch, and AI-built apps fixed and launched: App Store submissions, Stripe billing and migrations.",
  openGraph: {
    title: "victor, full-stack developer for apps, websites and AI agents",
    description:
      "I build and ship web apps, mobile apps, websites and AI agents. App Store, Stripe billing, migrations and automation.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f4ef",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
