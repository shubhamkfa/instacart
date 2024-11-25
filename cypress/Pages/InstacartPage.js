// cypress/support/pages/instacartPage.js

export class InstacartPage {
  visit() {
    cy.visit('https://sprouts-whitelabel.instacart.com/store/sprouts/storefront');
    cy.viewport(1920, 1080);
    cy.xpath('//*[@id="id-18"]/div[1]/div[3]/button').should('be.visible');
    cy.xpath('//*[@id="id-18"]/div[1]/div[3]/button').click().wait(2000);
    cy.xpath('//*[@id="id-18"]/div[2]/button').wait(2000).click();

  }


  closeExceptions() {
    Cypress.on('uncaught:exception', (err, runnable) => false);
  }

  openProduct(productIndex) {
    cy.xpath('//div[@aria-label="item carousel"]//*[@aria-label="Product"]')
      .eq(productIndex)
      .scrollIntoView()
      .click();
    cy.xpath('//div[@class="e-89uv4s"]//div[@aria-label="carousel"][1]')
      .should('be.visible');
  }

  getProductDetails() {
    let productDetail = {};

    cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-6vf2xs"]')
      .invoke('text')
      .then((productNameText) => {
        productDetail.name = productNameText.trim();
        cy.log(`Product Name: ${productDetail.name}`);

        cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-1yfpthi"]').then(($discountPrice) => {
          if ($discountPrice.length > 0) {
            cy.wrap($discountPrice).invoke('text').then((discountText) => {
              productDetail.discountPrice = discountText.trim();
              cy.log(`Discount Price: ${productDetail.discountPrice}`);

              cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-azp9o7"]')
                .invoke('text')
                .then((originalPriceText) => {
                  productDetail.originalPrice = originalPriceText.trim();
                  cy.log(`Original Price: ${productDetail.originalPrice}`);
                });
            });
          } else {
            cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-0"]').should('exist').invoke('text')
              .then((regularPriceText) => {
                productDetail.originalPrice = regularPriceText.trim();
                cy.log(`Original Price (No Discount): ${productDetail.originalPrice}`);
              });
          }
        });
      });

    return productDetail;
  }

  addProductToCart(quantity) {
    cy.xpath('//div[@class="e-89uv4s"]//button[@aria-haspopup="listbox"]').click();

    cy.xpath('//div[@class="e-89uv4s"]//ul[@role="listbox"]//li')
      .not(':last-child')
      .then((options) => {
        const randomOptionIndex = Math.floor(Math.random() * options.length);
        const quantityText = options[randomOptionIndex].innerText.trim();
        cy.wrap(options[randomOptionIndex]).click();
        cy.log(`Selected Quantity: ${quantityText}`);
      });

    cy.xpath('//div[@class="e-89uv4s"]//button[@data-testid="submit-button"]')
      .scrollIntoView()
      .click();
  }

  goBack() {
    cy.go('back');
    cy.wait(2000);
  }

  verifyCartDetails(productDetails) {
    cy.xpath('//div[@class="js-app"]//button[@class="e-23fegv"]')
      .wait(4000)
      .click()
      .then(() => {
        productDetails.forEach((product) => {
          cy.xpath('//div[@id="cart-body"]')
            .contains(product.name)
            .should('have.length', 1)
            .and('be.visible');
          
          cy.xpath('//div[@aria-label="product"]//span[@data-testid="cartStepper"]')
            .contains(product.quantitySelected)
            .should('be.visible');

          cy.xpath('//div[@id="cart-body"]')
            .contains(`$${product.totalAmount.toFixed(2)}`)
            .should('be.visible');
        });
      });
  }

  placeOrder() {
    cy.xpath('//button[@type="submit"]//div[text()="Order online"]').click().wait(4000);
    cy.xpath('//div[@id="cart-body"]//div[text()="How would you like to receive your order?"]')
      .should('be.visible');
    cy.xpath('//input[@id="pickup"]').click({ force: true }).wait(2000);
    cy.xpath('//button[@type="submit"]//div[text()="Confirm"]').click({ force: true }).wait(10000);
    cy.xpath('//div[@id="cart_dialog"]')
      .should('be.visible')
      .and('contain.text', 'Checkout')
      .then(() => {
        cy.log('Checkout page is loaded and cart is visible!');
      });
  }
}
