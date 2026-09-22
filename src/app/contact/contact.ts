export interface ContactMessagePayload {
  subject: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  order_id: string;
  message: string;
}

export interface ContactMessage extends ContactMessagePayload {
  id: number;
  date: string;
}
