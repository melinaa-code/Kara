import type { Metadata } from "next";
import { Fraunces, Vazirmatn } from "next/font/google";
import { LocaleProvider } from "@/lib/locale";
import { StageBackdrop } from "@/components/StageBackdrop";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Vazirmatn({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lyricue — Karaoke & Line Battle",
  description: "Karaoke and missing-line battles — Lyricue",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col">
        <LocaleProvider>
          <StageBackdrop />
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            {children}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
