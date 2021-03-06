import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Dispatcher, Provider, ReducerContainer } from './common';
import { Action } from './actions';
import { AppState } from './types';
import {
  authIdTokenStateReducer, authUserStateReducer, firebaseUserStateReducer,
  graphUserStateReducer,
} from './reducers';


const initialState: AppState = {
  authIdToken: null,
  authUser: null,
  firebaseUser: null,
  graphUsers: [],
  isAuthed: false,
};


@Injectable()
export class Store {
  readonly provider$: Provider<AppState>;

  constructor(
    private dispatcher$: Dispatcher<Action>
  ) {
    this.provider$ = new BehaviorSubject(initialState);
    this.combineReducers();
  }


  private combineReducers(): void {
    ReducerContainer
      .zip<AppState>(...[
        authIdTokenStateReducer(initialState.authIdToken, this.dispatcher$),
        authUserStateReducer(initialState.authUser, this.dispatcher$),
        firebaseUserStateReducer(initialState.firebaseUser, this.dispatcher$),
        graphUserStateReducer(initialState.graphUsers, this.dispatcher$),

        (authIdToken, authUser, firebaseUser, graphUsers): AppState => {
          const obj = { authIdToken, authUser, firebaseUser, graphUsers };
          const isAuthed = !!authIdToken && !!authUser;
          return Object.assign<{}, AppState, {}, {}>({}, initialState, obj, { isAuthed });
        }
      ])
      .subscribe(newState => {
        console.log('newState:', newState);
        this.provider$.next(newState);
      });
  }


  getState(): Observable<AppState> {
    return this.provider$.asObservable()
      // .do(() => console.log('provider'))
      .share();
  }

}
