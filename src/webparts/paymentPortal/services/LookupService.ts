import { sp } from './spfxContext';
import { LISTS } from '../constants/lists';

type Item = { Id: number; Title: string };

const cache: Record<string, Item[]> = {};

async function getAll(title: string): Promise<Item[]> {
  if (cache[title]) return cache[title];
  const items = await sp().web.lists.getByTitle(title).items.select('Id,Title').top(5000)();
  cache[title] = items;
  return items;
}

export const LookupService = {
  vendors: () => getAll(LISTS.VendorDirectory),
  reasons: () => getAll(LISTS.RequestReasons),
  entities: () => getAll(LISTS.Entities),
  assets: () => getAll(LISTS.Assets),
};
