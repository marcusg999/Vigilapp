import type { Metadata } from "next";
import { Bodoni_Moda, Instrument_Sans } from "next/font/google";
import "./globals.css";

// Display: a high-contrast Didone — severe and luminous, carved rather than
// written. The séance key: concrete and night lit by one flame.
const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Body/UI: a calm humanist sans that stays quiet next to the serif.
const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pleroma — a space for remembrance",
  description:
    "A quiet, sacred space to remember someone you love, and to sit with their memory through a guided ritual of connection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
