import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { ACCOUNT_NAVIGATION } from "@/constants/navigation";

export function AccountNavigation({
  current = "overview",
}: {
  current?: "overview" | "billing";
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
      <form action={logoutAction}>
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
