/// <reference types="cypress" /> 

describe('Capture Details of Randomly Selected Products and Verify Exact Match in Cart', () => {
    let productDetails = [];
    let totalPriceCaptured = 0; // Initialize total price for all products added to the cart
  
    it('Should capture the product details, calculate total price per product, and verify exact match in the cart', () => {
      // Visit the site and handle initial setup
      cy.visit('https://sprouts-whitelabel.instacart.com/store/sprouts/storefront');
      cy.viewport(1920, 1080);
      cy.xpath('//*[@id="id-18"]/div[1]/div[3]/button').should('be.visible');
      cy.xpath('//*[@id="id-18"]/div[1]/div[3]/button').click().wait(2000);
      cy.xpath('//*[@id="id-18"]/div[2]/button').wait(2000).click();
  
      // Prevent Cypress from failing on uncaught exceptions
      Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });
  
      cy.wait(8000); // Adjust based on your needs
  
      // Number of products to capture
      const numberOfProducts = 1; // Capture 3 products as an example
  
      for (let i = 0; i < numberOfProducts; i++) {
        // Find all products on the page
        cy.xpath('//div[@aria-label="item carousel"]//*[@aria-label="Product"]')
          .should('have.length.greaterThan', 0)
          .then((products) => {
            // Select a random product
            const totalProducts = products.length;
            const randomIndex = Math.floor(Math.random() * totalProducts);
            const selectedProduct = cy.wrap(products[randomIndex]);
  
            // Click the random product
            selectedProduct.scrollIntoView().click();
            
            // Wait for product details to load
            cy.xpath('//div[@class="e-89uv4s"]//div[@aria-label="carousel"][1]')
              .should('be.visible');
  
            // Capture the product name
            cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-6vf2xs"]', { timeout: 8000 })
              .wait(4000)
              .should('exist')
              .invoke('text')
              .then((productNameText) => {
                const productName = productNameText.trim();
                cy.log(`Product Name: ${productName}`); // Log product name
                // Initialize product detail object
                let productDetail = {
                  name: productName,
                  originalPrice: '',
                  discountPrice: '',
                  discountPercentage: '',
                  quantitySelected: '',
                  totalAmount: 0 // Initialize totalAmount
                };
  
                // Check for discount price
                cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-1yfpthi"]').then(($discountPrice) => {
                  if ($discountPrice.length > 0) {
                    cy.wrap($discountPrice).invoke('text').then((discountText) => {
                      productDetail.discountPrice = discountText.trim();
                      cy.log(`Discount Price: ${productDetail.discountPrice}`); // Log discount price
  
                      // Capture the original price (strikethrough)
                      cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-azp9o7"]')
                        .invoke('text')
                        .then((originalPriceText) => {
                          productDetail.originalPrice = originalPriceText.trim();
                          cy.log(`Original Price: ${productDetail.originalPrice}`); // Log original price
  
                          // Convert both original price and discount price to numbers
                          const originalPrice = parseFloat(productDetail.originalPrice.replace(/[^0-9.-]+/g, ""));
                          const discountPrice = parseFloat(productDetail.discountPrice.replace(/[^0-9.-]+/g, ""));
  
                          // Calculate the expected discount percentage
                          const expectedDiscountPercentage = ((originalPrice - discountPrice) / originalPrice) * 100;
  
                          // Capture discount percentage
                          cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-vdvio"]')
                            .invoke('text')
                            .then((discountPercentageText) => {
                              const discountPercentage = parseFloat(discountPercentageText.replace(/[^0-9.-]+/g, ""));
                              cy.log(`Captured Discount Percentage: ${discountPercentage}`); // Log discount percentage
  
                              // Assertion: Compare the expected discount percentage with the captured one
                              expect(discountPercentage).to.be.closeTo(expectedDiscountPercentage, 1); // Allow a small margin of error (1%)
  
                              productDetail.discountPercentage = discountPercentageText.trim();
  
                              // Add the product detail to the array after it's captured
                              productDetails.push(productDetail);
  
                              // Log the product details
                              cy.log('Captured Product Details:', productDetails);
  
                              // Handle the quantity selection
                              cy.xpath('//div[@class="e-89uv4s"]//button[@aria-haspopup="listbox"]').as('quantityDropdown').click();
  
                              // Get all quantity options (excluding the last custom option)
                              cy.xpath('//div[@class="e-89uv4s"]//ul[@role="listbox"]//li')
                                .not(':last-child') // Exclude the last option (custom option)
                                .then((options) => {
                                  // Select a random option from the remaining options
                                  const randomOptionIndex = Math.floor(Math.random() * options.length);
                                  const quantityText = options[randomOptionIndex].innerText.trim(); // Capture quantity text
                                  cy.wrap(options[randomOptionIndex]).click();
                                  productDetail.quantitySelected = quantityText; // Store the selected quantity
                                  cy.log(`Selected Quantity: ${productDetail.quantitySelected}`); // Log selected quantity
                                  
  
                                  // Calculate total price based on the discount price and quantity
                                  const totalAmount = discountPrice * parseInt(quantityText); 
                                  productDetail.totalAmount = totalAmount; // Store the total amount per product
                                  cy.log(`Total Amount for ${productName}: $${totalAmount.toFixed(2)}`); // Log total amount
                                  
  
                                  // Add the total price of this product to the overall total
                                  totalPriceCaptured += totalAmount; // Update the total price of all products
                                  cy.log(`Total Price Captured so far: $${totalPriceCaptured.toFixed(2)}`); // Log the cumulative total
                                });
  
                              // Now click on the "Add to List" button
                              cy.xpath('//div[@class="e-89uv4s"]//button[@data-testid="submit-button"]')
                                .scrollIntoView() // Scroll the element into view
                                .click(); // Click the button
  
                              // Go back to the main product page
                              cy.go('back');
                              cy.wait(2000); // Adjust wait time if necessary
                            });
                        });
                    });
                  } else {
                    // If no discount, check for regular price
                    cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-0"]').should('exist').invoke('text')
                      .then((regularPriceText) => {
                        productDetail.originalPrice = regularPriceText.trim();
                        cy.log(`Original Price (No Discount): ${productDetail.originalPrice}`); // Log regular price
  
                        // Add the product detail to the array after it's captured
                        productDetails.push(productDetail);
  
                        // Log the product details
                        cy.log('Captured Product Details:', productDetails);
  
                        // Handle the quantity selection
                        cy.xpath('//div[@class="e-89uv4s"]//button[@aria-haspopup="listbox"]').as('quantityDropdown').click();
  
                        // Get all quantity options (excluding the last custom option)
                        cy.xpath('//div[@class="e-89uv4s"]//ul[@role="listbox"]//li')
                          .not(':last-child') // Exclude the last option (custom option)
                          .then((options) => {
                            const randomOptionIndex = Math.floor(Math.random() * options.length);
                            const quantityText = options[randomOptionIndex].innerText.trim(); // Capture quantity text
                            cy.wrap(options[randomOptionIndex]).click();
                            productDetail.quantitySelected = quantityText; // Store the selected quantity
                            cy.log(`Selected Quantity: ${productDetail.quantitySelected}`); // Log selected quantity
                            
                            // Calculate total price based on the regular price and quantity
                            const totalAmount = parseFloat(productDetail.originalPrice.replace(/[^0-9.-]+/g, "")) * parseInt(quantityText); 
                            productDetail.totalAmount = totalAmount; // Store the total amount per product
                            cy.log(`Total Amount for ${productName}: $${totalAmount.toFixed(2)}`); // Log total amount
                            
                            // Add the total price of this product to the overall total
                            totalPriceCaptured += totalAmount; // Update the total price of all products
                            cy.log(`Total Price Captured so far: $${totalPriceCaptured.toFixed(2)}`); // Log the cumulative total
                          });
  
                        // Now click on the "Add to List" button
                        cy.xpath('//div[@class="e-89uv4s"]//button[@data-testid="submit-button"]')
                          .scrollIntoView() // Scroll the element into view
                          .click(); // Click the button
  
                        // Go back to the main product page
                        cy.go('back');
                        cy.wait(2000); // Adjust wait time if necessary
                      });
                  }
                });
              });
          });
      }
  
      // After capturing all the products, now verify the shopping list
      cy.xpath('//div[@class="js-app"]//button[@class="e-23fegv"]')
        .should('be.visible')
        .click(); // Click the shopping list button
  
      // Wait for the shopping list to load by verifying the header is visible
      cy.xpath('//h1[@class="e-wrc2d0"]').wait(4000).should('be.visible');
  
      // Verify the products in the cart by checking the cart body
      cy.xpath('//div[@id="cart-body"]')
        .should('be.visible') // Ensure cart body is visible
        .then(() => {
          // Check each captured product's details in the shopping cart
          productDetails.forEach((product) => {
            // Verify exact product name (case-sensitive and exact match)
            cy.xpath('//div[@id="cart-body"]')
              .contains(product.name)
              .should('have.length', 1) // Ensure only one product with this name is present
              .and('be.visible');
            
            // Verify the product quantity
            cy.xpath('//div[@aria-label="product"]//span[@data-testid="cartStepper"]')
              .contains(product.quantitySelected)
              .should('be.visible');
            
            // Verify the total amount in the cart
            cy.xpath('//div[@id="cart-body"]')
              .contains(`$${product.totalAmount.toFixed(2)}`)
              .should('be.visible');
          });
  
          // Now verify the total price in the shopping list
          cy.xpath('//div[@class="e-0"]//span[@class="e-dzwvfb"]')
            .invoke('text')
            .then((shoppingListTotal) => {
              const totalAmountInCart = parseFloat(shoppingListTotal.replace(/[^0-9.-]+/g, "")); // Extract number value from text
              cy.log(`Total Amount in Shopping List: $${totalAmountInCart.toFixed(2)}`); // Log the total amount in the shopping list
              // Assert that the captured total price matches the total amount in the shopping list
              expect(totalPriceCaptured).to.be.closeTo(totalAmountInCart, 1); // Allow a small margin of error (1%)
            });
  
          cy.xpath('//button[@type="submit"]//div[text()="Order online"]').click().wait(4000)
          cy.xpath('//div[@id="cart-body"]//div[text()="How would you like to receive your order?"]').should('be.visible')
          cy.xpath('//input[@id="pickup"]').click({force:true}).wait(2000)
          cy.xpath('//button[@type="submit"]//div[text()="Confirm"]').click({force:true}).wait(10000)
          
          // Verify that the checkout cart is visible on the next page
          cy.xpath('//div[@id="cart_dialog"]')
          .should('be.visible') // Ensure the checkout cart is visible
          .and('contain.text', 'Checkout') // Optional: check that the checkout section is present (adjust text if necessary)
          .then(() => {
            cy.log('Checkout page is loaded and cart is visible!');
          });


                
        });
    });
});
  