import { Request, Response, NextFunction } from 'express';
import errorHandler from './error.handler';

export const checkCartFormat = async (req : Request, res : Response, next : NextFunction) => {

    // Do some extra checks like, for instance, that we don't have an empty list:
    if(req.body.cartOrder.cartItemsList.length === 0){
        return res.status(400).json({
            status : 400, 
            message : `Bad request. Your list should not be empty.`
        }).end();
    };

    next();

};