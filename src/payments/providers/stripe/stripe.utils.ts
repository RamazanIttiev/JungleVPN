import Stripe from 'stripe';

export const customerToId = (customer: string | Stripe.Customer | Stripe.DeletedCustomer) => {
  return typeof customer !== 'string' && 'id' in customer ? customer.id : customer;
};
