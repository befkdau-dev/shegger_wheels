import localFont from "next/font/local";
import "./globals.css";
import AppProviders from "@/components/layout/AppProviders";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Self-hosted variable fonts via next/font (concept #17): no external font requests.
const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
const jakarta = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-jakarta",
  display: "swap",
  weight: "200 800",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Peer-to-peer car rental in Addis Ababa`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Peer-to-peer car rental in Addis Ababa`,
    description: SITE_DESCRIPTION,
    locale: "en_ET",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Peer-to-peer car rental`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
