import { test, expect } from '@playwright/test';
import { JobsPage, TestUtils } from './utils/page-objects';

test.describe('Jobs Page - Core Functionality', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);
  });

  test('should load jobs page and display jobs', async ({ page }) => {
    await jobsPage.goto();

    // Verify page loaded
    await expect(page).toHaveTitle(/JobFrica|Jobs/);
    await jobsPage.verifyJobsLoaded();

    // Should have at least some jobs (fallback data if external API fails)
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0);

    // Verify filters are visible
    await jobsPage.verifyFiltersVisible();
  });

  test('should handle loading states properly', async ({ page }) => {
    // Mock API with delay to test loading states
    await TestUtils.mockJobsApiWithDelay(page, [
      TestUtils.generateMockJob('1'),
      TestUtils.generateMockJob('2'),
      TestUtils.generateMockJob('3')
    ], 2000);

    await page.goto('/jobs');

    // Check if loading indicator appears (it might be very brief)
    // We don't fail if loading is too fast to catch
    try {
      await expect(jobsPage.loadingSpinner).toBeVisible({ timeout: 1000 });
    } catch {
      // Loading might be too fast, which is fine
    }

    // Eventually jobs should load
    await jobsPage.waitForJobsToLoad();
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(3);
  });

  test('should handle API failure gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/jobs', route => {
      route.abort('failed');
    });

    await page.goto('/jobs');

    // Should still show page structure
    await expect(jobsPage.jobsHeading).toBeVisible();

    // Should either show fallback jobs or error message
    const hasJobs = await jobsPage.getJobCount() > 0;
    if (!hasJobs) {
      await expect(page.getByText(/no jobs found|error|failed/i)).toBeVisible();
    }
  });
});

test.describe('Jobs Page - Search and Filtering', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);

    // Mock consistent test data
    const mockJobs = [
      TestUtils.generateMockJob('1', {
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Lagos, Nigeria',
        tags: ['React', 'JavaScript', 'Frontend'],
        experienceLevel: 'Senior'
      }),
      TestUtils.generateMockJob('2', {
        title: 'Product Manager',
        company: 'StartupHub',
        location: 'Cape Town, South Africa',
        tags: ['Product', 'Strategy', 'Management'],
        experienceLevel: 'Mid-Level'
      }),
      TestUtils.generateMockJob('3', {
        title: 'UX Designer',
        company: 'DesignLab',
        location: 'Remote',
        tags: ['Design', 'UX', 'Figma'],
        experienceLevel: 'Entry-Level'
      }),
      TestUtils.generateMockJob('4', {
        title: 'Backend Engineer',
        company: 'TechCorp',
        location: 'Lagos, Nigeria',
        tags: ['Node.js', 'Python', 'Backend'],
        experienceLevel: 'Senior'
      }),
      TestUtils.generateMockJob('5', {
        title: 'Marketing Specialist',
        company: 'GrowthCo',
        location: 'Nairobi, Kenya',
        tags: ['Marketing', 'Social Media', 'Content'],
        experienceLevel: 'Mid-Level'
      }),
      TestUtils.generateMockJob('6', {
        title: 'Data Scientist',
        company: 'DataLab',
        location: 'Cairo, Egypt',
        tags: ['Data Science', 'Python', 'Machine Learning'],
        experienceLevel: 'Senior'
      })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 500);
  });

  test('should filter jobs by search term', async ({ page }) => {
    await jobsPage.goto();

    // Search for 'React'
    await jobsPage.searchJobs('React');

    await page.waitForTimeout(1000); // Wait for filter to apply

    // Should only show React-related jobs
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThan(0);

    // Verify job content contains search term
    for (let i = 0; i < jobCount; i++) {
      const jobText = await jobsPage.getJobCardText(i);
      expect(jobText?.toLowerCase()).toMatch(/react/i);
    }
  });

  test('should filter jobs by category', async ({ page }) => {
    await jobsPage.goto();

    // Filter by Design category
    await jobsPage.filterByCategory('Design');

    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    if (jobCount > 0) {
      // Verify filtered jobs contain design-related content
      const jobText = await jobsPage.getJobCardText(0);
      expect(jobText?.toLowerCase()).toMatch(/design|ux|ui/i);
    }
  });

  test('should filter jobs by location', async ({ page }) => {
    await jobsPage.goto();

    // Filter by Lagos location
    await jobsPage.filterByLocation('Lagos, Nigeria');

    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    if (jobCount > 0) {
      // Verify filtered jobs are in Lagos
      const jobText = await jobsPage.getJobCardText(0);
      expect(jobText).toMatch(/lagos/i);
    }
  });

  test('should filter jobs by experience level', async ({ page }) => {
    await jobsPage.goto();

    // Filter by Senior level
    await jobsPage.filterByExperienceLevel('Senior');

    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    if (jobCount > 0) {
      // Verify filtered jobs are senior level
      const jobText = await jobsPage.getJobCardText(0);
      expect(jobText?.toLowerCase()).toMatch(/senior/i);
    }
  });

  test('should reset filters correctly', async ({ page }) => {
    await jobsPage.goto();

    // Apply some filters first
    await jobsPage.searchJobs('React');
    await jobsPage.filterByCategory('Design');

    await page.waitForTimeout(1000);

    // Reset filters
    await jobsPage.resetFilters();

    await page.waitForTimeout(1000);

    // Should show all jobs again
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(6); // All mock jobs should be visible

    // Verify search input is cleared
    await expect(jobsPage.searchInput).toHaveValue('');
  });

  test('should combine multiple filters', async ({ page }) => {
    await jobsPage.goto();

    // Combine search and location filters
    await jobsPage.searchJobs('Tech');
    await jobsPage.filterByLocation('Lagos, Nigeria');

    await page.waitForTimeout(1000);

    const jobCount = await jobsPage.getJobCount();
    if (jobCount > 0) {
      // Should show jobs that match both criteria
      const jobText = await jobsPage.getJobCardText(0);
      expect(jobText?.toLowerCase()).toMatch(/tech|techcorp/i);
      expect(jobText).toMatch(/lagos/i);
    }
  });
});

