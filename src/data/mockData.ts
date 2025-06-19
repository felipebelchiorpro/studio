
import type { Product, Category, Promotion, Order, Review, DropdownCategory, PackingOrder, PackingOrderItem } from '@/types';

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
    originalPrice: 159.90, 
    category: 'GANHO DE MASSA', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 50,
    barcode: 'WHEYCONC1KG',
    reviews: [mockReviews[0], mockReviews[1]],
    rating: 4.5,
    salesCount: 125,
    isNewRelease: false,
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
    barcode: 'CREATINA300G',
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
    barcode: 'MULTIVIT90CAP',
    rating: 4.0,
    salesCount: 80,
    isNewRelease: false,
  },
  {
    id: '4',
    name: 'BCAA 2:1:1 (200g)',
    description: 'Aminoácidos de cadeia ramificada para recuperação muscular. Sabor Limão.',
    price: 69.90,
    originalPrice: 89.90,
    category: 'DEFINIÇÃO', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 30,
    barcode: 'BCAA200GLIMAO',
    rating: 4.2,
    salesCount: 65,
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
    barcode: 'PRETREINOINSANO',
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
    barcode: 'OMEGA3120CAP',
    rating: 4.6,
    salesCount: 90,
  },
  {
    id: '7',
    name: 'Barra de Proteína (Caixa com 12)',
    description: 'Lanche proteico prático e delicioso para qualquer hora do dia. Sabor Chocolate.',
    price: 99.90,
    originalPrice: 119.90, 
    category: 'Proteínas', 
    brand: 'Dark Nutrition',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 25,
    barcode: 'BARRAPROT12CHOC',
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
    barcode: 'GLUTAMINA300G',
    rating: 4.7,
    isNewRelease: true,
    salesCount: 110,
  },
  {
    id: '9',
    name: 'Termogênico Fire Up (60 caps)',
    description: 'Acelere seu metabolismo e queime mais gordura. Fórmula potente.',
    price: 119.90,
    category: 'EMAGRECIMENTO',
    brand: 'Dark Performance',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 20,
    barcode: 'TERMOGENICO60CAP',
    rating: 4.4,
    salesCount: 60,
  },
  {
    id: '10',
    name: 'Albumina Pura (500g)',
    description: 'Proteína de clara de ovo de alta biodisponibilidade. Ideal para intolerantes à lactose.',
    price: 65.00,
    category: 'Proteínas',
    brand: 'Dark Vitality',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 45,
    barcode: 'ALBUMINA500G',
    rating: 4.1,
    salesCount: 50,
    isNewRelease: false,
  },
  {
    id: '11',
    name: 'Cafeína Anidra (60 caps)',
    description: 'Máxima concentração de cafeína para energia e foco. 420mg por cápsula.',
    price: 45.90,
    originalPrice: 55.00,
    category: 'Pré Treino',
    brand: 'Dark Performance',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 80,
    barcode: 'CAFEINA60CAP',
    rating: 4.9,
    salesCount: 180,
    isNewRelease: true,
  },
  {
    id: '12',
    name: 'ZMA Complex (90 caps)',
    description: 'Zinco, Magnésio e Vitamina B6 para otimização hormonal e recuperação.',
    price: 72.00,
    category: 'Vitaminas e Saude',
    brand: 'Dark Vitality',
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 55,
    barcode: 'ZMA90CAP',
    rating: 4.5,
    salesCount: 70,
  },
];

