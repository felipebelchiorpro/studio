
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
    originalPrice: 166.54,
    category: 'GANHO DE MASSA', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 50,
    reviews: [mockReviews[0], mockReviews[1]],
    rating: 4.5,
    salesCount: 125,
  },
  {
    id: '2',
    name: 'Creatina Monohidratada (300g)',
    description: 'Aumente sua força e performance nos treinos com nossa creatina pura.',
    price: 79.90,
    originalPrice: 102.44,
    category: 'ENDURANCE', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 100,
    reviews: [mockReviews[2]],
    rating: 5,
    isNewRelease: true,
    salesCount: 210,
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
    salesCount: 80,
  },
  {
    id: '4',
    name: 'BCAA 2:1:1 (200g)',
    description: 'Aminoácidos de cadeia ramificada para recuperação muscular. Sabor Limão.',
    price: 69.90,
    originalPrice: 93.20,
    category: 'DEFINIÇÃO', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 30,
    rating: 4.2,
    salesCount: 65,
  },
  {
    id: '5',
    name: 'Pré-Treino Insano (300g)',
    description: 'Energia explosiva e foco para treinos intensos. Sabor Frutas Vermelhas.',
    price: 149.90,
    originalPrice: 170.34,
    category: 'Pré Treino', 
    brand: 'Dark Performance',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 40,
    reviews: [mockReviews[0]],
    rating: 4.8,
    isNewRelease: true,
    salesCount: 150,
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
    salesCount: 90,
  },
  {
    id: '7',
    name: 'Barra de Proteína (Caixa com 12)',
    description: 'Lanche proteico prático e delicioso para qualquer hora do dia. Sabor Chocolate.',
    price: 99.90,
    originalPrice: 110.00,
    category: 'Proteínas', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 25,
    rating: 4.3,
    salesCount: 75,
  },
  {
    id: '8',
    name: 'Glutamina Micronizada (300g)',
    description: 'Suporte para o sistema imunológico e recuperação muscular. Sem sabor.',
    price: 95.50,
    category: 'GANHO DE MASSA',
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 35,
    rating: 4.7,
    isNewRelease: true,
    salesCount: 110,
  },
  {
    id: '9',
    name: 'Termogênico Fire Up (60 caps)',
    description: 'Acelere seu metabolismo e queime mais gordura. Fórmula potente.',
    price: 119.90,
    originalPrice: 140.00,
    category: 'EMAGRECIMENTO',
    brand: 'Dark Performance',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 20,
    rating: 4.4,
    salesCount: 60,
  },
];

// For the horizontal top bar
export const mockCategories: Category[] = [
  { id: 'catEndurance', name: 'ENDURANCE', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 8500.00 },
  { id: 'catGanhoMassa', name: 'GANHO DE MASSA', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 12300.50 },
  { id: 'catEmagrecimento', name: 'EMAGRECIMENTO', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 6750.20 },
  { id: 'catDefinicao', name: 'DEFINIÇÃO', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 4800.00 },
  { id: 'catSaude', name: 'SAÚDE', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 3200.75 },
  { id: 'catComboOffers', name: 'COMBO E OFERTAS', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 9500.00 },
  { id: 'catLojasFisicas', name: 'LOJAS FÍSICAS', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 1500.00 }, // Placeholder revenue
  { id: 'catAtacado', name: 'ATACADO', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 20000.00 }, // Placeholder revenue
  { id: 'catPreTreino', name: 'Pré Treino', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 7800.00 },
  { id: 'catVitaminasSaude', name: 'Vitaminas e Saude', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 5100.00 },
  { id: 'catProteinas', name: 'Proteínas', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 10500.00 },
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
      { ...mockProducts[0], quantity: 1, originalPrice: mockProducts[0].originalPrice },
      { ...mockProducts[1], quantity: 2, originalPrice: mockProducts[1].originalPrice },
    ],
    totalAmount: (mockProducts[0].price * 1) + (mockProducts[1].price * 2),
    orderDate: '2024-07-01',
    status: 'Delivered',
  },
  {
    id: 'order2',
    userId: 'user456',
    items: [{ ...mockProducts[4], quantity: 1, originalPrice: mockProducts[4].originalPrice }],
    totalAmount: mockProducts[4].price * 1,
    orderDate: '2024-07-10',
    status: 'Shipped',
  },
  {
    id: 'order3',
    userId: 'user789',
    items: [
      { ...mockProducts[2], quantity: 1 }, // No originalPrice
      { ...mockProducts[5], quantity: 1 }, // No originalPrice
    ],
    totalAmount: mockProducts[2].price + mockProducts[5].price,
    orderDate: '2024-07-15',
    status: 'Pending',
  },
  {
    id: 'order4',
    userId: 'user101',
    items: [
      { ...mockProducts[0], quantity: 2, originalPrice: mockProducts[0].originalPrice },
      { ...mockProducts[8], quantity: 1, originalPrice: mockProducts[8].originalPrice },
    ],
    totalAmount: (mockProducts[0].price * 2) + mockProducts[8].price,
    orderDate: '2024-06-20',
    status: 'Delivered',
  },
   {
    id: 'order5',
    userId: 'user102',
    items: [
      { ...mockProducts[1], quantity: 1, originalPrice: mockProducts[1].originalPrice },
      { ...mockProducts[4], quantity: 1, originalPrice: mockProducts[4].originalPrice },
    ],
    totalAmount: mockProducts[1].price + mockProducts[4].price,
    orderDate: '2024-06-15',
    status: 'Cancelled',
  },
];


export const mockDashboardMetrics = {
  totalSessions: 7530,
  newCustomers: 65,
  returningCustomers: mockOrders.map(o => o.userId).filter((v, i, a) => a.indexOf(v) === i).length - 65 > 0 
                      ? mockOrders.map(o => o.userId).filter((v, i, a) => a.indexOf(v) === i).length - 65 
                      : 30, // ensure returning is not negative if newCustomers > uniqueUserIds
  funnelData: [
    { name: 'Visitantes', value: 7530 },
    { name: 'Visualizaram Produto', value: 4200 },
    { name: 'Adicionaram ao Carrinho', value: 980 },
    { name: 'Finalizaram Compra', value: mockOrders.length },
  ],
};
