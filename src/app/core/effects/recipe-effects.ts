import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Router, NavigationExtras } from '@angular/router';
import { Injectable, ChangeDetectionStrategy } from '@angular/core';

import { AppState } from '../models/app-state';
import { RecipeActions } from '../actions/recipe-actions';
import { RecipeService } from '../services/recipe.service';
import { SEARCH_RECIPE, SEARCH_RECIPE_SUCCESS } from '../actions/recipe-actions';

@Injectable()
export class RecipeEffects {
  constructor(
    private actions: Actions,
    private recipeService: RecipeService,
    private recipeActions: RecipeActions,
    private store: Store<AppState>,
    private router: Router
  ) { }

  @Effect()
  searchRecipes$: Observable<Action> = this.actions
    .ofType(SEARCH_RECIPE)
    .map(action => action.payload)
    .do(() => this.store.dispatch(this.recipeActions.setLoading(true)))
    .flatMap(({query, page}) => {
      return this.recipeService.searchRecipes$(query, page)
        .map(res => this.recipeActions.searchRecipeSuccess(res))
        .catch(error => Observable.of(this.recipeActions.searchRecipeFailed(error)))
        .finally(() => this.store.dispatch(this.recipeActions.setLoading(false)));
    });

  @Effect()
  showRecipes$ = this.actions
    .ofType(SEARCH_RECIPE_SUCCESS)
    .map((action: Action) => action.payload)
    .do(data => {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          q: data.query
        }
      };
      this.router.navigate(['/recipes'], navigationExtras);
    }).ignoreElements();
}
