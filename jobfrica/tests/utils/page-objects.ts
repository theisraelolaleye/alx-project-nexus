import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for the Jobs page
 */
export class JobsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly locationFilter: Locator;
  readonly experienceLevelRadios: Locator;
  readonly resetFiltersButton: Locator;
  readonly jobCards: Locator;
  readonly loadingSpinner: Locator;
  readonly pagination: Locator;
  readonly viewToggle: Locator;
  readonly mobileFiltersButton: Locator;
  readonly mobileFiltersModal: Locator;
  readonly jobsHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Filter elements
    this.searchInput = page.getByPlaceholder('Search by title or keyword');
    this.categoryFilter = page.locator('#category-select');
    this.locationFilter = page.locator('#location-select');
    this.experienceLevelRadios = page.locator('input[name="experienceLevel"]');
    this.resetFiltersButton = page.getByText('Reset Filters');

    // Job listing elements
    this.jobCards = page.locator('[data-testid="job-card"]');
    this.loadingSpinner = page.getByTestId('loading-spinner');
    this.pagination = page.locator('[data-testid="pagination"]');
    this.viewToggle = page.locator('[data-testid="view-toggle"]');

    // Mobile elements
    this.mobileFiltersButton = page.getByText('Filters');
    this.mobileFiltersModal = page.locator('[data-testid="mobile-filters"]');

    // Page elements
    this.jobsHeading = page.getByRole('heading', { name: 'Find Your Next Opportunity' });
  }

  async goto() {
    await this.page.goto('/jobs');
    await this.waitForJobsToLoad();
  }

  async waitForJobsToLoad() {
    // Wait for either jobs to load or loading to finish
    await Promise.race([
      this.jobCards.first().waitFor({ state: 'visible', timeout: 10000 }),
      this.page.waitForLoadState('networkidle', { timeout: 15000 })
    ]);
  }

  async searchJobs(query: string) {
    await this.searchInput.fill(query);
    await this.waitForJobsToLoad();
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption({ label: category });
    await this.waitForJobsToLoad();
  }

  async filterByLocation(location: string) {
    await this.locationFilter.selectOption({ label: location });
    await this.waitForJobsToLoad();
  }

  async filterByExperienceLevel(level: string) {
    const radio = this.experienceLevelRadios.filter({ hasText: level });
    await radio.check();
    await this.waitForJobsToLoad();
  }

  async resetFilters() {
    await this.resetFiltersButton.click();
    await this.waitForJobsToLoad();
  }

  async getJobCount() {
    await this.waitForJobsToLoad();
    return await this.jobCards.count();
  }

  async clickJobCard(index: number = 0) {
    await this.jobCards.nth(index).click();
  }

  async getJobCardText(index: number = 0) {
    return await this.jobCards.nth(index).textContent();
  }

  async toggleMobileFilters() {
    await this.mobileFiltersButton.click();
  }

  async verifyFiltersVisible() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.categoryFilter).toBeVisible();
    await expect(this.locationFilter).toBeVisible();
  }

  async verifyJobsLoaded() {
    await expect(this.jobsHeading).toBeVisible();
    // Should have at least one job card or a no-results message
    const hasJobs = await this.jobCards.count() > 0;
    if (!hasJobs) {
      await expect(this.page.getByText('No jobs found')).toBeVisible();
    }
  }

  async verifyPagination() {
    const jobCount = await this.getJobCount();
    if (jobCount >= 6) { // JOBS_PER_PAGE = 6
      await expect(this.pagination).toBeVisible();
    }
  }

  async goToNextPage() {
    const nextButton = this.page.getByRole('button', { name: /next|>/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await this.waitForJobsToLoad();
    }
  }

  async switchToGridView() {
    const gridButton = this.viewToggle.getByRole('button').first();
    await gridButton.click();
  }

  async switchToListView() {
    const listButton = this.viewToggle.getByRole('button').last();
    await listButton.click();
  }
}

/**
 * Page Object Model for Job Details page
 */
export class JobDetailPage {
  readonly page: Page;
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly location: Locator;
  readonly applyButton: Locator;
  readonly saveButton: Locator;
  readonly shareButton: Locator;
  readonly backButton: Locator;
  readonly jobDescription: Locator;
  readonly requirements: Locator;
  readonly responsibilities: Locator;
  readonly benefits: Locator;
  readonly jobMeta: Locator;

  constructor(page: Page) {
    this.page = page;

    this.jobTitle = page.locator('h1');
    this.companyName = page.getByTestId('company-name');
    this.location = page.getByTestId('job-location');
    this.applyButton = page.getByRole('button', { name: /apply/i });
    this.saveButton = page.getByRole('button', { name: /save|bookmark/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.jobDescription = page.getByTestId('job-description');
    this.requirements = page.getByTestId('job-requirements');
    this.responsibilities = page.getByTestId('job-responsibilities');
    this.benefits = page.getByTestId('job-benefits');
    this.jobMeta = page.getByTestId('job-meta');
  }

  async goto(jobId: string) {
    await this.page.goto(`/jobs/${jobId}`);
  }

  async verifyJobDetails() {
    await expect(this.jobTitle).toBeVisible();
    await expect(this.companyName).toBeVisible();
    await expect(this.location).toBeVisible();
    await expect(this.applyButton).toBeVisible();
  }

  async clickApply() {
    await this.applyButton.click();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async getJobTitle() {
    return await this.jobTitle.textContent();
  }

  async getCompanyName() {
    return await this.companyName.textContent();
  }
}

/**
 * Test utilities and helpers
 */
export class TestUtils {
  static async waitForApiResponse(page: Page, urlPattern: string | RegExp) {
    return await page.waitForResponse(response =>
      response.url().match(urlPattern) !== null && response.status() === 200
    );
  }

  static async mockApiResponse(page: Page, url: string, response: any) {
    await page.route(url, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  static async takeFullPageScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  static generateMockJob(id: string, overrides = {}) {
    return {
      id,
      title: `Software Engineer ${id}`,
      company: `Company ${id}`,
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      experienceLevel: 'Mid-Level',
      salary: '$50,000 - $70,000',
      description: `This is a mock job description for job ${id}`,
      requirements: ['Requirement 1', 'Requirement 2'],
      responsibilities: ['Responsibility 1', 'Responsibility 2'],
      benefits: ['Benefit 1', 'Benefit 2'],
      tags: ['React', 'TypeScript'],
      postedDate: new Date().toISOString(),
      isRemote: false,
      ...overrides
    };
  }

  static async verifyJobCardContent(page: Page, jobCard: Locator) {
    // Verify essential job card elements are present
    await expect(jobCard).toBeVisible();

    const hasTitle = await jobCard.locator('h3, h2').count() > 0;
    const hasCompany = await jobCard.getByText(/company|corp|inc|ltd/i).count() > 0;
    const hasLocation = await jobCard.getByText(/lagos|remote|nigeria|ghana|kenya/i).count() > 0;

    return { hasTitle, hasCompany, hasLocation };
  }

  static async mockJobsApiWithDelay(page: Page, jobs: any[], delay: number = 1000) {
    await page.route('**/api/jobs', async route => {
      // Add artificial delay to test loading states
      await new Promise(resolve => setTimeout(resolve, delay));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: jobs,
          total: jobs.length,
          source: 'mock'
        })
      });
    });
  }
}