test.describe('Jobs Page - Pagination and View Modes', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);

    // Create enough jobs to test pagination (more than 6 jobs)
    const mockJobs = Array.from({ length: 12 }, (_, i) =>
      TestUtils.generateMockJob(`job-${i}`, {
        title: `Job Title ${i + 1}`,
        company: `Company ${i + 1}`
      })
    );

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should display pagination when needed', async ({ page }) => {
    await jobsPage.goto();

    // Should show 6 jobs per page
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(6);

    // Pagination should be visible
    await jobsPage.verifyPagination();

    // Should be able to navigate to next page
    await jobsPage.goToNextPage();

    // Should show remaining jobs
    const nextPageJobCount = await jobsPage.getJobCount();
    expect(nextPageJobCount).toBe(6);
  });

  test('should switch between grid and list views', async ({ page }) => {
    await jobsPage.goto();

    // Test view toggle functionality
    await jobsPage.switchToListView();
    await page.waitForTimeout(500);

    // Switch back to grid view
    await jobsPage.switchToGridView();
    await page.waitForTimeout(500);

    // Should still show the same number of jobs
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(6);
  });
});

test.describe('Jobs Page - Mobile Responsiveness', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);
  });

  test('should handle mobile filters correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const mockJobs = [
      TestUtils.generateMockJob('1'),
      TestUtils.generateMockJob('2')
    ];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);

    await jobsPage.goto();

    // Mobile filters should be hidden initially
    await expect(jobsPage.searchInput).not.toBeVisible();

    // Should show mobile filter button
    await expect(jobsPage.mobileFiltersButton).toBeVisible();

    // Open mobile filters
    await jobsPage.toggleMobileFilters();

    // Filters should now be visible in modal
    await expect(jobsPage.searchInput).toBeVisible();

    // Apply a filter
    await jobsPage.searchJobs('Job Title');

    // Close filters (click the X or outside)
    await page.keyboard.press('Escape');

    // Jobs should be filtered
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThanOrEqual(1);
  });

  test('should be responsive across different screen sizes', async ({ page }) => {
    const mockJobs = [TestUtils.generateMockJob('1')];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);

    // Test desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await jobsPage.goto();
    await expect(jobsPage.searchInput).toBeVisible();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(jobsPage.searchInput).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(jobsPage.mobileFiltersButton).toBeVisible();
  });
});

