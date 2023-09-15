import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CityPipe } from '@flight-demo/shared/ui-common';
import { Flight, injectTicketsFeature } from '@flight-demo/tickets/domain';
import { FlightCardComponent } from '../flight-card/flight-card.component';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  imports: [CommonModule, FormsModule, CityPipe, FlightCardComponent],
})
export class FlightSearchComponent {
  protected ticketsFeature = injectTicketsFeature();

  from = signal('Graz');
  to = signal('Hamburg');
  selectedFlight: Flight | undefined;
  lazyFrom$ = toObservable(this.from).pipe(
    debounceTime(300)
  );
  lazyFrom = toSignal(this.lazyFrom$, {
    initialValue: this.from()
  });
  flightRoute = computed(() => 'From ' + this.lazyFrom() + ' to ' + this.to() + '.');

  basket: Record<number, boolean> = {
    3: true,
    5: true,
  };

  constructor() {
    effect(() => {
      this.ticketsFeature.flights();
      console.log(this.ticketsFeature.bookingDetails());
    });
  }

  select(f: Flight): void {
    this.selectedFlight = { ...f };
  }
}
