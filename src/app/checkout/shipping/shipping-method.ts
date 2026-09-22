export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'local_transport',
    name: 'Local Transport',
    description: 'Will arrive with local transport at your address.',
    price: 10
  },
  {
    id: 'take_from_store',
    name: 'Take from Store',
    description: 'You take the products from the store by yourself.',
    price: 0
  }
];
