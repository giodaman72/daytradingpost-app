import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const links = [
  ["/admin/academy", "Overview"],
  ["/admin/academy/courses", "Courses"],
  ["/admin/academy/enrollments", "Enrollments"],
  ["/admin/academy/assessments", "Assessments"],
  ["/admin/academy/certificates", "Certificates"],
  ["/admin/academy/reviews", "Reviews"],
  ["/admin/academy/analytics", "Analytics"],
] as const;

export function AcademyAdminShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="academy-admin-page">
      <Header />
      <div className="container academy-admin-shell">
        <aside className="academy-admin-sidebar">
          <strong>Academy operations</strong>
          <nav aria-label="Academy administration">
            {links.map(([href, label]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/instructor/academy">Instructor dashboard</Link>
        </aside>
        <div className="academy-admin-main">
          <header className="academy-admin-heading">
            <span className="section-kicker">Trading Academy 2.0</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
