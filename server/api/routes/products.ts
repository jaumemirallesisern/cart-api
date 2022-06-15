import express from 'express';
import productController from '../controllers/products';
import { validateUser, authorizeUser } from '../middlewares/access';
const router = express.Router();

router.route('/')
  .post(
    validateUser, // It could be a good place for identifying this user.
    authorizeUser, // It could be a good place for setting access rules (roles?...)
    productController.create
    )
  .get(
    // I guess it can remain accessible for any visitor by now.
    productController.all
    )

router.route('/:id')
  .get(
    // I guess it can remain accessible for any visitor by now.
    productController.byId
    );

export default router;
