import { PrismaClient, Role, Environment, LocatorType, StepAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@local.test';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const adminName = process.env.ADMIN_FULL_NAME ?? 'QA Platform Admin';
  const shouldSeedDemoData = process.env.SEED_DEMO_DATA === 'true';
  const shouldResetAdminPassword = process.env.RESET_ADMIN_PASSWORD === 'true';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminName,
      role: Role.ADMIN,
      passwordHash: shouldResetAdminPassword ? passwordHash : undefined,
      active: true,
    },
    create: {
      email: adminEmail,
      fullName: adminName,
      role: Role.ADMIN,
      passwordHash,
    },
  });

  if (existingAdmin && shouldResetAdminPassword) {
    console.log(`Admin password reset for ${admin.email}. Set RESET_ADMIN_PASSWORD=false after login.`);
  }

  if (!shouldSeedDemoData) {
    console.log(`Seed complete. Admin=${admin.email}. Demo data skipped.`);
    return;
  }

  const project = await prisma.project.upsert({
    where: { name: 'Internal QA Demo Project' },
    update: {},
    create: {
      name: 'Internal QA Demo Project',
      description: 'Starter project for local QA automation management.',
    },
  });

  const module = await prisma.module.upsert({
    where: { projectId_name: { projectId: project.id, name: 'Login Module' } },
    update: {},
    create: {
      projectId: project.id,
      name: 'Login Module',
      description: 'Authentication and session flows.',
    },
  });

  const usernameLocator = await prisma.locator.upsert({
    where: { moduleId_name: { moduleId: module.id, name: 'Username Input' } },
    update: {},
    create: {
      projectId: project.id,
      moduleId: module.id,
      name: 'Username Input',
      description: 'Login username field.',
      type: LocatorType.CSS_SELECTOR,
      value: '[name="username"]',
      page: 'Login',
    },
  });

  const scenario = await prisma.testScenario.upsert({
    where: { moduleId_name_version: { moduleId: module.id, name: 'Successful login smoke', version: 1 } },
    update: {},
    create: {
      projectId: project.id,
      moduleId: module.id,
      environment: Environment.TEST,
      name: 'Successful login smoke',
      description: 'Basic login smoke scenario.',
      tags: ['smoke', 'login'],
      createdById: admin.id,
      steps: {
        create: [
          {
            orderIndex: 1,
            name: 'Open login page',
            action: StepAction.OPEN_URL,
            inputValue: 'https://example.com',
            timeoutMs: 10000,
          },
          {
            orderIndex: 2,
            name: 'Check username input',
            action: StepAction.ASSERT_VISIBLE,
            locatorId: usernameLocator.id,
            timeoutMs: 5000,
            continueOnFail: true,
          },
        ],
      },
    },
  });

  console.log(`Seed complete. Admin=${admin.email}, project=${project.name}, scenario=${scenario.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
