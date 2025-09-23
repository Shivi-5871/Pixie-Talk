import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { connectToDB } from "@/lib/db";  
import { DevtoolsRemover } from "@/components/devtools-remover";


import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pixie Talk | AI-Powered Content Creation",
  description: "Create, animate, and share AI-generated content with Pixie-Talk",
  generator: "v0.dev"
};

// Connect MongoDB when the layout loads
connectToDB() 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <DevtoolsRemover />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
