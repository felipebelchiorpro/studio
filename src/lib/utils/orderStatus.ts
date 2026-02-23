type OrderStatus = 'pending' | 'paid' | 'packing' | 'sent' | 'delivered' | 'cancelled' | string;

export const translateOrderStatus = (status: OrderStatus): string => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'Pendente';
        case 'paid':
            return 'Pago / Confirmado';
        case 'packing':
            return 'Embalando';
        case 'sent':
        case 'shipped':
            return 'Enviado';
        case 'delivered':
            return 'Entregue';
        case 'cancelled':
            return 'Cancelado';
        default:
            return status;
    }
};
