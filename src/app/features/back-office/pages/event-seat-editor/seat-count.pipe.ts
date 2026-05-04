import { Pipe, PipeTransform } from '@angular/core';
import { EventSeat } from '../../../../models/event.model';

@Pipe({
  name: 'seatCount'
})
export class SeatCountPipe implements PipeTransform {
  transform(seats: EventSeat[], status: string): number {
    if (!seats) return 0;
    return seats.filter(s => s.status === status).length;
  }
}
