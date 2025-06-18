
import type { Product, Category, Promotion, Order, Review, DropdownCategory } from '@/types';

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
    category: 'GANHO DE MASSA', 
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
    category: 'ENDURANCE', 
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
    category: 'SAÚDE', 
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
    category: 'DEFINIÇÃO', 
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
    category: 'Pré Treino', 
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
    category: 'Vitaminas e Saude', 
    brand: 'Dark Vitality',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 60,
    rating: 4.6,
  },
  {
    id: '7',
    name: 'Barra de Proteína (Caixa com 12)',
    description: 'Lanche proteico prático e delicioso para qualquer hora do dia. Sabor Chocolate.',
    price: 99.90,
    category: 'Proteínas', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 25,
    rating: 4.3,
  },
];

// For the horizontal top bar
export const mockCategories: Category[] = [
  { id: 'catEndurance', name: 'ENDURANCE', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catGanhoMassa', name: 'GANHO DE MASSA', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catEmagrecimento', name: 'EMAGRECIMENTO', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catDefinicao', name: 'DEFINIÇÃO', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catSaude', name: 'SAÚDE', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catComboOffers', name: 'COMBO E OFERTAS', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catLojasFisicas', name: 'LOJAS FÍSICAS', imageUrl: 'https://placehold.co/800x400.png' },
  { id: 'catAtacado', name: 'ATACADO', imageUrl: 'https://placehold.co/800x400.png' },
];

// For the main "CATEGORIAS" dropdown
export const mainDropdownCategories: DropdownCategory[] = [
  { id: 'dd-proteinas', name: 'Proteínas', href: '/products?category=Proteínas' },
  { id: 'dd-creatina', name: 'Creatina', href: '/products?category=Creatina' },
  { id: 'dd-pre-treino', name: 'Pré Treino', href: '/products?category=Pré%20Treino' },
  { id: 'dd-aminoacidos', name: 'Aminoácidos', href: '/products?category=Aminoácidos' },
  { id: 'dd-vitaminas', name: 'Vitaminas e Saude', href: '/products?category=Vitaminas%20e%20Saude' },
  { id: 'dd-pasta-amendoim', name: 'Pasta de Amendoim', href: '/products?category=Pasta%20de%20Amendoim' },
  { id: 'dd-hipercalorico', name: 'Hipercalórico', href: '/products?category=Hipercalórico' },
  { id: 'dd-acessorios', name: 'Acessórios', href: '/products?category=Acessórios' },
  { id: 'dd-lancamentos', name: 'Lançamentos', href: '/products?tag=lancamentos' },
  { id: 'dd-objetivos', name: 'Objetivos', href: '/products' }, 
];


export const mockPromotions: Promotion[] = [
  {
    id: 'promo1',
    title: 'Combo Ganho de Massa!',
    description: 'Leve Whey + Creatina com 20% de desconto!',
    imageUrl: 'https://placehold.co/1200x400.png',
    link: '/products?category=GANHO%20DE%20MASSA',
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
