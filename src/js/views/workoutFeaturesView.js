import 'leaflet';
import View from './View.js';
import workoutsListView from './workoutsListView.js';
import { findPopupByClassName, findMarkerByClassName } from '../helpers.js';

class WorkoutFeaturesView extends View {
  _btnYes = document.querySelector('.yes__btn');
  _sort = document.querySelector('.btn__options--sort');
  _sortOptions = document.querySelector('.sort__options');
  _sortContainer = document.querySelector('.sort__options');
  _errMsg1 = 'Coordinates cannot be accessed ⚠️';
  _errMsg2 = 'Please select another location!';

  constructor() {
    super();
    this._sidebar.addEventListener('click', this._showMenu.bind(this));
    this._sidebar.addEventListener('click', this._hideMenu.bind(this));
    this._sort.addEventListener('click', this._toggleSort.bind(this));
  }

  _toggleSort() {
    this._sortOptions.classList.toggle('sort__options--hidden');
  }

  addHandlerSort(handler) {
    this._sortContainer.addEventListener('click', function (e) {
      handler(e);
    });
  }

  addHandlerDelete(handler) {
    this._sidebar.addEventListener('click', function (e) {
      const btn = e.target.closest(`.menu__btn--delete`);
      const workoutEl = e.target.closest('.workout');
      if (!btn) return;

      handler(workoutEl);
    });
  }

  addHandlerDeleteAllWorkouts(handler) {
    this._btnYes.addEventListener('click', function () {
      handler();
    });
  }

  deleteWorkout(workoutEl, workout, state) {
    let data = state;
    const popups = Array.from(document.querySelectorAll('.leaflet-popup'));
    const markers = Array.from(document.querySelectorAll('.leaflet-marker-icon'));

    const index1 = data.workouts.findIndex(work => work.id === workoutEl.dataset.id);
    const index2 = data.workoutsForm.findIndex(form => form.id === workout.id);

    const popup = findPopupByClassName(popups, workout);
    const marker = findMarkerByClassName(markers, workout);

    workoutEl.style.display = 'none';
    popup.style.display = 'none';
    marker.style.display = 'none';

    state.workouts.splice(index1, 1);
    state.workoutsForm.splice(index2, 1);
  }

  deleteAllWorkouts(state) {
    const workouts = this._parentElement.querySelectorAll('.workout');
    const popups = document.querySelectorAll('.leaflet-popup');
    const markers = document.querySelectorAll('.leaflet-marker-icon');

    workouts.forEach(work => work.style.display = 'none');
    popups.forEach(popup => popup.style.display = 'none');
    markers.forEach(marker => marker.style.display = 'none');

    state.workouts.splice(0, state.workouts.length);
    state.workoutsForm.splice(0, state.workoutsForm.length);
  }

  sortAndRender(e, workouts) {
    const btn = e.target.closest('.sort__btn');
    if (!btn) return;

    let currentDirection = 'descending'; //default 
    const type = btn.dataset.type;

    // get which direction to sort
    const typeValues = workouts.map(workout => workout[type]);
    const sortedAscending = typeValues.slice().sort((a, b) => a - b).join('');
    const sortedDescending = typeValues.slice().sort((a, b) => b - a).join('');

    // compare sortedAscending array with values from #workout array to check how are they sorted
    if (typeValues.join('') === sortedAscending) currentDirection = 'ascending';

    if (typeValues.join('') === sortedDescending) currentDirection = 'descending';

    this._sortArray(workouts, currentDirection, type);

    // clear rendered workouts from sidebar
    this._parentElement.querySelectorAll('.workout').forEach(workout => workout.remove());

    // render list all again sorted
    workouts.forEach(workout => workoutsListView.renderWorkout(workout));
  }

  _sortArray(array, currentDirection, type) {

    // sort opposite to the currentDirection
    if (currentDirection === 'ascending') {
      array.sort((a, b) => b[type] - a[type]);
    }
    if (currentDirection === 'descending') {
      array.sort((a, b) => a[type] - b[type]);
    }
  }

  addInstruction(workouts) {
    const workout = workouts[0];
    if (workout) return;
    if (document.querySelector('.instruction')) return;

    const html = `
      <div class="instruction">
        Click on map to add a workout →
      </div>
    `;
    this._form.insertAdjacentHTML('afterend', html);
  }

  _showMenu(e) {
    const btn = e.target.closest('.dots__btn');
    if (!btn) return;

    const menu = e.target.closest('.workout').querySelector('.menu');
    menu.classList.remove('menu__hidden');
  }

  _hideMenu(e) {
    const menus = this._sidebar.querySelectorAll('.menu');

    menus.forEach((menu) => {
      if (!menu.classList.contains('menu__hidden') && (e.target.tagName !== 'svg' && e.target.tagName !== 'use') && e.target.tagName !== 'SPAN' && (e.target.className !== 'menu__btn menu__btn--edit')) menu.classList.add('menu__hidden');
    });
  }
}

export default new WorkoutFeaturesView();