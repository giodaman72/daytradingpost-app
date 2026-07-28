export function CertificateSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="certificate-grid certificate-skeleton"
      aria-label="Loading certificates"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div aria-hidden="true" key={index}>
          <i />
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}
