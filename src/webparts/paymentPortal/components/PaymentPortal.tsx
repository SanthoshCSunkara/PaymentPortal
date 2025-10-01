// src/webparts/paymentPortal/components/PaymentPortal.tsx
import * as React from 'react';
import App from './App';

/**
 * Thin wrapper so the root web part can render a no-props component.
 * Removes the generated IPaymentPortalProps requirement entirely.
 */
const PaymentPortal: React.FC = () => {
  return <App />;
};

export default PaymentPortal;
