import { createActionGroup, createFeature, createReducer, emptyProps, on, props, provideState } from '@ngrx/store';
import { Flight } from '../entities/flight';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';


export const ticketsActions = createActionGroup({
  source: 'tickets',
  events: {
    'flights loaded': props<{ flights: Flight[] }>(),
    'flight update': props<{ flight: Flight }>(),
    'flight clear': emptyProps()
  }
});

export interface TicketsState {
  flights: Flight[];
  basket: Record<number, boolean>;
  tickets: unknown;
}

export const intialTicketsState: TicketsState = {
  flights: [],
  basket: {},
  tickets: []
};

export const ticketsFeature = createFeature({
  name: 'tickets',
  reducer: createReducer(
    intialTicketsState,

    on(ticketsActions.flightsLoaded, (state, action) => ({
      ...state,
      flights: action.flights
    })),
  )
});

export function provideTicketsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(ticketsFeature)
  ]);
}
