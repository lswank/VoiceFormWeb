// @ts-check
import { chromium } from '@playwright/test';

// Configure the app URL
const appUrl = 'http://localhost:5173';

(async () => {
  console.log('Starting Playwright debug session...');
  
  // Launch the browser with verbose logging
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });
  
  // Create a new page
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  // Add listener to capture all console messages
  page.on('console', async (msg) => {
    const text = msg.text();
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${text}`);
    
    // If this is an error, capture all arguments for more detail
    if (msg.type() === 'error') {
      console.log('[CONSOLE ERROR ARGS]:', await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => arg))));
      
      // Specifically look for MirageError
      if (text.includes('MirageError')) {
        await page.evaluate(() => {
          // Try to get more detailed error info from Mirage
          // @ts-ignore
          if (window.server && window.server._errorHandler) {
            // @ts-ignore
            console.error('MIRAGE ERROR DETAILS:', window.server._errorHandler.errorMessages);
          }
        });
      }
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR]: ${error.message}`);
    console.error(`[PAGE ERROR STACK]: ${error.stack || 'No stack trace'}`);
  });

  // Monitor network requests and responses, particularly for /api/
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      console.log(`[REQUEST] ${request.method()} ${url}`);
      try {
        const postData = request.postData();
        if (postData) {
          console.log(`[REQUEST BODY]: ${postData}`);
        }
      } catch (e) {}
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      console.log(`[RESPONSE] ${response.status()} ${url}`);
      try {
        const body = await response.text();
        console.log(`[RESPONSE BODY]: ${body.substring(0, 1000)}${body.length > 1000 ? '...' : ''}`);
      } catch (e) {}
    }
  });

  // Inject script to expose window.server and capture more details
  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('UNHANDLED PROMISE REJECTION:', event.reason);
      if (event.reason && event.reason.stack) {
        console.error('REJECTION STACK:', event.reason.stack);
      }
    });

    // Add hook to expose MirageJS server and errors
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      console.log(`Fetch called with: ${args[0]}`);
      return originalFetch.apply(this, args).catch(err => {
        console.error('FETCH ERROR:', err);
        if (err.stack) console.error('FETCH ERROR STACK:', err.stack);
        throw err;
      });
    };
  });

  try {
    // Navigate to the app
    await page.goto(appUrl);
    console.log(`Connected to app at ${appUrl}`);
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'initial-state.png' });
    console.log('Initial app state screenshot saved as initial-state.png');

    // Check if we're using the mock API
    const isMockApiEnabled = await page.evaluate(() => {
      return window.localStorage.getItem('mockApiEnabled') === 'true' || 
            window.location.href.includes('mockApi=true') ||
            // @ts-ignore
            (window.import && window.import.meta && window.import.meta.env && window.import.meta.env.VITE_USE_MOCK_API === 'true');
    });
    
    console.log(`Mock API ${isMockApiEnabled ? 'is' : 'is NOT'} enabled`);

    // Check which environment we're using
    const environment = await page.evaluate(() => {
      try {
        // @ts-ignore
        return window.appConfig && window.appConfig.environment;
      } catch (e) {
        return 'unknown';
      }
    });
    
    console.log(`Using environment: ${environment}`);

    // Log the API URL
    const apiUrl = await page.evaluate(() => {
      try {
        // @ts-ignore
        return window.appConfig && window.appConfig.apiUrl;
      } catch (e) {
        return 'unknown';
      }
    });
    
    console.log(`API URL: ${apiUrl}`);

    // Check if MirageJS server exists
    await page.evaluate(() => {
      // @ts-ignore
      console.log(`CURRENT WINDOW.SERVER: ${window.server ? 'Exists' : 'Does not exist'}`);
      
      // If server exists, try to extract route handlers 
      // @ts-ignore
      if (window.server) {
        try {
          // @ts-ignore
          console.log('ROUTE HANDLERS:', Object.keys(window.server.pretender.handlerFor));
        } catch (e) {}
      }
    });

    // Try to navigate to forms page directly
    console.log('Attempting to navigate directly to /forms');
    await page.goto(`${appUrl}/forms`);
    await page.waitForLoadState('networkidle');
    console.log(`Current URL: ${page.url()}`);
    
    // Take a screenshot of the forms page
    await page.screenshot({ path: 'forms-page.png' });
    console.log('Forms page screenshot saved as forms-page.png');

    // Check if there's an error message on the page
    const errorVisible = await page.isVisible('text=Failed to load forms');
    if (errorVisible) {
      console.log('ERROR DETECTED: Failed to load forms message is visible');
      
      // Inspect server details
      await page.evaluate(() => {
        // @ts-ignore
        console.log('CURRENT WINDOW.SERVER:', window.server ? 'Exists' : 'Does not exist');
        
        // @ts-ignore
        if (window.server) {
          // Try to inspect server request handlers
          try {
            // @ts-ignore
            console.log('MIRAGE DB:', Object.keys(window.server.db));
            // @ts-ignore
            console.log('MIRAGE ROUTES:', window.server.pretender._handlerFor);
          } catch (e) {
            console.error('Error inspecting server:', e);
          }
        }
      });
    } else {
      console.log('No error message detected on the page');
      
      // Check if we can see any forms
      const formElements = await page.locator('.form-card, .form-list-item').count();
      console.log(`Found ${formElements} form elements on the page`);
    }
  } catch (error) {
    console.error('Debug script error:', error);
    
    // Take a screenshot of the current state
    await page.screenshot({ path: 'error-state.png' });
    console.log('Error state screenshot saved as error-state.png');
  }

  // Keep the browser open for inspection
  console.log('Debug session running - the browser will stay open for 60 seconds for inspection');
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Close browser
  await browser.close();
})(); 