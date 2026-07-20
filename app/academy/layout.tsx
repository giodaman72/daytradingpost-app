import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function AcademyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="academy-page">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
