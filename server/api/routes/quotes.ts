import express from 'express';
import quoteController from '../controllers/quotes';
import { validateUser, authorizeUser } from '../middlewares/access';
import { checkCartFormat } from '../middlewares/integrity';
const router = express.Router();

router.route('/')

  // Why POST?
  // At first, it seems a query but is not a filtering/fecthing action in the moment we provide 
  // quantities, so GET is not the option. We need to carry information as input to build the Resource.
  // PUT or PATCH are not the option too as we are not modifying a previous instance,
  // it may happen if the system evolves though.
  // Let me use "calculate" although we "create" the resource.

  // Open-api middleware will do its job then only properly formatted cart lists will reach controller.
  // Let's keep a middleware for extra checks beyond opena-pi

  .post(
    validateUser, // It could be a good place for identifying this user.
    authorizeUser, // It could be a good place for setting access rules (roles?...)
    checkCartFormat, 
    quoteController.calculate
  )

router.route('/apply-offers')

  .post(
    validateUser, // It could be a good place for identifying this user.
    authorizeUser, // It could be a good place for setting access rules (roles?...)
    checkCartFormat, 
    quoteController.calculateWithOffers
  )

export default router;
