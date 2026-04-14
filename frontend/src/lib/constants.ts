export const CAMPAIGN = {
  title: 'Урамшуулалт Сугалаа',
  periodText: '2026 оны 4 дүгээр сарын 15-наас 7 дугаар сарын 15-ныг дуустал үргэлжилнэ.',
  endDateIso: '2026-07-15T23:59:59+08:00'
} as const;

export const MENU = [
  { label: 'Үндсэн нүүр', href: '#home' },
  { label: 'Хэрхэн оролцох вэ?', href: '#how-to-join' },
  { label: 'Шагналууд', href: '#prizes' },
  { label: 'Урамшууллын бүтээгдэхүүнүүд', href: '#products' },
  { label: 'Ялагчид', href: '#winners' },
  { label: 'Баримт оруулах', href: '/receipt' }
] as const;

export const PRIZES = [
  { name: 'Ухаалаг ТВ', qty: 7 },
  { name: 'Чихэвч', qty: 3 },
  { name: 'PlayStation 5', qty: 7 },
  { name: 'Пүүз / спорт шагнал', qty: 7 },
  { name: 'Аргентины 2026 өмсгөл', qty: 14 },
  { name: 'FIFA 2026 хөлбөмбөг', qty: 14 }
] as const;

export const PRODUCTS = [
  { name: 'Бүтээгдэхүүн 1', image: '/products/p1.png' },
  { name: 'Бүтээгдэхүүн 2', image: '/products/p2.png' },
  { name: 'Бүтээгдэхүүн 3', image: '/products/p3.png' },
  { name: 'Бүтээгдэхүүн 4', image: '/products/p4.png' },
  { name: 'Бүтээгдэхүүн 5', image: '/products/p5.png' },
  { name: 'Бүтээгдэхүүн 6', image: '/products/p6.png' },
  { name: 'Бүтээгдэхүүн 7', image: '/products/p7.png' },
  { name: 'Бүтээгдэхүүн 8', image: '/products/p8.png' },
  { name: 'Бүтээгдэхүүн 9', image: '/products/p9.png' }
] as const;

