import React, { useRef } from 'react';
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { AarcProvider } from './context/AarcProvider';
import DynamicAarcApp from './components/DynamicAarcApp';
import "@aarc-xyz/eth-connector/styles.css"
import './index.css';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { aarcConfig } from './config/aarcConfig';

const App = () => {
  const aarcModalRef = useRef(new AarcFundKitModal(aarcConfig));
  const aarcModal = aarcModalRef.current;


  return (
    <React.StrictMode>
      <DynamicContextProvider
      theme="auto"
        settings={{
          environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <AarcProvider aarcModal={aarcModal}>
          <DynamicAarcApp
            isDark={true}
            logoLight="/logo.svg"
            logoDark="/logo.svg"
            aarcModal={aarcModal}
            onThemeToggle={() => {}}
          />
        </AarcProvider>
      </DynamicContextProvider>
    </React.StrictMode>
  );
};

export default App;