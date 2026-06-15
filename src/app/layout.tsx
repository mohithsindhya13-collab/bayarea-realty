import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valley & Co. Realty | Premium Bay Area Real Estate",
  description: "Find luxury homes, modern condos, and family estates in San Jose, Cupertino, and the California Bay Area. Browse top-tier school districts and tech hubs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
