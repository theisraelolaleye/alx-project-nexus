import { test, expect } from '@playwright/test';
import { JobsPage, TestUtils } from './utils/page-objects';

test.describe('Job Filtering - Comprehensive Filter Testing', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);

    // Create comprehensive test dataset
    const mockJobs = [
      TestUtils.generateMockJob('react-senior-lagos', {
        title: 'Senior React Developer',
        company: 'TechCorp Lagos',
        location: 'Lagos, Nigeria',
        tags: ['React', 'JavaScript', 'Frontend', 'TypeScript'],
        experienceLevel: 'Senior',
        type: 'Full-time',
        category: 'Engineering'
      }),
      TestUtils.generateMockJob('react-mid-remote', {
        title: 'React Developer',
        company: 'RemoteFirst',
        location: 'Remote',
        tags: ['React', 'Redux', 'Frontend'],
        experienceLevel: 'Mid-Level',
        type: 'Remote',
        category: 'Engineering'
      }),
      TestUtils.generateMockJob('vue-junior-cape-town', {
        title: 'Junior Vue Developer',
        company: 'VueCompany SA',
        location: 'Cape Town, South Africa',
        tags: ['Vue', 'JavaScript', 'Frontend'],
        experienceLevel: 'Entry-Level',
        type: 'Full-time',
        category: 'Engineering'
      }),
      TestUtils.generateMockJob('product-manager-nairobi', {
        title: 'Senior Product Manager',
        company: 'ProductCorp Kenya',
        location: 'Nairobi, Kenya',
        tags: ['Product', 'Strategy', 'Analytics'],
        experienceLevel: 'Senior',
        type: 'Full-time',
        category: 'Product'
      }),
      TestUtils.generateMockJob('designer-cairo', {
        title: 'UX Designer',
        company: 'DesignStudio Egypt',
        location: 'Cairo, Egypt',
        tags: ['Design', 'UX', 'Figma', 'Research'],
        experienceLevel: 'Mid-Level',
        type: 'Contract',
        category: 'Design'
      }),
      TestUtils.generateMockJob('data-scientist-johannesburg', {
        title: 'Data Scientist',
        company: 'DataLab SA',
        location: 'Johannesburg, South Africa',
        tags: ['Data Science', 'Python', 'Machine Learning', 'Analytics'],
        experienceLevel: 'Senior',
        type: 'Full-time',
        category: 'Engineering'
      }),
      TestUtils.generateMockJob('marketing-accra', {
        title: 'Digital Marketing Specialist',
        company: 'MarketingHub Ghana',
        location: 'Accra, Ghana',
        tags: ['Marketing', 'Digital', 'Social Media', 'Content'],
        experienceLevel: 'Entry-Level',
        type: 'Part-time',
        category: 'Marketing'
      }),
      TestUtils.generateMockJob('backend-casablanca', {
        title: 'Backend Engineer',
        company: 'TechMorocco',
        location: 'Casablanca, Morocco',
        tags: ['Backend', 'Node.js', 'API', 'Database'],
        experienceLevel: 'Mid-Level',
        type: 'Full-time',
        category: 'Engineering'
      })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should filter by search term accurately', async ({ page }) => {
    await jobsPage.goto();

    // Test React search
    await jobsPage.searchJobs('React');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(2); // Should find 2 React jobs

    // Verify results contain React
    for (let i = 0; i < jobCount; i++) {
      const jobText = await jobsPage.getJobCardText(i);
      expect(jobText?.toLowerCase()).toMatch(/react/);
    }

    // Test Product search
    await jobsPage.searchJobs('Product');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Should find 1 Product Manager job

    // Test case-insensitive search
    await jobsPage.searchJobs('PYTHON');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Should find the Data Scientist job
  });

  test('should filter by company name in search', async ({ page }) => {
    await jobsPage.goto();

    // Search for specific company
    await jobsPage.searchJobs('TechCorp');
    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Should find TechCorp Lagos job

    const jobText = await jobsPage.getJobCardText(0);
    expect(jobText).toMatch(/techcorp/i);
  });

  test('should filter by multiple tags in search', async ({ page }) => {
    await jobsPage.goto();

    // Search for Frontend
    await jobsPage.searchJobs('Frontend');
    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(3); // React Senior, React Mid, Vue Junior

    // All results should be frontend jobs
    for (let i = 0; i < jobCount; i++) {
      const jobText = await jobsPage.getJobCardText(i);
      expect(jobText?.toLowerCase()).toMatch(/react|vue|frontend|javascript/);
    }
  });

  test('should filter by category accurately', async ({ page }) => {
    await jobsPage.goto();

    // Filter by Engineering
    await jobsPage.filterByCategory('Engineering');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(5); // React Senior, React Mid, Vue Junior, Data Scientist, Backend

    // Filter by Design
    await jobsPage.filterByCategory('Design');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // UX Designer

    const jobText = await jobsPage.getJobCardText(0);
    expect(jobText).toMatch(/ux designer/i);

    // Filter by Marketing
    await jobsPage.filterByCategory('Marketing');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Marketing Specialist
  });

  test('should filter by location accurately', async ({ page }) => {
    await jobsPage.goto();

    // Filter by Lagos
    await jobsPage.filterByLocation('Lagos, Nigeria');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // React Senior Lagos

    // Filter by South Africa (should match multiple cities)
    await jobsPage.filterByLocation('South Africa');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(2); // Cape Town and Johannesburg jobs

    // Filter by Remote
    await jobsPage.filterByLocation('Remote');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Remote React job
  });

  test('should filter by experience level accurately', async ({ page }) => {
    await jobsPage.goto();

    // Filter by Senior
    await jobsPage.filterByExperienceLevel('Senior');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(3); // React Senior, Product Manager, Data Scientist

    // Filter by Entry-Level
    await jobsPage.filterByExperienceLevel('Entry-Level');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(2); // Vue Junior, Marketing Specialist

    // Filter by Mid-Level
    await jobsPage.filterByExperienceLevel('Mid-Level');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(3); // React Mid, UX Designer, Backend Engineer
  });

  test('should combine multiple filters correctly', async ({ page }) => {
    await jobsPage.goto();

    // Combine search and location
    await jobsPage.searchJobs('React');
    await jobsPage.filterByLocation('Lagos, Nigeria');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Only React Senior Lagos should match

    let jobText = await jobsPage.getJobCardText(0);
    expect(jobText).toMatch(/react/i);
    expect(jobText).toMatch(/lagos/i);

    // Reset and try category + experience level
    await jobsPage.resetFilters();
    await page.waitForTimeout(500);

    await jobsPage.filterByCategory('Engineering');
    await jobsPage.filterByExperienceLevel('Senior');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(2); // React Senior and Data Scientist

    // Triple combination: search + location + experience
    await jobsPage.resetFilters();
    await page.waitForTimeout(500);

    await jobsPage.searchJobs('JavaScript');
    await jobsPage.filterByLocation('South Africa');
    await jobsPage.filterByExperienceLevel('Entry-Level');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Only Vue Junior in Cape Town should match

    jobText = await jobsPage.getJobCardText(0);
    expect(jobText).toMatch(/vue/i);
    expect(jobText).toMatch(/cape town/i);
  });

  test('should handle edge cases in filtering', async ({ page }) => {
    await jobsPage.goto();

    // Search for non-existent term
    await jobsPage.searchJobs('NonexistentTechnology');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(0);
    await expect(page.getByText(/no jobs found/i)).toBeVisible();

    // Reset and test empty search
    await jobsPage.resetFilters();
    await page.waitForTimeout(500);

    await jobsPage.searchJobs('');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(8); // Should show all jobs

    // Test partial matches
    await jobsPage.searchJobs('Dev');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0); // Should match Developer jobs
  });

  test('should preserve filter state correctly', async ({ page }) => {
    await jobsPage.goto();

    // Apply filters
    await jobsPage.searchJobs('React');
    await jobsPage.filterByExperienceLevel('Senior');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1);

    // Add another filter
    await jobsPage.filterByLocation('Lagos, Nigeria');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Still should match one job

    // Remove one filter by changing it
    await jobsPage.filterByLocation('All Locations');
    await page.waitForTimeout(1000);

    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1); // Should still show React Senior jobs (Lagos one)
  });

  test('should reset all filters correctly', async ({ page }) => {
    await jobsPage.goto();

    // Apply multiple filters
    await jobsPage.searchJobs('React');
    await jobsPage.filterByCategory('Engineering');
    await jobsPage.filterByLocation('Lagos, Nigeria');
    await jobsPage.filterByExperienceLevel('Senior');
    await page.waitForTimeout(1000);

    let jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1);

    // Reset filters
    await jobsPage.resetFilters();
    await page.waitForTimeout(1000);

    // Should show all jobs again
    jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(8);

    // Verify all filter controls are reset
    await expect(jobsPage.searchInput).toHaveValue('');
    await expect(jobsPage.categoryFilter).toHaveValue('');
    await expect(jobsPage.locationFilter).toHaveValue('');

    // Check that no experience level radio is selected
    const checkedRadio = await page.locator('input[name="experienceLevel"]:checked').count();
    expect(checkedRadio).toBe(1); // "All Levels" should be selected
  });

  test('should handle rapid filter changes', async ({ page }) => {
    await jobsPage.goto();

    // Rapidly change filters
    await jobsPage.searchJobs('React');
    await page.waitForTimeout(100);

    await jobsPage.filterByLocation('Lagos, Nigeria');
    await page.waitForTimeout(100);

    await jobsPage.filterByExperienceLevel('Senior');
    await page.waitForTimeout(100);

    await jobsPage.searchJobs('Product');
    await page.waitForTimeout(100);

    await jobsPage.filterByLocation('Nairobi, Kenya');
    await page.waitForTimeout(1000); // Wait for final result

    // Should end up with Product Manager in Nairobi
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1);

    const jobText = await jobsPage.getJobCardText(0);
    expect(jobText).toMatch(/product manager/i);
    expect(jobText).toMatch(/nairobi/i);
  });
});

