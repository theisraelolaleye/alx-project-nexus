import { test, expect } from '@playwright/test';
import { JobDetailPage, JobsPage, TestUtils } from './utils/page-objects';

test.describe('Job Detail Page - Core Functionality', () => {
  let jobDetailPage: JobDetailPage;
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);
    jobsPage = new JobsPage(page);

    // Mock consistent test data
    const mockJobs = [
      TestUtils.generateMockJob('test-job-1', {
        title: 'Senior React Developer',
        company: 'TechCorp Africa',
        location: 'Lagos, Nigeria',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salary: '$60,000 - $80,000',
        description: 'We are looking for an experienced React developer to join our team and build amazing user interfaces.',
        requirements: [
          '5+ years of React experience',
          'TypeScript proficiency',
          'Experience with Next.js',
          'Strong CSS skills'
        ],
        responsibilities: [
          'Develop user interfaces',
          'Collaborate with design team',
          'Maintain code quality',
          'Mentor junior developers'
        ],
        benefits: [
          'Health insurance',
          'Remote work options',
          'Professional development budget',
          'Flexible working hours'
        ],
        tags: ['React', 'TypeScript', 'Next.js', 'Frontend'],
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }),
      TestUtils.generateMockJob('test-job-2', {
        title: 'Product Manager',
        company: 'StartupHub',
        location: 'Cape Town, South Africa'
      })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should load job detail page and display job information', async ({ page }) => {
    await jobDetailPage.goto('test-job-1');

    // Verify page loaded and shows job details
    await jobDetailPage.verifyJobDetails();

    // Check specific job information
    await expect(jobDetailPage.jobTitle).toContainText('Senior React Developer');
    await expect(jobDetailPage.companyName).toContainText('TechCorp Africa');
    await expect(jobDetailPage.location).toContainText('Lagos, Nigeria');
  });

  test('should display comprehensive job information sections', async ({ page }) => {
    await jobDetailPage.goto('test-job-1');

    // Verify all sections are present
    await expect(jobDetailPage.jobDescription).toBeVisible();
    await expect(jobDetailPage.requirements).toBeVisible();
    await expect(jobDetailPage.responsibilities).toBeVisible();
    await expect(jobDetailPage.benefits).toBeVisible();

    // Verify content is populated
    await expect(jobDetailPage.jobDescription).toContainText('experienced React developer');
    await expect(jobDetailPage.requirements).toContainText('5+ years of React');
    await expect(jobDetailPage.responsibilities).toContainText('Develop user interfaces');
    await expect(jobDetailPage.benefits).toContainText('Health insurance');
  });

  test('should display job metadata correctly', async ({ page }) => {
    await jobDetailPage.goto('test-job-1');

    // Check job metadata
    await expect(jobDetailPage.jobMeta).toContainText('Full-time');
    await expect(jobDetailPage.jobMeta).toContainText('Senior');
    await expect(jobDetailPage.jobMeta).toContainText('$60,000 - $80,000');

    // Check tags
    await expect(page.getByText('React')).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('Next.js')).toBeVisible();
  });

  test('should handle navigation from jobs listing', async ({ page }) => {
    // First go to jobs page
    await jobsPage.goto();

    // Click on first job
    await jobsPage.clickJobCard(0);

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/jobs\/test-job-/);
    await jobDetailPage.verifyJobDetails();
  });

  test('should handle non-existent job gracefully', async ({ page }) => {
    await jobDetailPage.goto('non-existent-job');

    // Should show some kind of not found state
    // (The exact behavior depends on implementation)
    await expect(page.getByText(/not found|error|invalid/i)).toBeVisible();
  });
});

