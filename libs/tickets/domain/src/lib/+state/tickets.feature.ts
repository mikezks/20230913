import { Store, createActionGroup, createFeature, createReducer, createSelector, emptyProps, on, props, provideState } from '@ngrx/store';
import { Actions, createEffect, ofType, provideEffects } from '@ngrx/effects';
import { Flight } from '../entities/flight';
import { EnvironmentProviders, Injectable, inject, makeEnvironmentProviders } from '@angular/core';
import { FlightService } from '../infrastructure/flight.service';
import { map, switchMap } from 'rxjs';


export interface FlightTicket {
  id: number;
  price: number;
  passenger?: Passenger;
  flight?: Flight;
}

export interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  tickets?: FlightTicket[];
}

export const ticketsActions = createActionGroup({
  source: 'tickets',
  events: {
    'flights load': props<{ from: string, to: string }>(),
    'flights loaded': props<{ flights: Flight[] }>(),
    'flight update': props<{ flight: Flight }>(),
    'flight clear': emptyProps()
  }
});

export type PassengerState = Omit<Passenger, 'tickets'> & {
  ticketIds: number[];
}

export type FlightTicketState = Omit<FlightTicket, 'passenger' | 'flight'> & {
  passengerId: number;
  flightId: number;
};

export interface TicketsState {
  flights: Flight[];
  basket: Record<number, boolean>;
  tickets: unknown;

  passengers: Record<number, PassengerState>;
  passengerIds: number[];

  flightTickets: Record<number, FlightTicketState>;
  flightTicketIds: number[];
}

export const intialTicketsState: TicketsState = {
  flights: [],
  basket: {},
  tickets: [],

  passengers: {
    17: { id: 17, firstName: 'John', lastName: 'Doe', ticketIds: [107, 109] },
    24: { id: 24, firstName: 'Jane', lastName: 'Doe', ticketIds: [108, 110] },
  },
  passengerIds: [17, 24],
  flightTickets: {
    107: { id: 107, flightId: 1, passengerId: 17, price: 317 },
    108: { id: 108, flightId: 1, passengerId: 24, price: 317 },
    109: { id: 109, flightId: 2, passengerId: 17, price: 294 },
    110: { id: 110, flightId: 2, passengerId: 24, price: 294 },
  },
  flightTicketIds: [107, 108, 109, 110],
};

export const ticketsFeature = createFeature({
  name: 'tickets',
  reducer: createReducer(
    intialTicketsState,

    on(ticketsActions.flightsLoaded, (state, action) => ({
      ...state,
      flights: action.flights
    })),
  ),
  extraSelectors: ({
    selectFlights,
    selectPassengers,
    selectFlightTickets,
    selectFlightTicketIds
  }) => ({
    selectBookingDetails: createSelector(
      // Selectors
      selectFlights,
      selectPassengers,
      selectFlightTickets,
      selectFlightTicketIds,
      // Projector
      (flights, passengers, tickets, ticketIds) => {
        const ticketDetails = ticketIds.map(
          id => tickets[id]
        );

        const bookingDetails = ticketDetails.map(
          ticketDetails => ({
            flight: flights[ticketDetails.flightId],
            passenger: passengers[ticketDetails.passengerId],
          })
        );

        return bookingDetails;
      }
    )
  })
});

@Injectable({
  providedIn: 'root'
})
export class TicketsEffects {
  private actions = inject(Actions);
  private flightService = inject(FlightService);

  loadFlights$ = createEffect(
    () => this.actions.pipe(
      ofType(ticketsActions.flightsLoad),
      switchMap(action => this.flightService.find(
        action.from,
        action.to
      )),
      map(flights => ticketsActions.flightsLoaded({ flights }))
    )
  );
}

export function provideTicketsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(ticketsFeature),
    provideEffects(TicketsEffects)
  ]);
}

export function injectTicketsFeature() {
  const store = inject(Store);

  return {
    flights: store.selectSignal(ticketsFeature.selectFlights),
    bookingDetails: store.selectSignal(ticketsFeature.selectBookingDetails),
    search: (from: string, to: string) => store.dispatch(
      ticketsActions.flightsLoad({ from, to })
    )
  };
}
