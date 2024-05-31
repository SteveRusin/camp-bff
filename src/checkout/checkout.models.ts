export type CartAction =
  | 'AddLineItem'
  | 'RemoveLineItem'
  | 'ChangeLineItemQuantity'
  | 'SetShippingAddress';

export interface SetShippingAddress {
  city: string;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  region: string;
  streetName: string;
  streetNumber: string;
}

export interface MagentoShippingAddress {
  addressInformation: {
    shipping_method_code: string;
    shipping_carrier_code: string;
    shipping_address: {
      city: string;
      country_id: string;
      email: string;
      firstname: string;
      lastname: string;
      postcode: string;
      region: string;
      street: string[];
      telephone: string;
    };
  };
}

export interface AddLineItem {
  quantity: number;
  variantId: string;
}

export interface ChangeLineItemQuantity {
  quantity: number;
  lineItemId: string;
}

export interface RemoveLineItem {
  lineItemId: string;
  quantity: number;
}

export interface PutCartDto {
  version: number;
  action: CartAction;
  AddLineItem?: AddLineItem;
  ChangeLineItemQuantity?: ChangeLineItemQuantity;
  RemoveLineItem?: RemoveLineItem;
  SetShippingAddress?: SetShippingAddress;
}

export interface MagentoCartItem {
  qty: number;
  quote_id: string;
  sku: string;
  price?: number;
  name?: string;
  extension_attributes?: {
    image_url: string;
  };
}

export interface LineItem {
  id?: string;
  variant?: ProductVariant;
  quantity?: number;
  totalPrice?: number;
  currencyCode?: string;
}

export interface GetCartDto {
  id: string;
  customerId: string;
  lineItems: LineItem[];
  totalPrice: {
    currencyCode: string;
    centAmount: number;
  };
  totalQuantity: number;
}

export interface MagentoCart {
  id: string;
  customer: {
    id: number;
  };
  items_qty: number;
  items: MagentoCartItem[];
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  name?: string;
  slug?: string;
  images?: { url: string }[];
  prices?: { value: { currencyCode: string; centAmount: number } }[];
}
