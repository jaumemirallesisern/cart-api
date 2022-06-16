
// I'm serring offers in a separate file in order to split logic from code.
// This structure can accept new offers.
// Perhaps new criteria will come with new offers and we should study them then.
// For instance we could need a new field like "target_or" rather than "target_and"
// to see if the buying conditions are met.

// As a general rule, ignore conditionals where property is null or missing.
// I'll leave it as null to make a bit clearer.

// Order matters. The offers that may be blocked by another offer should be at the end.

const offers = [
    {
        id : 1,
        title : `_Soup And Bread BOGOF_`,
        description : `Buy a loaf of bread and a can of soup and get another soup for free. Maximum 3 free soups per customer.`,
        // Which productsand how many should I buy  to trigger the offer (and condition here)
        target_and : [ { id : 1, qty : 1 }, { id : 2, qty : 1 } ],
        // What extra products and how many do I get
        extra : [ { id : 1, qty : 1, max : 3 } ],
        discount : null,
        dayOfTheWeek : null,
        blockingOffers : null
    },
    {
        id : 2,
        title : `_Sunday Soup Sale_`,
        description : `Buy any can of soup on a Sunday and get 10% off.`,
        target_and : [ { id : 1, qty : 1 } ],
        extra : null,
        // What are the discounts applied for each product.
        discount : [ { id : 1, disc : 10, onCostPrice : false } ],
        // Which days of week will trigger this offer?
        dayOfTheWeek : [ 0 ], // asume Sunday is 0, Monday is 1...
        blockingOffers : null
    },
    {
        id : 3,
        title : `_Dairy Delicious_`,
        description : `Buy a block of cheese and we'll let you buy as much milk as you like, at the price we pay! Offer not valid when the customer is participating in the Sunday Soup Sale.`,
        target_and : [ { id : 3, qty : 1 } ],
        extra : null,
        discount : [ { id : 4, disc : 0, onCostPrice : true } ], // 0% disc on cost price is selling at cost price.
        dayOfTheWeek : null,
        blockingOffers : [ 2 ]
    },

];

export default offers;