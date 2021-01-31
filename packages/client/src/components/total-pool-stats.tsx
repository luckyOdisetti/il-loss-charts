import { Button, Card } from 'react-bootstrap';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';

import { LPStats as ILPStats } from '@sommelier/shared-types';

import { AllPairsState, LPInfoState, StatsWindow } from 'types/states';
import { Pair, DailyData, LPStats } from 'constants/prop-types';
import USDValueWidget from 'components/usd-value-widget';

function PercentChangeStat({ value }: { value?: BigNumber }) {
    if (!value) throw new Error('Passed falsy value to PercentChangeStat');

    const sign = value.isPositive() ? '↗' : '↘';
    const className = value.isPositive() ? 'pct-change-up' : 'pct-change-down';

    return (
        <span className={className}>
            {value.toFixed(2)}% {sign}
        </span>
    );
}

PercentChangeStat.propTypes = { value: PropTypes.instanceOf(BigNumber) };

function TotalPoolStats({
    allPairs,
    lpInfo,
    lpStats,
    defaultWindow = 'total',
    setWindow,
}: {
    allPairs: AllPairsState;
    lpInfo: LPInfoState;
    lpStats: ILPStats;
    defaultWindow?: StatsWindow;
    setWindow: (window: StatsWindow) => void;
}): JSX.Element {
    const { totalStats, lastDayStats, lastWeekStats } = lpStats;

    let stats;
    if (defaultWindow === 'total') {
        stats = totalStats;
    } else if (defaultWindow === 'day') {
        stats = lastDayStats;
    } else if (defaultWindow === 'week') {
        stats = lastWeekStats;
    } else {
        throw new Error('Unknown stats window');
    }

    const handleSetWindow = (selectedWindow: StatsWindow) => {
        // Reset to total if already clicked
        if (defaultWindow === selectedWindow) setWindow('total');
        else setWindow(selectedWindow);
    };

    const prefix =
        defaultWindow === 'day' ? '24h' : defaultWindow === 'week' ? '7d' : '';

    return (
        <div className='pool-stats-container'>
            {/* <CardDeck> */}
            <USDValueWidget
                title={`${prefix} USD Volume`}
                badge={`#${
                    allPairs?.lookups?.[lpInfo.pairData.id]?.volumeRanking || ''
                }`}
                value={stats?.volumeUSD?.toFixed(4)}
                footnote={
                    defaultWindow !== 'total' && (
                        <PercentChangeStat
                            value={stats?.volumeUSDChange?.times(100)}
                        />
                    )
                }
            />
            <USDValueWidget
                title={'Total Liquidity'}
                badge={`#${
                    allPairs?.lookups?.[lpInfo.pairData.id]?.liquidityRanking ||
                    ''
                }`}
                value={stats?.liquidityUSD?.toFixed(4)}
                footnote={
                    defaultWindow !== 'total' && (
                        <PercentChangeStat
                            value={stats?.liquidityUSDChange?.times(100)}
                        />
                    )
                }
            />
            <USDValueWidget
                title={`${prefix} Fees Collected`}
                badge={`#${
                    allPairs?.lookups?.[lpInfo.pairData.id]?.volumeRanking || ''
                }`}
                value={stats?.feesUSD?.toFixed(4)}
                footnote={
                    defaultWindow !== 'total' && (
                        <PercentChangeStat
                            value={stats?.feesUSDChange?.times(100)}
                        />
                    )
                }
            />
            <Card className='stats-card window-button-card no-border' body>
                <Button
                    variant={
                        defaultWindow === 'day' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    className='window-button'
                    onClick={() => handleSetWindow('day')}
                >
                    24H
                </Button>
                <Button
                    variant={
                        defaultWindow === 'week' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    className='window-button'
                    onClick={() => handleSetWindow('week')}
                >
                    7D
                </Button>
            </Card>
            {/* </CardDeck> */}
        </div>
    );
}

TotalPoolStats.propTypes = {
    allPairs: PropTypes.shape({
        lookups: PropTypes.object.isRequired,
    }),
    lpInfo: PropTypes.shape({
        pairData: Pair.isRequired,
        historicalData: PropTypes.arrayOf(DailyData),
    }),
    lpStats: LPStats,
};

export default TotalPoolStats;
