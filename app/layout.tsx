import "./globals.css";
import Header from "@/components/layout/header";

export const metadata = {
  title: "Dapur Siswa",
  description: "Student food management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">

        {/* Page Content */}
        <main>{children}</main>

      </body>
    </html>
  );
}