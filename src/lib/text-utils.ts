export function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function capitalizeFullName(name: string): string {
  if (!name) return name;
  return name
    .trim()
    .split(/\s+/)
    .map(capitalizeWord)
    .join(' ');
}

export function getInitials(name: string, maxChars: number = 2): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0]?.toUpperCase() || '')
    .join('')
    .slice(0, maxChars);
}
