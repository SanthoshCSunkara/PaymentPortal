import { ctx, sp, graph } from './spfxContext';

type SPUserLite = { Id: number; Title?: string; Email?: string; LoginName?: string } | null;

export const UserService = {
  me: () => ctx().pageContext.user,

  isTreasury: async () => {
    const groups = await sp().web.currentUser.groups();
    return groups.some(g => g.Title === 'CR-Treasury');
  },

  /** Resolve the manager; tries SharePoint User Profile first, then Graph (if consented). */
  getManager: async (userPrincipalName?: string): Promise<SPUserLite> => {
    const login = userPrincipalName || ctx().pageContext.user.loginName;

    // 1) Try SharePoint User Profiles (no Graph permission required)
    try {
      const prof: any = await (sp().profiles as any).getPropertiesFor(login);
      const mgrLogin = prof?.UserProfileProperties?.find((p: any) => p.Key === 'Manager')?.Value;
      if (mgrLogin) {
        const ensured: any = await sp().web.ensureUser(mgrLogin);
        return ensured as SPUserLite;
      }
    } catch { /* ignore */ }

    // 2) Fallback: Graph (requires AAD app consent)
    try {
      const upn = userPrincipalName || (ctx().pageContext.user['email'] as string) || login;
      // .users is available because we imported '@pnp/graph/users'
      const m: any = await (graph() as any).users(upn).manager();
      const email = m?.mail || m?.userPrincipalName;
      if (email) {
        const ensured: any = await sp().web.ensureUser(email);
        return ensured as SPUserLite;
      }
    } catch { /* ignore */ }

    return null;
  },
};
