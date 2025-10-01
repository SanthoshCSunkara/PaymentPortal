import { ctx, sp } from '../services/spfxContext';
import { GROUPS } from '../constants/lists';

export const isMe = (login?: string) =>
  !!login && login.toLowerCase() === ctx().pageContext.user.loginName.toLowerCase();

export const isTreasury = async (): Promise<boolean> => {
  const groups = await sp().web.currentUser.groups();
  return groups.some(g => g.Title === GROUPS.Treasury);
};