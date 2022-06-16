import { Application } from 'express';
import productsRouter from './api/routes/products';
import quotesRouter from './api/routes/quotes';

export default function routes(app: Application): void {

  app.use('/api/v1/products', productsRouter);

  // Let's consider that we have another resource in our REST called "Quote", 
  // not just an operation on Products. It will be more scalable.
  // It might not be persistent in DB in the future but it may be.
  // A Quote is build from a list of indexed Products with its quantities, let's call it "ChartItem", 
  // coming in the request's payload, that we can call Cart-order or list.
  // It assumes Cart primary decission is hold in Front End side. It's OK in most of the cases
  // (for advanced data science and UX features it could be interesting holding it in Back End),
  // but let's keep it simple.

  // The data model could be something like this by now. 
  // Please note that I'm not specifying relational keys and inner fields 
  // as we are not dealing with real DB model.
  // Product  ---> (1:1)  --->   QuoteItem   ---> (N:1)  --->   Quote
  //          ---> (1:1)  --->   QuoteItemWithOffers   ---> (N:1)  --->   QuoteWithOffers
  //                                                   ---> (1:1)  --->   Offer
  // Product  ---> (1:1)  --->   ChartItem   ---> (N:1)  --->   ChartOrder
  // We wouldn't have many-to-many relations and the need for Join tables.
  app.use('/api/v1/quotes', quotesRouter);  

  

}
