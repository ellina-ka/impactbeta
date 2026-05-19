import React from 'react';
import { useI18n } from '../../i18n/I18nContext';

const WORKFLOW_STEPS = ['submit', 'validate', 'generate', 'sign', 'complete'];

function getWorkflowProgress(status, hasConvention = false) {
  if (status === 'rejected') return 1;
  if (status === 'active' || status === 'complete' || status === 'completed') return 5;
  if (status === 'signed') return 4;
  if (status === 'ready' || hasConvention) return 3;
  if (status === 'validated') return 2;
  return 1;
}

function WorkflowTimeline({ status, hasConvention = false }) {
  const { t } = useI18n();
  const progress = getWorkflowProgress(status, hasConvention);

  return (
    <ol className="workflow-timeline" aria-label={t('workflow.timeline_label')}>
      {WORKFLOW_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const state = stepNumber < progress ? 'complete' : stepNumber === progress ? 'current' : 'upcoming';
        return (
          <li key={step} className={`workflow-step ${state}`}>
            <span className="workflow-step-dot" aria-hidden="true" />
            <span className="workflow-step-label">{t(`workflow.steps.${step}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default WorkflowTimeline;
