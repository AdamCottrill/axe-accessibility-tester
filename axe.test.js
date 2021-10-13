import { AxePuppeteer } from "@axe-core/puppeteer";
import puppeteer from "puppeteer";
import { createHtmlReport } from "axe-html-reporter";

// 1. update the list of pages to test by providing a url and report name
// 2. start the server in production mode (or without the debug toolbar)
// 3. run the axe tests in a separate console using:
//    > yarn test

describe("Axe Accessibility Tests", () => {
  const DOMAIN = "http://localhost:8000/";
  const OUTPUT_DIR = "axe_reports";

  const TEST_TIMEOUT = 120000;

  // pages_to_test is an array of objects that contain the url to test
  // and the name of the associated report.
  const pages_to_test = [
    { url: `${DOMAIN}`, reportName: "ticket_list.html" },
    {
      url: `${DOMAIN}/tickets/1/`,
      reportName: "ticket_detail.html",
    },
  ];

  let page;
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setBypassCSP(true);
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test.each(pages_to_test)(
    "is accessible",
    async ({ url, reportName }) => {
      await page.goto(url);
      const results = await new AxePuppeteer(page).analyze();
      createHtmlReport({
        results,
        options: {
          outputDir: OUTPUT_DIR,
          reportFileName: reportName,
        },
      });
      expect(results.violations.length).toBe(0);
    },
    TEST_TIMEOUT
  );
});
