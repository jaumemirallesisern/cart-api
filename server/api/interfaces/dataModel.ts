export interface CartItem {
    id: number;
    qty: number;
}

export interface CartOrder {
    cartItemsList: CartItem[];
    // A CartOrder will have more fields than only 'cartItemsList' in a froseeable development.
};

export interface QuoteItem {
    name: string;
    quantity: number;
    unitPrice: number; // It's handy for BE & FE to keep both formats.
    formattedUnitPrice : string;
    itemPrice: number; // It's handy for BE & FE to keep both formats.
    formattedItemPrice : string;
}

export interface Quote {
    quoteItemsList: QuoteItem[];
    totalPrice: number;
    formattedTotalPrice: string;
    missingProducts: QuoteItem[];
}

export interface Product {
    id: number;
    name: string;
    customerPrice: number;
    cost: number;
}