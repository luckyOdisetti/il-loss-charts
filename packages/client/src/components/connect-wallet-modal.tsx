import { Button, Modal } from 'react-bootstrap';

import { useWallet } from 'hooks/use-wallet';
import { useErrorHandler } from 'react-error-boundary';
import { ReactComponent as MetamaskLogo } from 'styles/metamask-logo.svg';
import { ReactComponent as WalletConnectLogo } from 'styles/walletconnect-logo.svg';
import Sentry, { SentryError } from 'util/sentry';

function ConnectWalletModal({
    show,
    setShow,
}: {
    show: boolean;
    setShow: (show: boolean) => void;
}): JSX.Element {
    const handleClose = () => setShow(false);
    const handleError = useErrorHandler();
    const {
        wallet,
        connectMetaMask,
        connectWalletConnect,
        disconnectWallet,
        availableProviders,
    } = useWallet();
    const titleText = wallet?.account
        ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Connected: ${wallet?.account}`
        : 'Connect Wallet';

    const handleConnectMetaMask = async () => {
        try {
            await connectMetaMask();
        } catch (e) {
            handleError(e);
        }

        // Close modlal after half-second
        setTimeout(handleClose, 500);
    };

    const handleConnectWalletConnect = async () => {
        try {
            await connectWalletConnect();
        } catch (err) {
            setTimeout(handleClose, 100);
            // wallet connect throws error incase user closes the modal
            // Send event to sentry
            // Todo, better UX to let the user know what happened
            const sentryErr = new SentryError(
                `could not connect to wallet connect provider`,
                err
            );
            Sentry.captureException(sentryErr);
            window.location.reload();
        }
    };

    return (
        <Modal show={show} onHide={handleClose} dialogClassName='dark'>
            <Modal.Header className='connect-wallet-modal-header' closeButton>
                <Modal.Title className='connect-wallet-modal-title'>
                    {titleText}
                </Modal.Title>
            </Modal.Header>
            {!wallet?.account && (
                <Modal.Body className='connect-wallet-modal'>
                    <p className='centered'>
                        Choose a wallet provider to connect with.
                    </p>
                    <div className='connect-wallet-modal-options-container'>
                        <button
                            className='connect-wallet-modal-option'
                            // disabled={!availableProviders.metamask}
                            onClick={handleConnectMetaMask}
                        >
                            <MetamaskLogo />
                        </button>
                        <button
                            className='connect-wallet-modal-option'
                            disabled={!availableProviders.walletconnect}
                            onClick={handleConnectWalletConnect}
                        >
                            <WalletConnectLogo />
                        </button>
                    </div>
                </Modal.Body>
            )}
            {wallet?.account && (
                <Modal.Footer className='manage-liquidity-modal-footer'>
                    <Button
                        variant='danger'
                        size='sm'
                        onClick={disconnectWallet}
                    >
                        Disconnect
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
}

export default ConnectWalletModal;
