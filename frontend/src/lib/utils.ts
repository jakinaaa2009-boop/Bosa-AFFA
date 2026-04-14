export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export function formatDateMn(d: Date) {
  return new Intl.DateTimeFormat('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

