import ProductsService from '../services/products.service';
import { CartOrder } from '../interfaces/dataModel';
import { Request, Response } from 'express';


export class Controller {

  calculate(req: Request, res: Response): void {

    let cartOrder : CartOrder = req.body.cartOrder;

    ProductsService.calculate(cartOrder).then((quote) => {
      if(cartOrder.cartItemsList.length === quote.missingProducts.length){
        // Not a single ordered product was known.
       return res.status(404).json({
          success : false,
          message : `The products you asked for are not in our catalog.`
        }).end();
      };
      if(cartOrder.cartItemsList.length === quote.quoteItemsList.length){
        // All the ordered product have been resolved.
        delete quote.missingProducts; // We don't need to create confusion on Front End side.
        return res.status(200).json(quote).end();
      };
      // Not all the products were resolved but some did.
      return res.status(206).json(quote).end();
    });

  }
  
}
export default new Controller();