export const mockCategories: Category[] = [
  { id: 'catEndurance', name: 'ENDURANCE', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 8500.00 },
  { id: 'catGanhoMassa', name: 'GANHO DE MASSA', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 12300.50 },
  { id: 'catEmagrecimento', name: 'EMAGRECIMENTO', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 6750.20 },
  { id: 'catDefinicao', name: 'DEFINIÇÃO', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 4800.00 },
  { id: 'catSaude', name: 'SAÚDE', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 3200.75 },
  { id: 'catComboOffers', name: 'COMBO E OFERTAS', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 9500.00 },
  { id: 'catLojasFisicas', name: 'LOJAS FÍSICAS', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 1500.00 }, 
  { id: 'catAtacado', name: 'ATACADO', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 20000.00 }, 
  { id: 'catPreTreino', name: 'Pré Treino', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 7800.00 },
  { id: 'catVitaminasSaude', name: 'Vitaminas e Saude', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 5100.00 },
  { id: 'catProteinas', name: 'Proteínas', imageUrl: 'https://placehold.co/800x400.png', totalRevenue: 10500.00 },
];

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
    id: 'order-dk001-alpha',
    userId: 'alex-santos-01',
    items: [
      { ...mockProducts[0], quantity: 1, originalPrice: mockProducts[0].originalPrice },
      { ...mockProducts[1], quantity: 2, originalPrice: mockProducts[1].originalPrice },
    ],
    totalAmount: (mockProducts[0].price * 1) + (mockProducts[1].price * 2),
    orderDate: '2024-07-21',
    status: 'Delivered',
    channel: 'Loja Online',
  },
  {
    id: 'order-dk002-beta',
    userId: 'bruna-costa-07',
    items: [{ ...mockProducts[4], quantity: 1, originalPrice: mockProducts[4].originalPrice }],
    totalAmount: mockProducts[4].price * 1,
    orderDate: '2024-07-20',
    status: 'Shipped',
    channel: 'Instagram',
  },
  {
    id: 'order-dk003-gamma',
    userId: 'carlos-lima-15',
    items: [
      { ...mockProducts[2], quantity: 1 }, 
      { ...mockProducts[5], quantity: 1 }, 
    ],
    totalAmount: mockProducts[2].price + mockProducts[5].price,
    orderDate: '2024-07-19',
    status: 'Pending',
    channel: 'Loja Online',
  },
  {
    id: 'order-dk004-delta',
    userId: 'daniela-fernandes-22',
    items: [
      { ...mockProducts[0], quantity: 2, originalPrice: mockProducts[0].originalPrice },
      { ...mockProducts[8], quantity: 1, originalPrice: mockProducts[8].originalPrice },
    ],
    totalAmount: (mockProducts[0].price * 2) + mockProducts[8].price,
    orderDate: '2024-07-18',
    status: 'Delivered',
    channel: 'Loja Física',
  },
   {
    id: 'order-dk005-epsilon',
    userId: 'eduardo-moraes-30',
    items: [
      { ...mockProducts[1], quantity: 1, originalPrice: mockProducts[1].originalPrice },
      { ...mockProducts[4], quantity: 1, originalPrice: mockProducts[4].originalPrice },
    ],
    totalAmount: mockProducts[1].price + mockProducts[4].price,
    orderDate: '2024-07-17',
    status: 'Cancelled',
    channel: 'Loja Online',
  },
  {
    id: 'order-dk006-zeta',
    userId: 'fernanda-abreu-11',
    items: [
      { ...mockProducts[6], quantity: 1, originalPrice: mockProducts[6].originalPrice },
      { ...mockProducts[7], quantity: 1, originalPrice: mockProducts[7].originalPrice },
    ],
    totalAmount: mockProducts[6].price + mockProducts[7].price,
    orderDate: '2024-07-16',
    status: 'Shipped',
    channel: 'Loja Online',
  },
  {
    id: 'order-dk007-eta',
    userId: 'gabriel-rocha-03',
    items: [
      { ...mockProducts[9], quantity: 3, originalPrice: mockProducts[9].originalPrice },
    ],
    totalAmount: mockProducts[9].price * 3,
    orderDate: '2024-07-15',
    status: 'Pending',
    channel: 'Instagram',
  },
  {
    id: 'order-dk008-theta',
    userId: 'helena-vasques-09',
    items: [
      { ...mockProducts[10], quantity: 1, originalPrice: mockProducts[10].originalPrice },
      { ...mockProducts[11], quantity: 1, originalPrice: mockProducts[11].originalPrice },
    ],
    totalAmount: mockProducts[10].price + mockProducts[11].price,
    orderDate: '2024-07-14',
    status: 'Delivered',
    channel: 'Loja Física',
  },
  {
    id: 'order-dk009-iota',
    userId: 'igor-nogueira-27',
    items: [
      { ...mockProducts[3], quantity: 2, originalPrice: mockProducts[3].originalPrice },
    ],
    totalAmount: mockProducts[3].price * 2,
    orderDate: '2024-07-13',
    status: 'Cancelled',
    channel: 'Loja Online',
  },
  {
    id: 'order-dk010-kappa',
    userId: 'julia-menezes-19',
    items: [
      { ...mockProducts[0], quantity: 1, originalPrice: mockProducts[0].originalPrice },
      { ...mockProducts[2], quantity: 1, originalPrice: mockProducts[2].originalPrice },
      { ...mockProducts[5], quantity: 1, originalPrice: mockProducts[5].originalPrice },
    ],
    totalAmount: mockProducts[0].price + mockProducts[2].price + mockProducts[5].price,
    orderDate: '2024-07-12',
    status: 'Shipped',
    channel: 'Loja Online',
  },
  {
    id: 'order-dk011-lambda',
    userId: 'lucas-almeida-05',
    items: [
      { ...mockProducts[1], quantity: 5, originalPrice: mockProducts[1].originalPrice },
    ],
    totalAmount: mockProducts[1].price * 5,
    orderDate: '2024-07-11',
    status: 'Pending',
    channel: 'Instagram',
  },
  {
    id: 'order-dk012-mu',
    userId: 'marcela-gomes-12',
    items: [
      { ...mockProducts[8], quantity: 2, originalPrice: mockProducts[8].originalPrice },
    ],
    totalAmount: mockProducts[8].price * 2,
    orderDate: '2024-07-10',
    status: 'Delivered',
    channel: 'Loja Física',
  }
];

