import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { ACCOUNT_NAVIGATION } from "@/constants/navigation";

export function AccountNavigation({
  current = "overview",
  isAdmin = false,
}: {
  current?: "overview" | "billing";
  isAdmin?: boolean;
}) {
  return (
    <nav className="account-navigation" aria-label="Account navigation">
      {ACCOUNT_NAVIGATION.map((item) => (
        <Link
          aria-current={item.section === current ? "page" : undefined}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
      {isAdmin ? (
        <Link href="/admin/memberships">Payment administration</Link>
      ) : null}
      <form action={logoutAction}>
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
