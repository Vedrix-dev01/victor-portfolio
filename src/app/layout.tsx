import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "victor, full-stack and AI app developer",
  description:
    "Full-stack and AI app developer. From vibe-coded prototype to production: App Store submissions, EU-compliant migrations, Stripe billing, and multi-agent automation.",
  openGraph: {
    title: "victor, full-stack and AI app developer",
    description:
      "I ship web & mobile apps that actually launch. App Store, EU/GDPR migrations, AI agents & automation.",
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
