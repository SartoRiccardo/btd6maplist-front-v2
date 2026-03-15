export function intToHex(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}

export function getPositionColor(position: number | null): string | null {
  if (position === 1) return '#ffd54f';
  if (position === 2) return '#e0e0e0';
  if (position === 3) return '#cd7f32';
  return null;
}
