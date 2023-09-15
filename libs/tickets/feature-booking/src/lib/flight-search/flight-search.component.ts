import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CityPipe } from '@flight-demo/shared/ui-common';
import { Flight, injectTicketsFeature } from '@flight-demo/tickets/domain';
import { FlightCardComponent } from '../flight-card/flight-card.component';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  imports: [CommonModule, FormsModule, CityPipe, FlightCardComponent],
})
export class FlightSearchComponent {
  protected ticketsFeature = injectTicketsFeature();

  from = 'Graz';
  to = 'Hamburg';
  selectedFlight: Flight | undefined;

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
