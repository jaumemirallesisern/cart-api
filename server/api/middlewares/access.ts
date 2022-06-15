import { Request, Response, NextFunction } from 'express';


export const validateUser = async (req : Request, res : Response, next : NextFunction) => {

    // TO DO
    // I would use JWT techniques for user validations.
    // Note that it would be interesting allowing non logged used to start a cart,
    // it could help to user conversions. Users would be sent to create account if needed.
    // let receivedToken = req.headers.token;
    // (...)

    // Proceed normally to controllers layer.
    next();

};

export const authorizeUser = async (req : Request, res : Response, next : NextFunction) => {

    // TO DO

    // Proceed normally to controllers layer.
    next();

};