export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const formatStockStatus = (quantity: number): 'success' | 'warning' | 'danger' => {
  if (quantity >= 20) return 'success';
  if (quantity >= 10) return 'warning';
  return 'danger';
};
