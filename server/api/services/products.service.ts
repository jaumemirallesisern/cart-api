import L from '../../common/logger';
import { CartOrder, Product, Quote } from '../interfaces/dataModel';


// Where are the interfaces?
// As we are proposing a data model and interfaces are being required from different scripts,
// Seems more scalable and a better practice to have a unique version and separate logic from code
// Find it at: '../interfaces/dataModel'

let id = 1;
const products: Product[] = [
  { id: id++, name: 'Soup', customerPrice: 199, cost: 186 },
  { id: id++, name: 'Bread', customerPrice: 87, cost: 21 },
  { id: id++, name: 'Cheese', customerPrice: 275, cost: 234 },
  { id: id++, name: 'Milk', customerPrice: 67, cost: 61 },
];

// (*) See comments on line 117
// let idQuote = 1;
// const quotes: Quote[] = [];

export class ProductsService {

  all(): Promise<Product[]> {
    L.info(products, 'fetch all products');
    return Promise.resolve(products);
  }

  /*byId(id: number): Promise<Product> {
    L.info(`fetch product with id ${id}`);
    return this.all().then((r) => r[id - 1]);
  }*/

  // Might be a bit more efficient and clear in logs.
  byId(id: number): Promise<Product> {
    L.info(`fetch product with id ${id}`);
    return Promise.resolve(products[id - 1]);
  }

  create(name: string, customerPrice: number, cost: number): Promise<Product> {
    L.info(`create product with name ${name}`);
    const product: Product = {
      id: id++,
      name,
      customerPrice,
      cost,
    };
    products.push(product);
    return Promise.resolve(product);
  }

  calculate(cartOrder: CartOrder): Promise<Quote> {
    L.info(`Calculating a quote for ${cartOrder.cartItemsList.length} in list`);

    let quoteItemsList = cartOrder.cartItemsList
      .filter( order => products.some( product => product.id === order.id) )
      .map( order => { 
        let productIndex = products.findIndex( product => product.id === order.id);     
        // Price in DB is in cents. We assume it's dollar cents.
        // In order to support all currencies there could be an array map, but it's not the case now.
        let unitPrice = products[productIndex].customerPrice / 100;
        let formattedUnitPrice = `${unitPrice.toFixed(2)}$`;
        let itemPrice = (order.qty * products[productIndex].customerPrice) / 100;
        let formattedItemPrice = `${itemPrice.toFixed(2)}$`;
        return ({
          name : products[productIndex].name,
          quantity : order.qty,
          unitPrice : unitPrice,
          formattedUnitPrice : formattedUnitPrice,
          itemPrice : itemPrice,
          formattedItemPrice : formattedItemPrice
        });
      });

    let totalPrice = quoteItemsList.reduce( (acc, value) => value.itemPrice + acc, 0);
    let formattedTotalPrice = `${totalPrice.toFixed(2)}$`;

    let missingProducts = [];
    if(quoteItemsList.length !== cartOrder.cartItemsList.length) {
      // Some ordered product is unknown. It would be nice to tell the requester.
      missingProducts
      .filter( order => !products.some( product => product.id === order.id) )
      .map( order => order.id);
    };

    let quote : Quote = {
      // id : idQuote++, (*)
      quoteItemsList,
      totalPrice,
      formattedTotalPrice,
      missingProducts
    };

    // (*)
    // We may have our bussines logic to keep quotes drafts in Back End
    // then it would be the time to store it with its id
    // quotes.push(quote);
    // and we would be offering a 201 with the new resource location in controller
    // instead of an 200/206 as we do in this simplistic scenario.

    return Promise.resolve(quote);

  }

}

export default new ProductsService();
