import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-widgets/dist/css/react-widgets.css';
import 'styles/app.scss';

import { useState, useEffect, ReactElement } from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import LandingContainer from 'containers/landing-container';
import MarketContainer from 'containers/market-container';
import PairContainer from 'containers/pair-container';
// import PositionContainer from 'containers/position-container';
import SideMenu from 'components/side-menu';
import ConnectWalletModal from 'components/connect-wallet-modal';

import useWallet from 'hooks/use-wallet';

import { UniswapApiFetcher as Uniswap } from 'services/api';
import { calculatePairRankings } from 'services/calculate-stats';

import { AllPairsState, IError } from 'types/states';

function App(): ReactElement {
    // ------------------ Initial Mount - API calls for first render ------------------

    const [allPairs, setAllPairs] = useState<AllPairsState>({
        isLoading: true,
        pairs: null,
        lookups: null,
        byLiquidity: null,
    });
    const [currentError, setError] = useState<IError | null>(null);
    const [showConnectWallet, setShowConnectWallet] = useState(false);
    const {
        wallet,
        connectMetaMask,
        disconnectWallet,
        availableProviders,
    } = useWallet();

    useEffect(() => {
        const fetchAllPairs = async () => {
            // Fetch all pairs
            const { data: pairsRaw, error } = await Uniswap.getTopPairs();

            if (error) {
                // we could not list pairs
                console.warn(`Could not fetch top pairs: ${error.message}`);
                (window as any).error = error;
                setError(error);
                return;
            }

            if (pairsRaw) {
                const calculated = calculatePairRankings(pairsRaw);

                setAllPairs({
                    isLoading: false,
                    pairs: calculated.pairs,
                    lookups: calculated.pairLookups,
                    byLiquidity: calculated.byLiquidity,
                });
            }
        };

        void fetchAllPairs();
    }, []);

    if (currentError) {
        return (
            <Container>
                <h2>Oops, the grapes went bad.</h2>
                <p>Error: {currentError.message}</p>

                <h6>Refresh the page to try again.</h6>
            </Container>
        );
    }

    if (allPairs.isLoading) {
        return (
            <Container className='loading-container'>
                <div className='wine-bounce'>🍷</div>
            </Container>
        );
    }

    return (
        <Router>
            <div className='app' id='app-wrap'>
                {/* {isBigScreen &&
                    <div className='side-menu-wrapper'>
                        <SideMenu
                            setShowConnectWallet={setShowConnectWallet}
                            wallet={wallet}
                        />
                    </div>
                } */}
                <div className='side-menu-wrapper'>
                    <SideMenu
                        setShowConnectWallet={setShowConnectWallet}
                        wallet={wallet}
                    />
                </div>
                <div className='app-body' id='app-body'>
                    <ConnectWalletModal
                        show={showConnectWallet}
                        setShow={setShowConnectWallet}
                        wallet={wallet}
                        connectMetaMask={connectMetaMask}
                        disconnectWallet={disconnectWallet}
                        availableProviders={availableProviders}
                    />
                    <Switch>
                        {/* <Route path='/positions'>
                            <PositionContainer wallet={wallet} />
                        </Route> */}
                        <Route path='/market'>
                            <MarketContainer />
                        </Route>
                        <Route path='/pair'>
                            <PairContainer allPairs={allPairs} />
                        </Route>
                        <Route path='/'>
                            <LandingContainer />
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

export default App;
