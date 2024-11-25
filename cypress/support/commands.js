// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-xpath';

// cypress/support/commands.js

Cypress.Commands.add('visitURL', () => {
  cy.visit('https://sprouts-whitelabel.instacart.com/store/sprouts/storefront');
  cy.viewport(1920, 1080);
  cy.clearAllCookies()
  cy.xpath('//*[@id="id-18"]/div[1]/div[3]/button').should('be.visible');
  cy.xpath('//*[@id="id-18"]/div[1]/div[3]/button').click().wait(2000)
  cy.xpath('//button[@class="e-1gw01k7"]').click();

});


Cypress.Commands.add('selectRandomProduct', () => {
  return cy.xpath('//div[@aria-label="Product"]').should('have.length.greaterThan', 0)
    .then((products) => {
      const totalProducts = products.length;
      const randomIndex = Math.floor(Math.random() * totalProducts);
      return cy.wrap(products[randomIndex]);
    });
});

Cypress.Commands.add('captureProductPrice', (product) => {
  return product.find('[class="screen-reader-only"]', { timeout: 4000 })
    .should('exist')
    .invoke('text')
    .then((currentPriceText) => {
      return currentPriceText.trim();
    });
});

Cypress.Commands.add('captureProductName', (product) => {
  return product.find('div[class="e-1pnf8tv"] > h2', { timeout: 4000 })
    .should('exist')
    .invoke('text')
    .then((productNameText) => {
      return productNameText.trim();
    });
});

//-----------------------------------------------------------------
// If the Accept Cookies button is displayed, click it
Cypress.Commands.add('acceptCookies', () => {
  cy.get('body').then(($body) => {
    if (
      $body.find('#onetrust-accept-btn-handler', {
        timeout: 60000,
      }).length > 0
    ) {
      cy.get('#onetrust-accept-btn-handler').filter(':visible').click();
    }
  });
});


// If the Accept Cookies button is displayed, click it (version2)
Cypress.Commands.add('acceptCookies2', () => {
  cy.get('body').then(($body) => {
    if (
      $body.find('#truste-consent-button', {
        timeout: 60000,
      }).length > 0
    ) {
      cy.get('#truste-consent-button').filter(':visible').click();
    }
  });
});


// Prep the intercept for the Graphql requests
Cypress.Commands.add('prepGraphqlIntercept', () => {
  cy.waitForNetworkIdlePrepare2({
      method: 'GET',
      patterns: [
          /.\+graphql.operatorName(?!.\+retailerInventorySessionToken)(?!.*PromotionsProgressTracker).*$/,
      ],
      alias: 'waitForGraphql',
  });
});

// Wait for the graphql requests to complete and the network to be idle.
// This will wait for up to 60 seconds for an individual request to finish, but only wait 3 seconds after all of them have been completed before the test moves on.
Cypress.Commands.add('waitForGraphql', () => {
  cy.wait(3000).waitForNetworkIdle2('waitForGraphql', 3000, {
      timeout: 200000,
  });
});

// If there is a product available on the page return true, else return false
Cypress.Commands.add('isAnyProductPresent', () => {
  cy.get('body').then(($body) => {
      const isPresent = $body.find('[aria-label="Product"]').length;
      return cy.wrap(isPresent > 0);
  });
});


// -------------------- new 25-11-24
// Custom command to capture product details (with discount or without discount)
Cypress.Commands.add('captureProductDetails', () => {
  let productDetail = {
    name: '',
    originalPrice: '',
    discountPrice: '',
    discountPercentage: '',
    quantitySelected: ''
  };

  // Capture product name
  cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-6vf2xs"]', { timeout: 8000 })
    .should('exist')
    .invoke('text')
    .then((productNameText) => {
      productDetail.name = productNameText.trim();
      cy.log(`Product Name: ${productDetail.name}`);
    });

  // Check if the product has a discount
  cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-1yfpthi"]', { timeout: 6000 })
    .then(($discountPrice) => {
      if ($discountPrice.length > 0) {
        // If discount exists, capture discount price and original price
        cy.wrap($discountPrice).invoke('text').then((discountText) => {
          productDetail.discountPrice = discountText.trim();
          cy.log(`Discount Price: ${productDetail.discountPrice}`);
        });

        // Capture original price
        cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-azp9o7"]', { timeout: 6000 })
          .invoke('text')
          .then((originalPriceText) => {
            productDetail.originalPrice = originalPriceText.trim();
            cy.log(`Original Price: ${productDetail.originalPrice}`);
          });

        // Capture discount percentage
        cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-vdvio"]', { timeout: 6000 })
          .invoke('text')
          .then((discountPercentageText) => {
            productDetail.discountPercentage = discountPercentageText.trim();
            cy.log(`Discount Percentage: ${productDetail.discountPercentage}`);
          });
      } else {
        // If no discount, capture original price (no discount)
        cy.xpath('//div[@class="e-89uv4s"]//span[@class="e-0"]', { timeout: 4000 })
          .invoke('text')
          .then((originalPriceText) => {
            productDetail.originalPrice = originalPriceText.trim();
            cy.log(`Original Price (No Discount): ${productDetail.originalPrice}`);
            // No need to capture discount price or percentage for no-discount products
          });
      }
    });

  // No return value, we simply do the actions within this command
});
