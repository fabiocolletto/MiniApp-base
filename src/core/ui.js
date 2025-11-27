export function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '1rem';
  toast.style.right = '1rem';
  toast.style.padding = '0.75rem 1rem';
  toast.style.background = 'var(--card)';
  toast.style.border = '1px solid var(--border)';
  toast.style.borderRadius = '0.75rem';
  toast.style.boxShadow = '0 10px 25px rgba(15, 23, 42, 0.15)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
