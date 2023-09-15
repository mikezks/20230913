import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CityPipe } from '@flight-demo/shared/ui-common';
import { Flight, ticketsActions, ticketsFeature } from '@flight-demo/tickets/domain';
import { Store } from '@ngrx/store';
import { FlightCardComponent } from '../flight-card/flight-card.component';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  imports: [CommonModule, FormsModule, CityPipe, FlightCardComponent],
})
export class FlightSearchComponent implements OnInit{
  private store = inject(Store);

  from = 'Graz';
  to = 'Hamburg';
  flights$ = this.store.select(ticketsFeature.selectFlights);
  selectedFlight: Flight | undefined;

  basket: Record<number, boolean> = {
    3: true,
    5: true,
  };

  ngOnInit(): void {
    const bookingDetails = this.store.selectSignal(
      ticketsFeature.selectBookingDetails
    );

    this.flights$.subscribe(() => console.log(bookingDetails()));
  }

  search(): void {
    if (!this.from || !this.to) {
      return;
    }

    // Reset properties
    this.selectedFlight = undefined;

    this.store.dispatch(
      ticketsActions.flightsLoad({
        from: this.from,
        to: this.to
      })
    );
  }

  select(f: Flight): void {
    this.selectedFlight = { ...f };
  }
}
