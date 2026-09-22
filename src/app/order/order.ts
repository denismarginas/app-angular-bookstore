import { OrderStatus } from './order-status';

export interface OrderCustomer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface OrderAddress {
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderStore {
  name: string;
  address: string;
  cui: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface OrderShipping {
  id: string;
  name: string;
  price: number;
}

export interface OrderPayment {
  id: string;
  name: string;
}

export interface Order {
  order_id: number;
  status: OrderStatus;
  date: string;
  customer: OrderCustomer;
  address: OrderAddress;
  store: OrderStore;
  items: OrderItem[];
  shipping: OrderShipping;
  payment: OrderPayment;
  order_total: number;
}

export interface PlaceOrderPayload {
  customer: OrderCustomer;
  address: OrderAddress;
  items: OrderItem[];
  shipping: OrderShipping;
  payment: OrderPayment;
}
