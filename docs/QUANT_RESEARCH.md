# Quant research lab

The `/research/backtesting` workspace is a research-only backtester. It does not
connect to a broker, place orders, recommend a trade, or claim that historical
performance will persist.

## Baseline strategy

Version 0.1 implements an explainable long-only EMA–ATR trend model:

1. A bullish state exists when the fast EMA is above the slow EMA at a daily
   close.
2. Entry occurs at the next bar's open plus configured slippage. This prevents
   using the closing signal at the same close.
3. Quantity is the smaller of risk-budget sizing and the maximum cash allocation.
4. The initial stop and target are fixed ATR multiples from the entry.
5. A bearish close schedules an exit at the next bar's open.
6. If a bar touches both stop and target, the engine uses the conservative
   assumption that the stop occurred first.
7. Open positions are closed on the last available bar.

The metrics include total and annualized return, annualized volatility, a
zero-risk-free-rate Sharpe ratio, maximum drawdown, win rate, profit factor, and
closed-trade count. Fees and slippage are charged per side.

## Data contract and privacy

CSV input requires `date,open,high,low,close`; `volume` is optional. Dates and
OHLC consistency are validated, duplicate timestamps are rejected, and the
current browser implementation does not upload or persist the file. Files are
limited to 2 MB in the interface.

The default series is deterministic synthetic demonstration data. It is clearly
labeled and must never be represented as market history.

The server-only Alpaca adapter supports adjusted daily IEX bars for the bounded
`SPY`, `QQQ`, and `GLD` research universe. Requests accept a range from 120 days
through 10 years, are rate limited, and use a one-hour server cache. Responses
preserve symbol, provider, feed, adjustment, timeframe, range, and retrieval
metadata. Alpaca keys never cross the server boundary.

Required server environment variables:

```text
ALPACA_API_KEY_ID=
ALPACA_API_SECRET_KEY=
ALPACA_DATA_BASE_URL=https://data.alpaca.markets
ALPACA_HISTORICAL_FEED=iex
ALPACA_QUOTE_FEED=delayed_sip
```

`ALPACA_QUOTE_FEED` is reserved for a future quote surface; the daily research
endpoint does not represent its bars as delayed quotes.

## Known limitations

- Daily bars and one long position only
- No short selling, leverage, dividends, financing, taxes, market impact,
  partial fills, borrow availability, corporate actions, or portfolio effects
- No benchmark, walk-forward split, parameter-search correction, or
  survivorship-bias controls yet
- Annualized statistics assume daily observations and 252 trading periods

Before enabling any real-money or paper execution, add independently reviewed
data licensing, walk-forward validation, out-of-sample reporting, broker-specific
order simulations, kill switches, permissioning, audit logs, and compliance
approval.
