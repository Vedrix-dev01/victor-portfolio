import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "victor, full-stack and AI app developer",
  description:
    "Full-stack developer. Web apps, mobile apps and websites built from scratch, and AI-built apps fixed and launched: App Store submissions, Stripe billing, migrations and AI automation.",
  openGraph: {
    title: "victor, full-stack and AI app developer",
    description:
      "I build web apps, mobile apps and websites, and get them live. App Store, Stripe billing, migrations, AI agents and automation.",
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