export const mockDashboardMetrics = {
  totalSessions: 7530,
  newCustomers: 65,
  returningCustomers: mockOrders.map(o => o.userId).filter((v, i, a) => a.indexOf(v) === i).length - 65 > 0 
                      ? mockOrders.map(o => o.userId).filter((v, i, a) => a.indexOf(v) === i).length - 65 
                      : 30, 
  funnelData: [
    { name: 'Visitantes', value: 7530 },
    { name: 'Visualizaram Produto', value: 4200 },
    { name: 'Adicionaram ao Carrinho', value: 980 },
    { name: 'Finalizaram Compra', value: mockOrders.length },
  ],
};


// Mock data for Packing Station
export const mockPackingOrders: PackingOrder[] = [
  {
    orderId: 'PACK-ORD-001', // This is what the user "scans"
    customerName: 'João Silva',
    items: [
      { productId: '1', name: mockProducts[0].name, barcode: mockProducts[0].barcode!, imageUrl: mockProducts[0].imageUrl, expectedQuantity: 2, packedQuantity: 0, sku: mockProducts[0].id },
      { productId: '2', name: mockProducts[1].name, barcode: mockProducts[1].barcode!, imageUrl: mockProducts[1].imageUrl, expectedQuantity: 1, packedQuantity: 0, sku: mockProducts[1].id },
    ],
    targetWeight: 2.3, // kg
  },
  {
    orderId: 'PACK-ORD-002',
    customerName: 'Maria Oliveira',
    items: [
      { productId: '5', name: mockProducts[4].name, barcode: mockProducts[4].barcode!, imageUrl: mockProducts[4].imageUrl, expectedQuantity: 1, packedQuantity: 0, sku: mockProducts[4].id },
      { productId: '3', name: mockProducts[2].name, barcode: mockProducts[2].barcode!, imageUrl: mockProducts[2].imageUrl, expectedQuantity: 1, packedQuantity: 0, sku: mockProducts[2].id },
    ],
    targetWeight: 0.4, // kg
  },
  {
    orderId: 'PACK-ORD-003',
    customerName: 'Carlos Pereira',
    items: [
      { productId: '7', name: mockProducts[6].name, barcode: mockProducts[6].barcode!, imageUrl: mockProducts[6].imageUrl, expectedQuantity: 1, packedQuantity: 0, sku: mockProducts[6].id },
    ],
  }
];

// Used for BI Dashboard's category filter
export const biDashboardCategories = mockCategories.map(c => ({id: c.id, name: c.name}));

// Used for BI Dashboard's sales channel filter
export const biDashboardSalesChannels = [
  {id: "online", name: "Loja Online"},
  {id: "physical", name: "Loja Física"},
  {id: "instagram", name: "Instagram"},
  {id: "whatsapp", name: "WhatsApp"},
  {id: "marketplace", name: "Marketplace"},
];

// Used for BI Dashboard's geo filter (States)
export const biDashboardStates = [
    { id: "AC", name: "Acre" }, { id: "AL", name: "Alagoas" }, { id: "AP", name: "Amapá" }, 
    { id: "AM", name: "Amazonas" }, { id: "BA", name: "Bahia" }, { id: "CE", name: "Ceará" },
    { id: "DF", name: "Distrito Federal" }, { id: "ES", name: "Espírito Santo" }, { id: "GO", name: "Goiás" },
    { id: "MA", name: "Maranhão" }, { id: "MT", name: "Mato Grosso" }, { id: "MS", name: "Mato Grosso do Sul" },
    { id: "MG", name: "Minas Gerais" }, { id: "PA", name: "Pará" }, { id: "PB", name: "Paraíba" },
    { id: "PR", name: "Paraná" }, { id: "PE", name: "Pernambuco" }, { id: "PI", name: "Piauí" },
    { id: "RJ", name: "Rio de Janeiro" }, { id: "RN", name: "Rio Grande do Norte" }, { id: "RS", name: "Rio Grande do Sul" },
    { id: "RO", name: "Rondônia" }, { id: "RR", name: "Roraima" }, { id: "SC", name: "Santa Catarina" },
    { id: "SP", name: "São Paulo" }, { id: "SE", name: "Sergipe" }, { id: "TO", name: "Tocantins" }
];