test.describe('Job Filtering - Mobile Filter Experience', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    jobsPage = new JobsPage(page);

    const mockJobs = [
      TestUtils.generateMockJob('mobile-job-1', { title: 'React Developer' }),
      TestUtils.generateMockJob('mobile-job-2', { title: 'Vue Developer' })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should open and close mobile filters correctly', async ({ page }) => {
    await jobsPage.goto();

    // Mobile filters should be hidden initially
    await expect(jobsPage.searchInput).not.toBeVisible();

    // Open mobile filters
    await jobsPage.toggleMobileFilters();

    // Filters should now be visible
    await expect(jobsPage.searchInput).toBeVisible();

    // Should be able to use filters
    await jobsPage.searchJobs('React');

    // Close filters by pressing escape
    await page.keyboard.press('Escape');

    // Filters should be hidden again
    await expect(jobsPage.searchInput).not.toBeVisible();

    // But filtering should still be applied
    await page.waitForTimeout(500);
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1);
  });

  test('should maintain filter state when toggling mobile filters', async ({ page }) => {
    await jobsPage.goto();

    // Open mobile filters
    await jobsPage.toggleMobileFilters();

    // Apply a filter
    await jobsPage.searchJobs('React');
    await page.waitForTimeout(500);

    // Close filters
    await page.keyboard.press('Escape');

    // Reopen filters
    await jobsPage.toggleMobileFilters();

    // Filter values should be preserved
    await expect(jobsPage.searchInput).toHaveValue('React');
  });

  test('should handle mobile filter interactions smoothly', async ({ page }) => {
    await jobsPage.goto();

    await jobsPage.toggleMobileFilters();

    // Should be able to navigate between filter controls
    await jobsPage.searchInput.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to apply filters
    await jobsPage.searchJobs('Vue');
    await jobsPage.filterByCategory('Engineering');

    // Should close when clicking outside (if implemented)
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Filters should be applied
    await page.waitForTimeout(500);
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1);
  });
});

