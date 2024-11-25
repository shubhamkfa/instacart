/// <reference types="cypress" />
import { InstacartPage } from '../../Pages/InstacartPage';
import { calculateTotalAmount, verifyTotalPrice } from '../../support/utils';

describe('Capture Details of Randomly Selected Products and Verify Exact Match in Cart', () => {
  let productDetails = [];
  let totalPriceCaptured = 0; // Initialize total price for all products added to the cart
  const instacartPage = new InstacartPage();
  
  beforeEach(() => {
    instacartPage.visit();
    instacartPage.closeExceptions();
    cy.wait(8000);
  });

  it('Should capture the product details, calculate total price per product, and verify exact match in the cart', () => {
    const numberOfProducts = 1; // Number of products to capture

    for (let i = 0; i < numberOfProducts; i++) {
      instacartPage.openProduct(i);

      let productDetail = instacartPage.getProductDetails();
      
      cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-1yfpthi"]').then(() => {
        cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-azp9o7"]')
          .invoke('text')
          .then((originalPriceText) => {
            const price = productDetail.discountPrice || productDetail.originalPrice;
            const totalAmount = calculateTotalAmount(price, 1); // Assume quantity 1 for simplicity
            productDetail.totalAmount = totalAmount;
            totalPriceCaptured += totalAmount;
            productDetails.push(productDetail);
          });
        
        instacartPage.addProductToCart(1);
        instacartPage.goBack();
      });
    }

    // After capturing all the products, now verify the shopping list
    instacartPage.verifyCartDetails(productDetails);

    // Verify the total price in the shopping list
    cy.xpath('//div[@class="e-0"]//span[@class="e-dzwvfb"]')
      .invoke('text')
      .then((shoppingListTotal) => {
        const totalAmountInCart = parseFloat(shoppingListTotal.replace(/[^0-9.-]+/g, ""));
        verifyTotalPrice(totalPriceCaptured, totalAmountInCart);
      });

    // Place the order
    instacartPage.placeOrder();
  });
});
