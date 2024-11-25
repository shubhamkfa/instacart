// cypress/support/utils.js

export const calculateTotalAmount = (price, quantity) => {
    return parseFloat(price.replace(/[^0-9.-]+/g, "")) * parseInt(quantity);
  };
  
  export const verifyTotalPrice = (expectedTotal, actualTotal) => {
    expect(actualTotal).to.be.closeTo(expectedTotal, 1);
  };
  