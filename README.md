# RentOps Dashboard

The visual command center for the RentOps ecosystem. This dashboard provides real-time visibility into your Kora Node's rent efficiency.

## Features

*   **Real-time Stream:** Watch detection events live as the scanner processes your node's history.
*   **Smart Classification:** Automatically distinguishes between `RECLAIMABLE` (Node-Owned) and `SPONSORED` (User-Owned) accounts.
*   **Interactive Charts:** Visualize SOL lockup trends and reclamation performance.
*   **Safety First:** Integrated modal warnings prevent accidental closure of user-owned assets or token-holding accounts.
*   **Documentation:** Built-in docs viewer for Kora and Solana rent mechanics.

## Quick Start (Frontend Only)

To run the dashboard locally for development:

```bash
# Install dependencies & start dev server 
pnpm install && pnpm dev
```

Visit `http://localhost:3000` to view the dashboard.

## Full Infrastructure Setup

To deploy the complete RentOps stack (Backend + Frontend) securely on your own infrastructure(highly RECOMMENDED), please refer to the official documentation:

[→ Installation Guide](https://rentops.davidnzube.xyz/docs)
