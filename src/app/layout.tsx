import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { content } from "@/data/content";
import { absoluteUrl } from "@/lib/asset";
import "./globals.css";

/*
 * Anton 은 라틴 전용이라 한글을 지원하지 않는다. 큰 숫자와 영문 라벨에만 쓴다.
 * 한글은 globals.css 에서 self-host 하는 Pretendard 가 맡는다.
 */
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const { site } = content;
const title = `${site.name} — ${site.dateLabel}`;
const description = site.lead;

export const metadata: Metadata = {
  title: { default: title, template: `%s · ${site.name}` },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    // 크롤러는 상대 경로를 읽지 못하므로 절대 주소로 만든다. 주소를 모르면 아예 뺀다.
    images: absoluteUrl(site.shareImage) ? [{ url: absoluteUrl(site.shareImage)! }] : undefined,
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={anton.variable}>
      <body>{children}</body>
    </html>
  );
}
