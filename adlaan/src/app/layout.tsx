import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "أدلان - كل اتفاقية قانونياً سليمة",
  description: "منصة أدلان للذكاء الاصطناعي القانوني - أتمتة المستندات القانونية بتقنية عربية متطورة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
      
        className={`${cairo.variable} antialiased font-cairo`}
      >     
       <Navigation />

      {children}
      
      <Footer />
      </body>
    </html>
  );
}
