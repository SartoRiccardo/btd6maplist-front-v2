const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${day} ${month} ${year} — ${h} ${ampm}`;
}

export function fromNow(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const relative = now - timestamp;

  const seconds = relative % 60;
  const minutes = Math.floor(relative / 60);
  if (minutes === 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  const hours = Math.floor(relative / (60 * 60));
  if (hours === 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const days = Math.floor(relative / (60 * 60 * 24));
  if (days === 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
