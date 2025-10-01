// src/webparts/paymentPortal/PaymentPortalWebPart.ts

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { Version } from '@microsoft/sp-core-library';

import PaymentPortal from './components/PaymentPortal'; // <- your component file
import { initContext } from './services/spfxContext';

export interface IPaymentPortalWebPartProps {}

/**
 * Root SPFx web part for the Payment Portal.
 * - Initializes PnP SP & Graph context
 * - Renders the React <PaymentPortal /> using React 17 API
 */
export default class PaymentPortalWebPart
  extends BaseClientSideWebPart<IPaymentPortalWebPartProps> {

  public async onInit(): Promise<void> {
    await super.onInit();
    // Wire up PnPjs (SP + Graph) with the SPFx context
    initContext(this.context);
  }

  public render(): void {
    const element = React.createElement(PaymentPortal, {});
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
