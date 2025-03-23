import { test, expect } from '@playwright/test';

test.describe('Feature Toggles Page', () => {
  test.beforeEach(async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for login to complete and redirect
    await page.waitForURL('/dashboard');
    
    // Navigate to the feature toggles page
    await page.goto('/features');
  });

  test('should display all feature toggle sections', async ({ page }) => {
    // Check for main sections
    await expect(page.getByText('UI Features')).toBeVisible();
    await expect(page.getByText('Experimental Features')).toBeVisible();
    await expect(page.getByText('Performance Features')).toBeVisible();

    // Check for specific feature toggles
    await expect(page.getByText('3D Parallax Effect')).toBeVisible();
    await expect(page.getByText('PDF Form Import')).toBeVisible();
  });

  test('should toggle features on and off', async ({ page }) => {
    // Test PDF Form Import toggle
    const pdfToggle = page.getByRole('switch', { name: 'PDF Form Import' });
    const initialState = await pdfToggle.isChecked();
    
    // Toggle the feature
    await pdfToggle.click();
    await expect(pdfToggle).toHaveAttribute('aria-checked', (!initialState).toString());
    
    // Toggle back
    await pdfToggle.click();
    await expect(pdfToggle).toHaveAttribute('aria-checked', initialState.toString());
  });

  test('should reset features to defaults', async ({ page }) => {
    // Toggle a feature
    const pdfToggle = page.getByRole('switch', { name: 'PDF Form Import' });
    const initialState = await pdfToggle.isChecked();
    await pdfToggle.click();
    
    // Click reset button
    await page.getByRole('button', { name: 'Reset to Defaults' }).click();
    
    // Verify the feature is back to its initial state
    await expect(pdfToggle).toHaveAttribute('aria-checked', initialState.toString());
  });

  test('should show feature descriptions', async ({ page }) => {
    // Check for feature descriptions
    await expect(page.getByText('Enable the 3D hover effect on cards and buttons throughout the application')).toBeVisible();
    await expect(page.getByText('Import existing forms from PDF documents using OCR')).toBeVisible();
  });

  test('should show placeholder messages for empty sections', async ({ page }) => {
    // Check placeholder messages
    await expect(page.getByText('No experimental features available yet')).toBeVisible();
    await expect(page.getByText('No performance features available yet')).toBeVisible();
  });
}); 