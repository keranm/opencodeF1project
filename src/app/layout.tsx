import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Matomo from "@/components/Matomo";
import { getDashboardData } from "@/lib/data";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "PIT LANE — F1 News Dashboard",
  description: "Aggregated Formula 1 news from the best sources. Driver news, team news, race coverage, and more.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { generatedAt } = await getDashboardData();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Matomo />
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer generatedAt={generatedAt} />
      </body>
    </html>
  );
}
