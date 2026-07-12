import React from 'react';

type MarketSnapshotProps = {
	title?: string;
};

const MarketSnapshot: React.FC<MarketSnapshotProps> = ({ title = 'Market Snapshot' }) => {
	return (
		<section aria-label="market-snapshot">
			<h2>{title}</h2>
			<p>No data available.</p>
		</section>
	);
};

export default MarketSnapshot;
