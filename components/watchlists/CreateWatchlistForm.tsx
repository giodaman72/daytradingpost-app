import { createWatchlistAction } from "@/app/watchlists/actions";
export function CreateWatchlistForm() {
  return (
    <form action={createWatchlistAction} className="smart-form">
      <label htmlFor="watchlist-name">Watchlist name</label>
      <input id="watchlist-name" name="name" maxLength={60} required />
      <label htmlFor="watchlist-description">
        Description <span>(optional)</span>
      </label>
      <textarea
        id="watchlist-description"
        name="description"
        maxLength={240}
        rows={3}
      />
      <button className="button" type="submit">
        Create watchlist
      </button>
    </form>
  );
}
