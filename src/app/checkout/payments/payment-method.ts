export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Pay with Cash',
    description: 'You will pay in cash when your order arrives at shipping.'
  }
];
