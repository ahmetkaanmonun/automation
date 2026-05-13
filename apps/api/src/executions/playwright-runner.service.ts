import { Injectable } from '@nestjs/common';
import { LocatorType, Prisma, StepAction, TestStep } from '@prisma/client';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chromium, Page } from 'playwright';
import { PrismaService } from '../prisma/prisma.service';
import { TestDataService } from '../test-data/test-data.service';

type StepWithRelations = TestStep & {
  locator: { type: LocatorType; value: string } | null;
};

export class ExecutionStepError extends Error {
  constructor(
    message: string,
    readonly screenshotPath?: string,
  ) {
    super(message);
  }
}

@Injectable()
export class PlaywrightRunnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly testData: TestDataService,
  ) {}

  async run(executionId: string) {
    const execution = await this.prisma.execution.findUniqueOrThrow({
      where: { id: executionId },
      include: {
        scenario: {
          include: {
            steps: {
              include: { locator: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      for (const step of execution.scenario.steps) {
        await this.log(executionId, step.id, 'RUNNING', `Step started: ${step.name}`);
        try {
          await this.executeStep(page, step);
          await this.log(executionId, step.id, 'PASSED', `Step passed: ${step.name}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown step error';
          const screenshotPath = await this.captureFailureScreenshot(page, executionId, step.orderIndex);
          await this.log(executionId, step.id, 'FAILED', `Step failed: ${step.name}. ${message}`, {
            screenshotPath,
            action: step.action,
          });
          throw new ExecutionStepError(message, screenshotPath);
        }
      }
    } finally {
      await browser.close();
    }
  }

  private async executeStep(page: Page, step: StepWithRelations) {
    const timeout = step.timeoutMs ?? 10000;
    const value = step.testDataId ? await this.testData.resolveValue(step.testDataId) : step.inputValue;
    const target = step.locator ? page.locator(this.toSelector(step.locator.type, step.locator.value)) : undefined;

    switch (step.action) {
      case StepAction.OPEN_URL:
        await page.goto(value ?? '', { timeout });
        break;
      case StepAction.CLICK:
        await target?.click({ timeout });
        break;
      case StepAction.DOUBLE_CLICK:
        await target?.dblclick({ timeout });
        break;
      case StepAction.RIGHT_CLICK:
        await target?.click({ button: 'right', timeout });
        break;
      case StepAction.INPUT_TEXT:
        await target?.fill(value ?? '', { timeout });
        break;
      case StepAction.CLEAR_INPUT:
        await target?.fill('', { timeout });
        break;
      case StepAction.SELECT_DROPDOWN:
        await target?.selectOption(value ?? '', { timeout });
        break;
      case StepAction.UPLOAD_FILE:
        await target?.setInputFiles(value ?? '', { timeout });
        break;
      case StepAction.WAIT:
        await page.waitForTimeout(Number(value ?? timeout));
        break;
      case StepAction.WAIT_VISIBLE:
      case StepAction.ASSERT_VISIBLE:
        await target?.waitFor({ state: 'visible', timeout });
        break;
      case StepAction.WAIT_CLICKABLE:
        await target?.click({ trial: true, timeout });
        break;
      case StepAction.ASSERT_TEXT:
        await target?.filter({ hasText: step.expectedValue ?? value ?? '' }).waitFor({ timeout });
        break;
      case StepAction.ASSERT_VALUE:
        await target?.inputValue({ timeout }).then((actual) => {
          if (actual !== (step.expectedValue ?? value)) {
            throw new Error(`Expected value "${step.expectedValue ?? value}", got "${actual}"`);
          }
        });
        break;
      case StepAction.ASSERT_URL:
        if (!page.url().includes(step.expectedValue ?? value ?? '')) {
          throw new Error(`URL assertion failed. Current URL: ${page.url()}`);
        }
        break;
      case StepAction.TAKE_SCREENSHOT:
        await page.screenshot({ path: value ?? `uploads/screenshots/${Date.now()}.png`, fullPage: true });
        break;
      case StepAction.SCROLL:
        await target?.scrollIntoViewIfNeeded({ timeout });
        break;
      case StepAction.HOVER:
        await target?.hover({ timeout });
        break;
      case StepAction.API_REQUEST:
      case StepAction.CUSTOM_SCRIPT:
        throw new Error(`${step.action} needs a project-specific adapter before production use.`);
    }
  }

  private toSelector(type: LocatorType, value: string) {
    switch (type) {
      case LocatorType.ID:
        return `#${value}`;
      case LocatorType.XPATH:
        return `xpath=${value}`;
      case LocatorType.CSS_SELECTOR:
        return value;
      case LocatorType.CLASS_NAME:
        return `.${value}`;
      case LocatorType.NAME:
        return `[name="${value}"]`;
      case LocatorType.TAG_NAME:
        return value;
    }
  }

  private log(
    executionId: string,
    stepId: string,
    status: 'RUNNING' | 'PASSED' | 'FAILED',
    message: string,
    metadata?: Prisma.InputJsonObject,
  ) {
    return this.prisma.executionLog.create({ data: { executionId, stepId, status, message, metadata } });
  }

  private async captureFailureScreenshot(page: Page, executionId: string, orderIndex: number) {
    const dir = join('uploads', 'screenshots');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = `${executionId}-step-${orderIndex}-${Date.now()}.png`;
    const filePath = join(dir, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    return `/uploads/screenshots/${filename}`;
  }
}
