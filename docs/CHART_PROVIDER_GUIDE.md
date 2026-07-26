# Chart provider guide

Use `CHART_PROVIDER=tradingview` for documented public widgets and set
`NEXT_PUBLIC_TRADINGVIEW_WIDGETS_ENABLED=false` to disable them. TradingView
symbols are allowlisted in the instrument registry and never accepted directly
from browser input.

Use `CHART_PROVIDER=first_party` only when a reviewed historical OHLC adapter is
configured. Until then it truthfully renders unavailable. Use
`CHART_PROVIDER=development` locally for deterministic fixtures; production
configuration rejects fixture mode.

The repository does not contain or claim a license to TradingView Charting
Library. Do not add proprietary assets without a reviewed agreement.
