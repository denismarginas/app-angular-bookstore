export const ORDER_STATUSES = ['In progress', 'Shipping', 'Complete', 'Canceled', 'Returned'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
