import { test, expect } from "@playwright/test";

test("golden path", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/");

  // Navigate to ETP wizard
  await page.getByRole("button", { name: "New ETP" }).click();
  await expect(page).toHaveURL("/etp/new");

  // Fill and save ETP
  await page.getByLabel("Title").fill("Test ETP");
  await page.getByLabel("Description").fill("This is a test ETP.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("ETP saved successfully")).toBeVisible();

  // Transform to TR
  await page.getByRole("button", { name: "Transform to TR" }).click();
  await expect(page).toHaveURL(/\/tr\/new\/.*/);

  // Verify TR data
  await expect(page.getByLabel("Title")).toHaveValue("Test ETP");
  await expect(page.getByLabel("Description")).toHaveValue(
    "This is a test ETP."
  );

  // Consolidate TR
  await page.getByRole("button", { name: "Consolidate" }).click();
  await expect(page.getByText("TR consolidated successfully")).toBeVisible();

  // Verify PDF download
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(".pdf");
});
