/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FACTORY_ADDRESS: string
    readonly VITE_TOKEN_ADDRESS: string
    readonly VITE_ALCHEMY_RPC_URL: string
    readonly VITE_FAUCET_URL: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
