import { getCurrencyConfig } from './render';

export function formatSubscriptionPrice(plan, digits = 2) {
  const amount = Number(plan?.price_amount || 0);
  const planCurrency = plan?.currency || getCurrencyConfig().type;
  const current = getCurrencyConfig();
  const symbolMap = {
    USD: '$',
    CNY: '¥',
  };
  let symbol = symbolMap[planCurrency] || current.symbol;

  let displayAmount = amount;
  if (planCurrency !== current.type) {
    if (planCurrency === 'USD') {
      displayAmount = amount * current.rate;
      symbol = current.symbol;
    } else if (current.type === 'USD') {
      displayAmount = amount / (current.rate || 1);
      symbol = current.symbol;
    }
  }

  return `${symbol}${displayAmount.toFixed(
    Number.isInteger(displayAmount) ? 0 : digits,
  )}`;
}

export function formatSubscriptionDuration(plan, t) {
  const unit = plan?.duration_unit || 'month';
  const value = plan?.duration_value || 1;
  const unitLabels = {
    year: t('年'),
    month: t('个月'),
    day: t('天'),
    hour: t('小时'),
    custom: t('自定义'),
  };
  if (unit === 'custom') {
    const seconds = plan?.custom_seconds || 0;
    if (seconds >= 86400) return `${Math.floor(seconds / 86400)} ${t('天')}`;
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)} ${t('小时')}`;
    return `${seconds} ${t('秒')}`;
  }
  return `${value} ${unitLabels[unit] || unit}`;
}

export function formatSubscriptionResetPeriod(plan, t) {
  const period = plan?.quota_reset_period || 'never';
  if (period === 'never') return t('不重置');
  if (period === 'daily') return t('每天');
  if (period === 'weekly') return t('每周');
  if (period === 'monthly') return t('每月');
  if (period === 'custom') {
    const seconds = Number(plan?.quota_reset_custom_seconds || 0);
    if (seconds >= 86400) return `${Math.floor(seconds / 86400)} ${t('天')}`;
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)} ${t('小时')}`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)} ${t('分钟')}`;
    return `${seconds} ${t('秒')}`;
  }
  return t('不重置');
}
