import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi } from '@pnp/sp';
import { GraphFI, graphfi } from '@pnp/graph';
import { SPFx as PnPSpfx } from '@pnp/sp';
import { SPFx as GraphSpfx } from '@pnp/graph';

// PnPjs v3: bring in the modules you use so types like web/currentUser/etc. exist
import '@pnp/sp/webs';
import '@pnp/sp/sites';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import '@pnp/sp/files';
import '@pnp/sp/folders';
import '@pnp/sp/attachments';
import '@pnp/sp/site-groups';
import '@pnp/sp/site-users/web';
import '@pnp/sp/profiles';

// Graph (optional, only if consented)
import '@pnp/graph/users';

let _sp: SPFI;
let _graph: GraphFI;
let _ctx: WebPartContext;

export const initContext = (ctx: WebPartContext) => {
  _ctx = ctx;
  _sp = spfi().using(PnPSpfx(ctx));
  _graph = graphfi().using(GraphSpfx(ctx));
};

export const sp = () => _sp;
export const graph = () => _graph;
export const ctx = () => _ctx;
