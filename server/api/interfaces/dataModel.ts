export interface CartItem {
    id: number;
    qty: number;
}

export interface CartOrder {
    cartItemsList: CartItem[];
    // A CartOrder will have more fields than only 'cartItemsList' in a froseeable development.
};

export interface QuoteItem {
    idProduct: number;
    name: string;
    quantity: number;
    unitPrice: number; // It's handy for BE & FE to keep both formats.
    formattedUnitPrice : string;
    itemPrice: number; // It's handy for BE & FE to keep both formats.
    formattedItemPrice : string;
}

export interface Offer {
    id: number;
    title: string;
    description: string;
}

export interface QuoteItemWithOffer extends QuoteItem {
    extraQuantity: number;
    appliedOffer: Offer;
}

export interface Quote {
    quoteItemsList: QuoteItem[];
    totalPrice: number;
    formattedTotalPrice: string;
    missingProducts: QuoteItem[];
}

export interface QuoteWithOffers extends Quote {
    quoteItemsListAfter: QuoteItemWithOffer[];
    totalPriceAfter: number;
    formattedTotalPriceAfter: string;
    pitch: string;
}

export interface Product {
    id: number;
    name: string;
    customerPrice: number;
    cost: number;
}