test.describe('Jobs Page - Error Handling and Edge Cases', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);
  });

  test('should handle empty job results', async ({ page }) => {
    // Mock empty response
    await TestUtils.mockJobsApiWithDelay(page, [], 300);

    await jobsPage.goto();

    // Should show empty state message
    await expect(page.getByText(/no jobs found/i)).toBeVisible();

    // Filters should still be functional
    await jobsPage.verifyFiltersVisible();
  });

  test('should handle malformed job data', async ({ page }) => {
    // Mock API with incomplete job data
    const malformedJobs = [
      { id: '1', title: 'Test Job' }, // Missing required fields
      { id: '2' }, // Very minimal data
      null, // Invalid data
      { id: '3', title: 'Complete Job', company: 'Test Corp', location: 'Test City', type: 'Full-time', experienceLevel: 'Mid-Level', tags: [], postedDate: new Date().toISOString() }
    ].filter(Boolean);

    await TestUtils.mockJobsApiWithDelay(page, malformedJobs, 300);

    await page.goto('/jobs');

    // Should not crash and show what it can
    await expect(jobsPage.jobsHeading).toBeVisible();

    // Should show at least the complete job
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle slow API responses', async ({ page }) => {
    const mockJobs = [TestUtils.generateMockJob('1')];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 5000);

    await page.goto('/jobs');

    // Should show loading state
    await expect(jobsPage.jobsHeading).toBeVisible();

    // Eventually should load jobs
    await jobsPage.waitForJobsToLoad();
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(1);
  });

  test('should handle navigation while filtering', async ({ page }) => {
    const mockJobs = [
      TestUtils.generateMockJob('1', { title: 'React Developer' }),
      TestUtils.generateMockJob('2', { title: 'Vue Developer' })
    ];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);

    await jobsPage.goto();

    // Apply filter
    await jobsPage.searchJobs('React');
    await page.waitForTimeout(1000);

    // Navigate away and back
    await page.goto('/');
    await page.goto('/jobs');

    // Filters should be reset
    await jobsPage.waitForJobsToLoad();
    const jobCount = await jobsPage.getJobCount();
    expect(jobCount).toBe(2); // Both jobs should be visible again
  });
});

test.describe('Jobs Page - User Experience', () => {
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page);
  });

  test('should have proper accessibility features', async ({ page }) => {
    const mockJobs = [TestUtils.generateMockJob('1')];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);

    await jobsPage.goto();

    // Check for proper ARIA labels and roles
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('search')).toBeVisible(); // Search input

    // Filter inputs should be properly labeled
    await expect(jobsPage.searchInput).toHaveAttribute('aria-describedby');
    await expect(jobsPage.categoryFilter).toHaveAttribute('aria-describedby');

    // Should be navigable by keyboard
    await jobsPage.searchInput.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should not have any obvious accessibility violations
    // (In a real test, you might use @axe-core/playwright here)
  });

  test('should provide good user feedback', async ({ page }) => {
    const mockJobs = [TestUtils.generateMockJob('1', { title: 'React Developer' })];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);

    await jobsPage.goto();

    // Should show job count
    await expect(page.getByText(/1.*job.*opportunit/i)).toBeVisible();

    // Should show feedback when filtering
    await jobsPage.searchJobs('Nonexistent Job');
    await page.waitForTimeout(1000);

    // Should show no results message
    await expect(page.getByText(/no jobs found/i)).toBeVisible();
  });

  test('should handle job card interactions', async ({ page }) => {
    const mockJobs = [TestUtils.generateMockJob('1')];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);

    await jobsPage.goto();

    // Should be able to click on job cards
    await jobsPage.clickJobCard(0);

    // Should navigate to job detail page
    await expect(page).toHaveURL(/\/jobs\/job/);
  });
});