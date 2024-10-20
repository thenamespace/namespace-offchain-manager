import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Layout from "@/components/layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Namespace Offchain Manager",
  description: "Manage your ENS subdomains offchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link href="./favicon.png" rel="icon" sizes="32x32" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Layout> {children} </Layout>
      </body>
    </html>
  );
}