test.describe('Job Detail Page - User Interactions', () => {
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);

    const mockJobs = [
      TestUtils.generateMockJob('interactive-job', {
        title: 'Frontend Developer',
        company: 'Interactive Corp',
        location: 'Remote'
      })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should handle apply button interaction', async ({ page }) => {
    await jobDetailPage.goto('interactive-job');

    // Apply button should be present and clickable
    await expect(jobDetailPage.applyButton).toBeVisible();
    await expect(jobDetailPage.applyButton).toBeEnabled();

    // Click apply button
    await jobDetailPage.clickApply();

    // Should navigate to apply page or show apply modal
    // (This depends on your implementation)
    await expect(page).toHaveURL(/apply/);
  });

  test('should handle save/bookmark functionality', async ({ page }) => {
    await jobDetailPage.goto('interactive-job');

    // Save button should be present
    await expect(jobDetailPage.saveButton).toBeVisible();

    // Click save button
    await jobDetailPage.clickSave();

    // Button state should change or show confirmation
    // (Implementation-specific behavior)
    // The button might change text or icon to indicate saved state
  });

  test('should handle share functionality', async ({ page }) => {
    await jobDetailPage.goto('interactive-job');

    // Share button should be present
    await expect(jobDetailPage.shareButton).toBeVisible();

    // Mock clipboard API for testing
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: (text: string) => Promise.resolve(),
        },
      });
    });

    await jobDetailPage.shareButton.click();

    // Should handle share functionality
    // (Could open share modal, copy link, etc.)
  });

  test('should handle back navigation', async ({ page }) => {
    await jobDetailPage.goto('interactive-job');

    // Back button should be present
    await expect(jobDetailPage.backButton).toBeVisible();

    await jobDetailPage.clickBack();

    // Should navigate back to jobs listing
    await expect(page).toHaveURL(/\/jobs$/);
  });
});

test.describe('Job Detail Page - Responsive Design', () => {
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);

    const mockJobs = [
      TestUtils.generateMockJob('responsive-job', {
        title: 'Responsive Developer',
        company: 'Responsive Corp'
      })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await jobDetailPage.goto('responsive-job');

    // All key elements should be visible on mobile
    await expect(jobDetailPage.jobTitle).toBeVisible();
    await expect(jobDetailPage.companyName).toBeVisible();
    await expect(jobDetailPage.applyButton).toBeVisible();

    // Content should be properly formatted for mobile
    const titleBounds = await jobDetailPage.jobTitle.boundingBox();
    expect(titleBounds?.width).toBeLessThan(375);
  });

  test('should be responsive on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await jobDetailPage.goto('responsive-job');

    await jobDetailPage.verifyJobDetails();

    // Layout should work well on tablet
    const applyButtonBounds = await jobDetailPage.applyButton.boundingBox();
    expect(applyButtonBounds?.width).toBeLessThan(200); // Reasonable button size
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await jobDetailPage.goto('responsive-job');

    await jobDetailPage.verifyJobDetails();

    // Should make good use of available space on desktop
    const pageWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(1024);
  });
});

test.describe('Job Detail Page - Error Handling', () => {
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);
  });

  test('should handle API failures gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/jobs', route => {
      route.abort('failed');
    });

    await jobDetailPage.goto('any-job-id');

    // Should show error state without crashing
    await expect(page.getByText(/error|failed|not found/i)).toBeVisible();
  });

  test('should handle incomplete job data', async ({ page }) => {
    // Mock job with minimal data
    const incompleteJob = {
      id: 'incomplete-job',
      title: 'Basic Job',
      company: 'Basic Corp',
      location: 'Somewhere',
      type: 'Full-time',
      experienceLevel: 'Mid-Level',
      tags: [],
      postedDate: new Date().toISOString()
      // Missing description, requirements, etc.
    };

    await TestUtils.mockJobsApiWithDelay(page, [incompleteJob], 300);

    await jobDetailPage.goto('incomplete-job');

    // Should still show basic job info
    await expect(jobDetailPage.jobTitle).toContainText('Basic Job');
    await expect(jobDetailPage.companyName).toContainText('Basic Corp');

    // Should handle missing sections gracefully
    // (Might hide sections or show placeholder text)
  });

  test('should handle slow loading', async ({ page }) => {
    const mockJobs = [TestUtils.generateMockJob('slow-job')];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 3000);

    await jobDetailPage.goto('slow-job');

    // Should show loading state
    await expect(page.getByText(/loading|please wait/i)).toBeVisible();

    // Eventually should load job details
    await jobDetailPage.verifyJobDetails();
  });
});

