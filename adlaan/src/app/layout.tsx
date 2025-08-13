import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "أدلان - كل اتفاقية قانونياً سليمة",
  description:
    "منصة أدلان للذكاء الاصطناعي القانوني - أتمتة المستندات القانونية بتقنية عربية متطورة",
  keywords: ["قانون", "ذكاء اصطناعي", "عقود", "مستندات قانونية", "أتمتة"],
  authors: [{ name: "Adlaan" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased font-cairo`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
