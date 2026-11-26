import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    default: "SpendWise — Track Smart. Spend Better. Save More.",
    template: "%s | SpendWise",
  },
  description:
    "SpendWise is a beautiful expense tracker built for college students. Track income, expenses, budgets and savings — and save smarter with AI insights.",
  keywords: ["expense tracker", "student finance", "budgeting", "spending", "AI finance", "INR"],
  openGraph: {
    title: "SpendWise — Track Smart. Spend Better. Save More.",
    description: "The student finance companion that makes tracking spending effortless.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
