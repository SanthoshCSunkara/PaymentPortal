export const fmtMoney = (n?: number | null) =>
  typeof n === 'number' ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '';

export const nowIso = () => new Date().toISOString();

export const makeRequestId = (seed: number) => {
  const s = String(seed);
  return 'VPR-' + (s.length >= 4 ? s : ('0000' + s).slice(-4));
};


export const asDateOnly = (d: Date | string) => {
  const dd = typeof d === 'string' ? new Date(d) : d;
  return new Date(dd.getFullYear(), dd.getMonth(), dd.getDate());
};