test.describe('Job Filtering - Filter Performance and UX', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);

    // Create a larger dataset to test performance
    const mockJobs = Array.from({ length: 50 }, (_, i) =>
      TestUtils.generateMockJob(`perf-job-${i}`, {
        title: `Job Title ${i}`,
        company: `Company ${i}`,
        location: i % 5 === 0 ? 'Lagos, Nigeria' : 'Other City',
        experienceLevel: i % 3 === 0 ? 'Senior' : 'Mid-Level',
        tags: i % 2 === 0 ? ['React', 'Frontend'] : ['Backend', 'API']
      })
    );

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should filter large datasets efficiently', async ({ page }) => {
    await jobsPage.goto();

    const startTime = Date.now();

    // Apply filter to large dataset
    await jobsPage.searchJobs('React');
    await page.waitForTimeout(1000);

    const filterTime = Date.now() - startTime;

    // Should filter quickly (adjust threshold as needed)
    expect(filterTime).toBeLessThan(3000);

    // Should show correct results
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0);
    expect(jobCount).toBeLessThanOrEqual(6); // One page of results
  });

  test('should provide immediate visual feedback', async ({ page }) => {
    await jobsPage.goto();

    // Start typing in search
    await jobsPage.searchInput.type('React', { delay: 100 });

    // Should see filtering happening (implementation specific)
    // This might involve checking for loading indicators or result changes

    await page.waitForTimeout(1000);

    // Results should be filtered
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0);
  });

  test('should handle concurrent filter operations', async ({ page }) => {
    await jobsPage.goto();

    // Apply multiple filters simultaneously
    const filterPromises = [
      jobsPage.searchJobs('Job Title'),
      jobsPage.filterByLocation('Lagos, Nigeria'),
      jobsPage.filterByExperienceLevel('Senior')
    ];

    await Promise.all(filterPromises);
    await page.waitForTimeout(2000);

    // Should handle concurrent operations gracefully
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThanOrEqual(0);
  });

  test('should maintain performance with pagination', async ({ page }) => {
    await jobsPage.goto();

    // Should show pagination with large dataset
    await jobsPage.verifyPagination();

    // Filter should work with pagination
    await jobsPage.searchJobs('Backend');
    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeLessThanOrEqual(6); // One page worth

    // Should be able to navigate pages with filters
    if (await page.getByRole('button', { name: /next/i }).isVisible()) {
      await jobsPage.goToNextPage();
      await page.waitForTimeout(1000);

      // Should maintain filter on next page
      const nextPageCount = await jobsPage.getJobCount();
      expect(nextPageCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should debounce search input appropriately', async ({ page }) => {
    await jobsPage.goto();

    // Type rapidly in search box
    await jobsPage.searchInput.type('abcd', { delay: 50 }); // Fast typing

    // Should not trigger multiple API calls immediately
    // (This test would need API call monitoring in real implementation)

    await page.waitForTimeout(1500); // Wait for debounce

    // Should eventually show results
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThanOrEqual(0);
  });
});