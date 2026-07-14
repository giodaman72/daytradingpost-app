import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

export function AccountNavigation({ current = "overview" }: { current?: "overview" | "billing" }) {
  return (
    <nav className="account-navigation" aria-label="Account navigation">
      <Link href="/dashboard">Trader dashboard</Link>
      <Link href="/account" aria-current={current === "overview" ? "page" : undefined}>Account overview</Link>
      <Link href="/account/billing" aria-current={current === "billing" ? "page" : undefined}>Billing & membership</Link>
      <Link href="/premium">Premium plans</Link>
      <Link href="/analysis">Market analysis</Link>
      <form action={logoutAction}>
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
