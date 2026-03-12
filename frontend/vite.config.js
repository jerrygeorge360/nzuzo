import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    // fhevmjs ships WebAssembly binaries that Vite's dep-optimizer can't handle.
    // Exclude it so the raw package is used directly, with WASM served from /public.
    optimizeDeps: {
        exclude: ["fhevmjs", "@zama-fhe/relayer-sdk"],
    },
    // Allow Vite to process .wasm files from the public dir
    assetsInclude: ["**/*.wasm"],
    server: {
        // Ensure WASM is served with the correct MIME type
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
});
