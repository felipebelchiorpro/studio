import type { Product, Category, Promotion, Order, Review } from '@/types';

export const mockReviews: Review[] = [
  { id: 'r1', author: 'Carlos S.', rating: 5, comment: 'Excelente produto, recomendo!', date: '2024-07-15' },
  { id: 'r2', author: 'Ana P.', rating: 4, comment: 'Muito bom, mas a embalagem poderia ser melhor.', date: '2024-07-10' },
  { id: 'r3', author: 'Lucas M.', rating: 5, comment: 'Resultados incríveis em poucas semanas.', date: '2024-07-05' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Concentrado (1kg)',
    description: 'Proteína de alta qualidade para ganho de massa muscular. Sabor Baunilha.',
    price: 129.90,
    category: 'Proteínas',
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 50,
    reviews: [mockReviews[0], mockReviews[1]],
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Creatina Monohidratada (300g)',
    description: 'Aumente sua força e performance nos treinos com nossa creatina pura.',
    price: 79.90,
    category: 'Aminoácidos',
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 100,
    reviews: [mockReviews[2]],
    rating: 5,
  },
  {
    id: '3',
    name: 'Multivitamínico Completo A-Z (90 caps)',
    description: 'Fórmula completa com vitaminas e minerais essenciais para sua saúde.',
    price: 59.90,
    category: 'Vitaminas',
    brand: 'Dark Vitality',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 75,
    rating: 4.0,
  },
  {
    id: '4',
    name: 'BCAA 2:1:1 (200g)',
    description: 'Aminoácidos de cadeia ramificada para recuperação muscular. Sabor Limão.',
    price: 69.90,
    category: 'Aminoácidos',
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 30,
    rating: 4.2,
  },
  {
    id: '5',
    name: 'Pré-Treino Insano (300g)',
    description: 'Energia explosiva e foco para treinos intensos. Sabor Frutas Vermelhas.',
    price: 149.90,
    category: 'Pré-Treinos',
    brand: 'Dark Performance',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 40,
    reviews: [mockReviews[0]],
    rating: 4.8,
  },
  {
    id: '6',
    name: 'Omega 3 (120 caps)',
    description: 'Óleo de peixe concentrado, rico em EPA e DHA, para saúde cardiovascular e cerebral.',
    price: 89.90,
    category: 'Vitaminas',
    brand: 'Dark Vitality',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 60,
    rating: 4.6,
  },
];

export const mockCategories: Category[] = [
  { id: 'catComboOffers', name: 'COMBO E OFERTAS', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'cat1', name: 'Proteínas', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'cat2', name: 'Aminoácidos', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'cat3', name: 'Vitaminas', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'cat4', name: 'Pré-Treinos', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'cat5', name: 'Acessórios', imageUrl: 'https://placehold.co/800x400.png' },
];

export const mockPromotions: Promotion[] = [
  {
    id: 'promo1',
    title: 'Combo Ganho de Massa!',
    description: 'Leve Whey + Creatina com 20% de desconto!',
    imageUrl: 'https://placehold.co/1200x400.png',
    link: '/products?category=Proteínas',
  },
  {
    id: 'promo2',
    title: 'Frete Grátis Acima de R$199',
    description: 'Aproveite o frete grátis para todo o Brasil.',
    imageUrl: 'https://placehold.co/1200x400.png',
    link: '/products',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'order1',
    userId: 'user123',
    items: [
      { ...mockProducts[0], quantity: 1 },
      { ...mockProducts[1], quantity: 2 },
    ],
    totalAmount: (mockProducts[0].price * 1) + (mockProducts[1].price * 2),
    orderDate: '2024-07-01',
    status: 'Delivered',
  },
  {
    id: 'order2',
    userId: 'user456',
    items: [{ ...mockProducts[4], quantity: 1 }],
    totalAmount: mockProducts[4].price * 1,
    orderDate: '2024-07-10',
    status: 'Shipped',
  },
  {
    id: 'order3',
    userId: 'user789',
    items: [
      { ...mockProducts[2], quantity: 1 },
      { ...mockProducts[5], quantity: 1 },
    ],
    totalAmount: mockProducts[2].price + mockProducts[5].price,
    orderDate: '2024-07-15',
    status: 'Pending',
  },
];
