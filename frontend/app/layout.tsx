import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Layout from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LibroLink",
  description: "Build Your Own Library: Read, Record, and Get Rewarded!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
