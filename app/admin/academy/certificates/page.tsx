import type { Metadata } from "next";
import Link from "next/link";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { CertificateAdminActions } from "@/components/academy/admin/CertificateAdminActions";
import { getCertificateAdminDashboard } from "@/lib/academy/admin/academyCertificateAdminService";

export const metadata: Metadata = {
  title: "Academy Certificate Management",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyCertificatesAdminPage() {
  const dashboard = await getCertificateAdminDashboard();
  return (
    <AcademyAdminShell
      title="Certificate management"
      description="Review issued, revoked and superseded certificates, verify public records and perform authorized audited lifecycle actions."
    >
      <div className="academy-admin-table-wrap">
        <table className="academy-admin-table">
          <caption className="sr-only">Academy certificate records</caption>
          <thead>
            <tr>
              <th>Certificate</th>
              <th>Learner</th>
              <th>Course</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.certificates.map((certificate) => (
              <tr key={certificate.id}>
                <td>
                  <strong>{certificate.certificateNumber}</strong>
                  <span>Version {certificate.courseVersion}</span>
                </td>
                <td>{certificate.learnerDisplayName}</td>
                <td>{certificate.courseTitleSnapshot}</td>
                <td>
                  {certificate.status}
                  {certificate.revokedAt ? (
                    <span>
                      Revoked{" "}
                      {new Date(certificate.revokedAt).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )}
                    </span>
                  ) : null}
                </td>
                <td>
                  {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </td>
                <td className="academy-admin-actions">
                  <Link
                    href={`/verify/certificate/${certificate.verificationCode}`}
                  >
                    Verify
                  </Link>
                  <CertificateAdminActions
                    certificateId={certificate.id}
                    status={certificate.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="academy-admin-panel">
        <h2>Audit history</h2>
        <ul className="academy-audit-list">
          {dashboard.audit.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.action}</strong>
              <span>{entry.targetId}</span>
              <time dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleString("en-US")}
              </time>
            </li>
          ))}
        </ul>
        {!dashboard.audit.length ? (
          <p>No certificate audit actions recorded.</p>
        ) : null}
      </section>
      <p className="academy-admin-notice">
        Reissue is limited to revoked certificates. It creates a replacement
        with fresh public identifiers, preserves the original snapshot, and
        marks the prior record superseded. Existing records are never rewritten
        or deleted.
      </p>
    </AcademyAdminShell>
  );
}
