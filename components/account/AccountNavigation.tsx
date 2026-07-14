import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

export function AccountNavigation() {
  return (
    <nav className="account-navigation" aria-label="Account navigation">
      <Link href="/account" aria-current="page">Account overview</Link>
      <Link href="/premium">Premium membership</Link>
      <Link href="/analysis">Market analysis</Link>
      <form action={logoutAction}>
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
