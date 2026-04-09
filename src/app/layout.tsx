import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "EcoMarket — Shop Local, Live Sustainably",
  description: "Discover handcrafted eco-friendly products from artisans in your neighborhood.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} font-sans min-h-screen`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AuthProvider>
          <NavBar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <footer className="border-t mt-16 py-12" style={{ borderColor: '#E5DDD5', backgroundColor: '#F5EFE8' }}>
            <div className="section text-center">
              <p className="font-serif italic text-lg" style={{ color: '#3D2B1F' }}>EcoMarket</p>
              <p className="text-sm mt-1" style={{ color: '#9E8B7D' }}>Supporting local artisans · Reducing waste · Building community</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
