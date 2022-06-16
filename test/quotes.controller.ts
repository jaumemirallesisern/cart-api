import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';

describe('Quotes', () => {

  it('should make a quote', () =>
    request(Server)
      .post('/api/v1/quotes')
      .send({ cartOrder: { cartItemsList: [{ id: 1, qty: 5}, { id: 2, qty: 5}] } })
      .expect('Content-Type', /json/)
      .then(r => {
        expect(r.body)
          .to.be.an('object')
          .that.has.property('quoteItemsList')
        expect(r.body.quoteItemsList)
          .to.be.an('array')
        expect(r.body)
          .to.be.an('object')
          .that.has.property('totalPrice')
          .equal(14.299999999999999);
        expect(r.body)
          .to.be.an('object')
          .that.has.property('formattedTotalPrice')
          .equal("14.30$");
      }));

  it('should make a quote with offers applied', () =>
      request(Server)
        .post('/api/v1/quotes/apply-offers')
        .send({ cartOrder: { cartItemsList: [{ id: 1, qty: 5}, { id: 2, qty: 5}] } })
        .expect('Content-Type', /json/)
        .then(r => {
          expect(r.body)
            .to.be.an('object')
            .that.has.property('quoteItemsList')
          expect(r.body.quoteItemsList)
            .to.be.an('array')
          expect(r.body)
            .to.be.an('object')
            .that.has.property('quoteItemsListAfter')
          expect(r.body.quoteItemsListAfter)
            .to.be.an('array')
          expect(r.body)
            .to.be.an('object')
            .that.has.property('totalPrice')
            .equal(14.299999999999999);
          expect(r.body)
            .to.be.an('object')
            .that.has.property('formattedTotalPrice')
            .equal("14.30$");
          expect(r.body)
            .to.be.an('object')
            .that.has.property('totalPriceAfter')
            .equal(14.299999999999999);
          expect(r.body)
            .to.be.an('object')
            .that.has.property('formattedTotalPriceAfter')
            .equal("14.30$");
          expect(r.body)
            .to.be.an('object')
            .that.has.property('pitch')
            .equal(" You get extra products like: 3 of Soup!!");
        }));

  
});
