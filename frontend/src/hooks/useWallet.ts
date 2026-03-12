import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function useWallet() {
    const { address, isConnected, chain } = useAccount();
    const { connect, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();

    const connectWallet = () => {
        connect({ connector: injected() });
    };

    return {
        address,
        isConnected,
        isConnecting,
        chain,
        connect: connectWallet,
        disconnect,
    };
}
