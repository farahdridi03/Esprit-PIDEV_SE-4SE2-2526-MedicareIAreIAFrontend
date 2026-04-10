import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const diff = (Date.now() - new Date(value).getTime()) / 60000; // minutes
    if (diff < 1)   return 'Just now';
    if (diff < 60)  return `${Math.floor(diff)} min ago`;
    const h = Math.floor(diff / 60);
    if (h < 24)     return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}
