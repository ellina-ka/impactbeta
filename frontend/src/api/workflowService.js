import { initialApplications, initialConventions } from '../data/workflowMockData';
import { generateConventionFromApplication } from '../utils/convention';

const clone = (value) => JSON.parse(JSON.stringify(value));

const db = {
  applications: clone(initialApplications),
  conventions: clone(initialConventions)
};

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getApplications() {
  await delay();
  return clone(db.applications);
}

export async function getConventions() {
  await delay();
  return clone(db.conventions);
}

export async function submitApplication(payload) {
  await delay();
  const application = {
    id: `app-${Date.now()}`,
    ...payload,
    targetHours: Number(payload.targetHours),
    status: 'pending'
  };

  db.applications = [application, ...db.applications];
  return clone(application);
}

export async function validateApplication(id) {
  await delay();
  const app = db.applications.find((item) => item.id === id);
  if (!app) return null;

  app.status = 'validated';

  const existingConvention = db.conventions.find((item) => item.applicationId === app.id);
  if (!existingConvention) {
    const convention = generateConventionFromApplication(app);
    db.conventions = [convention, ...db.conventions];
  }

  return clone(app);
}

export async function rejectApplication(id) {
  await delay();
  const app = db.applications.find((item) => item.id === id);
  if (!app) return null;

  app.status = 'rejected';
  return clone(app);
}