test.describe('Job Detail Page - SEO and Accessibility', () => {
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);

    const mockJobs = [
      TestUtils.generateMockJob('seo-job', {
        title: 'SEO Frontend Developer',
        company: 'SEO Company',
        description: 'A detailed job description for SEO testing.'
      })
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should have proper page title and meta information', async ({ page }) => {
    await jobDetailPage.goto('seo-job');

    // Should have descriptive page title
    await expect(page).toHaveTitle(/SEO Frontend Developer|SEO Company/);

    // Should have proper heading structure
    await expect(page.locator('h1')).toContainText('SEO Frontend Developer');
  });

  test('should be accessible to screen readers', async ({ page }) => {
    await jobDetailPage.goto('seo-job');

    // Should have proper ARIA labels and roles
    await expect(page.locator('main')).toBeVisible();

    // Important elements should be properly labeled
    await expect(jobDetailPage.jobTitle).toHaveRole('heading');
    await expect(jobDetailPage.applyButton).toHaveRole('button');

    // Should be navigable by keyboard
    await jobDetailPage.applyButton.focus();
    await page.keyboard.press('Tab');

    // Focus should move to next focusable element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper semantic markup', async ({ page }) => {
    await jobDetailPage.goto('seo-job');

    // Should use semantic HTML elements
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article, section')).toBeVisible();

    // Lists should use proper list elements
    await expect(page.locator('ul li, ol li')).toBeVisible();
  });
});

test.describe('Job Detail Page - Performance', () => {
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);

    const mockJobs = [TestUtils.generateMockJob('perf-job')];
    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 100);
  });

  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await jobDetailPage.goto('perf-job');
    await jobDetailPage.verifyJobDetails();

    const loadTime = Date.now() - startTime;

    // Should load within reasonable time (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have layout shifts', async ({ page }) => {
    await jobDetailPage.goto('perf-job');

    // Wait for initial load
    await jobDetailPage.verifyJobDetails();

    // Take screenshot to compare layout stability
    const initialScreenshot = await page.screenshot();

    // Wait a bit more to catch any delayed layout shifts
    await page.waitForTimeout(1000);

    const finalScreenshot = await page.screenshot();

    // Screenshots should be identical (no layout shifts)
    expect(initialScreenshot).toEqual(finalScreenshot);
  });
});

test.describe('Job Detail Page - Integration', () => {
  let jobDetailPage: JobDetailPage;
  let jobsPage: JobsPage;

  test.beforeEach(async ({ page }) => {
    jobDetailPage = new JobDetailPage(page);
    jobsPage = new JobsPage(page);

    const mockJobs = [
      TestUtils.generateMockJob('integration-job-1'),
      TestUtils.generateMockJob('integration-job-2')
    ];

    await TestUtils.mockJobsApiWithDelay(page, mockJobs, 300);
  });

  test('should maintain context when navigating between jobs and detail pages', async ({ page }) => {
    // Start from jobs listing
    await jobsPage.goto();

    // Apply a search filter
    await jobsPage.searchJobs('integration');
    await page.waitForTimeout(1000);

    // Click on a job
    await jobsPage.clickJobCard(0);

    // Should be on detail page
    await expect(page).toHaveURL(/\/jobs\/integration-job-/);

    // Go back to listing
    await jobDetailPage.clickBack();

    // Should return to filtered results
    await expect(page).toHaveURL(/\/jobs$/);
    // Filter should still be applied (implementation dependent)
  });

  test('should work well with browser navigation', async ({ page }) => {
    await jobDetailPage.goto('integration-job-1');
    await jobDetailPage.verifyJobDetails();

    // Navigate to another job
    await jobDetailPage.goto('integration-job-2');
    await jobDetailPage.verifyJobDetails();

    // Use browser back button
    await page.goBack();

    // Should return to previous job
    await expect(page).toHaveURL(/integration-job-1/);
    await jobDetailPage.verifyJobDetails();

    // Use browser forward button
    await page.goForward();

    // Should go to second job again
    await expect(page).toHaveURL(/integration-job-2/);
  });
});