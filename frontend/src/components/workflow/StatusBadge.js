import React from 'react';
import { useI18n } from '../../i18n/I18nContext';

function StatusBadge({ status }) {
  const { t } = useI18n();
  return <span className={`status-badge status-${status}`}>{t(`status.${status}`)}</span>;
}

export default StatusBadge;
