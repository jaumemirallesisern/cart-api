import L from '../../common/logger';
import { CartOrder, Product, Quote, QuoteItemWithOffer, QuoteWithOffers } from '../interfaces/dataModel';
import offers from '../../../bl/offers';
import moment from 'moment';


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
    L.info(`Calculating a quote without offer for a list of ${cartOrder.cartItemsList.length} products.`);

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
          idProduct : products[productIndex].id, // I'm adding it for the secondary feature.
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

  calculateWithOffers(quote: Quote): Promise<QuoteWithOffers> {

    let quoteWithOffers : QuoteWithOffers = {
      quoteItemsList: quote.quoteItemsList,
      quoteItemsListAfter: [],
      missingProducts: quote.missingProducts,
      totalPrice: quote.totalPrice,
      formattedTotalPrice: quote.formattedTotalPrice,
      totalPriceAfter: 0,
      formattedTotalPriceAfter: '',
      pitch: ''
    };    

    let appliedOffersSoFar = []; // Just register to check offer conflicts.

    // Using a for loop to ensure it's executed sequentially.
    for(let i=0; i<offers.length ;i++){
      let offer = offers[i];
      L.info(`Evaluate offer ${offer.title}.`);      
      // There are two main criteria to check if it applies: 
      // The day and the fact that targets are present.
      // Check if offer applies by day
      let appliesByDay = true;
      if(offer.dayOfTheWeek){
        const todayInWeek = moment().day();
        appliesByDay = offer.dayOfTheWeek.includes(todayInWeek);
      };
      if(!appliesByDay){
        L.info(`This is not the day of the week for this offer.`); 
        continue;
      };    
      // Check if offer applies by target, and how many times by target.
      const timesOrdered = offer.target_and
        // How many items have been ordered for target product
        .map( target => {
          const targetIndex = quote.quoteItemsList.findIndex( item => item.idProduct === target.id );
          const timesCanBeAppliedByProduct = targetIndex > -1 ? Math.floor(quote.quoteItemsList[targetIndex].quantity/target.qty) : 0;
          L.info(`Offer can be applied ${timesCanBeAppliedByProduct} times by means of product id=${target.id}`);
          return timesCanBeAppliedByProduct;
        });
      // Now find the minimum case that will define the times the offer can be applied.
      const timesCanBeApplied = Math.min(...timesOrdered);
      L.info(`Offer can be applied ${timesCanBeApplied} times.`);
      if(timesCanBeApplied === 0){
        L.info(`Offer can't be applied to this list.`);
        continue;
      };
      // Check if offer is blocked by another offer.
      let offerIsBlocked = false;
      if(offer.blockingOffers){
        offerIsBlocked = offer.blockingOffers.some( e1 => appliedOffersSoFar.some( e2 => e1 === e2));
      };      
      if(offerIsBlocked){
        L.info(`Offer is blocked by another offer.`);
        continue;
      };
      // Calculate extra products rewarded
      if(offer.extra){
        offer.extra.forEach( e => {
          const productIndex = products.findIndex( p => p.id === e.id);
          if(productIndex > -1){
            let extraQty = e.qty * timesCanBeApplied;
            extraQty = (extraQty > e.max) ? e.max : extraQty;
            L.info(`Extra product [${e.id}]: ${extraQty}`);
            // Set the object for the situation in which offer is applied.
            const targetIndex = quote.quoteItemsList.findIndex( item => item.idProduct === products[productIndex].id );
            let originalQty = targetIndex > -1 ? quote.quoteItemsList[targetIndex].quantity : 0; // May be extra offer but not ordered by user.
            let unitPrice = products[productIndex].customerPrice / 100;
            let formattedUnitPrice = `${unitPrice.toFixed(2)}$`;
            let itemPrice = (originalQty * products[productIndex].customerPrice) / 100;
            let formattedItemPrice = `${itemPrice.toFixed(2)}$`;
            let quoteItemWithOffer : QuoteItemWithOffer = {
              idProduct: products[productIndex].id,
              name: products[productIndex].name,
              quantity: originalQty,
              unitPrice: unitPrice,
              formattedUnitPrice : formattedUnitPrice,
              itemPrice: itemPrice,
              formattedItemPrice : formattedItemPrice,
              extraQuantity: extraQty,
              appliedOffer: {
                id: offer.id,
                title: offer.title,
                description: offer.description,
              }
            };
            quoteWithOffers.quoteItemsListAfter.push(quoteItemWithOffer);
          } else {
            L.info(`WARNING: There's a reward for product [${e.id}] but is not in catalog?`);
          };            
        });
      };
      // Calculate discounts
      if(offer.discount){
        offer.discount.forEach( e => {
          const productIndex = products.findIndex( p => p.id === e.id);
          if(productIndex > -1){
            const newUnitCost = e.onCostPrice ? ((100 - e.disc) / 100) * products[productIndex].cost : ((100 - e.disc) / 100) * products[productIndex].customerPrice;
            L.info(`Discount for product [${e.id}]: from ${products[productIndex].customerPrice} to ${newUnitCost}`);
            // Set the object for the situation in which offer is applied.
            const targetIndex = quote.quoteItemsList.findIndex( item => item.idProduct === products[productIndex].id );
            let originalQty = targetIndex > -1 ? quote.quoteItemsList[targetIndex].quantity : 0; // May be extra offer but not ordered by user.
            let unitPrice = newUnitCost / 100;
            let formattedUnitPrice = `${unitPrice.toFixed(2)}$`;
            let itemPrice = (originalQty * newUnitCost) / 100;
            let formattedItemPrice = `${itemPrice.toFixed(2)}$`;
            let quoteItemWithOffer : QuoteItemWithOffer = {
              idProduct: products[productIndex].id,
              name: products[productIndex].name,
              quantity: originalQty,
              unitPrice: unitPrice,
              formattedUnitPrice : formattedUnitPrice,
              itemPrice: itemPrice,
              formattedItemPrice : formattedItemPrice,
              extraQuantity: 0,
              appliedOffer: {
                id: offer.id,
                title: offer.title,
                description: offer.description,
              }
            };
            quoteWithOffers.quoteItemsListAfter.push(quoteItemWithOffer);
          } else {
            L.info(`WARNING: There's a discount for product [${e.id}] but is not in catalog?`);
          };
        });
      };
      appliedOffersSoFar.push(offer.id);
    };
    // Now it's time to calculate totals.
    // We will make it differential: From original total, will substract those cases where an offer
    // has been applied and it's about a discount.
    const appliedDiscounts = quoteWithOffers.quoteItemsListAfter
      .filter( qi => qi.extraQuantity === 0 );
    const totalAmount = quoteWithOffers.quoteItemsList
      .reduce( (acc, value) => {
        const discountIndex = appliedDiscounts.findIndex( qi => qi.idProduct === value.idProduct);
        // take the amount from discount if applied or original case if not
        return( discountIndex > -1 ? acc + appliedDiscounts[discountIndex].itemPrice : acc + value.itemPrice);
      }, 0);
    // Then we can set the benefits
    quoteWithOffers.totalPriceAfter = totalAmount;
    quoteWithOffers.formattedTotalPriceAfter = `${totalAmount.toFixed(2)}$`;
    // Trust me, UX guy will ask for this sooner or later :)
    const saved = quoteWithOffers.totalPrice - quoteWithOffers.totalPriceAfter;
    let extras = [];
    const appliedExtras = quoteWithOffers.quoteItemsListAfter
      .filter( qi => qi.extraQuantity > 0 )
      .forEach( qi => extras.push(`${qi.extraQuantity} of ${qi.name}`));
    let strExtras = extras.join(', ');
    let i = strExtras.lastIndexOf(',');
    strExtras = i > -1 ? `${strExtras.substring(0,i)} and${strExtras.substring(i+1)}` : strExtras.substring(i+1);
    let strExtrasLong = extras.length > 0 ? ` ${saved > 0 ? `And you also get `:`You get `}extra products like: ${strExtras}!!` : ``;
    quoteWithOffers.pitch = `${saved > 0 ? `You saved ${saved.toFixed(2)}$ !!`:``}${strExtrasLong}`; 
    return Promise.resolve(quoteWithOffers);
  }

}

export default new ProductsService();
