import Stripe from 'stripe';

export const customerToId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | undefined,
) => {
  return customer
    ? typeof customer !== 'string' && 'id' in customer
      ? customer.id
      : customer
    : null;
};
