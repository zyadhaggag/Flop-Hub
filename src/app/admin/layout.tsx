import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
