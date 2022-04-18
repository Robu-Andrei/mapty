import sprite from 'url:../../img/sprite.svg';
import View from './View.js';
import { validInputs, allPositive, getDataFromNewDate } from '../helpers.js';
import 'leaflet';

class WorkoutsListView extends View {
  _mapEvent = {};
  curWorkoutEl;
  editMode = false;
  _inputType = document.querySelector('.form__input--type');
  _inputDistance = document.querySelector('.form__input--distance');
  _inputDuration = document.querySelector('.form__input--duration');
  _inputCadence = document.querySelector('.form__input--cadence');
  _inputElevation = document.querySelector('.form__input--elevation');
  _errMsg1 = 'Inputs have to be positive numbers ⚠️';
  _errMsg2 = 'Please delete this workout!';

  constructor() {
    super();
    this._inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  // handler = controlWorkout
  addHandlerForm(handler) {
    this._form.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }

  addHandlerEdit(handler) {
    this._sidebar.addEventListener('click', function (e) {
      const btn = e.target.closest(`.menu__btn--edit`);
      const workoutEl = e.target.closest('.workout');
      if (!btn) return;

      handler(e, workoutEl);
    });
  }

  newWorkout(running, cycling, workouts) {
    // Get data from form
    const type = this._inputType.value;
    const distance = Number(this._inputDistance.value);
    const duration = Number(this._inputDuration.value);
    const cadence = Number(this._inputCadence.value);
    const elevation = Number(this._inputElevation.value);
    const { lat, lng } = this._mapEvent.latlng;

    // Format date for sort
    let [month, date, hour, min, sec] = getDataFromNewDate();
    month = String(new Date().getMonth() + 1);
    const dateForSort = `${month}${date}${hour}${min}${sec}`;
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) this.renderError();
      workout = new running([lat, lng], distance, duration, cadence, dateForSort);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) this.renderError();
      workout = new cycling([lat, lng], distance, duration, elevation, dateForSort);
    }

    // Set the same description when editing a workout. editMode is true when you select the edit button
    if (this.editMode) {
      workout.description = this.curWorkoutEl.querySelector('.workout__title').textContent;
    }

    // Add new object to workouts array
    workouts.push(workout);
  }

  _toggleElevationField() {
    this._inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    this._inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _clearInputFields() {
    this._inputDuration.value = this._inputDistance.value = this._inputCadence.value = this._inputElevation.value = '';
  }

  showForm(mapE) {
    // mapE = event to get location from leaflet map
    this._mapEvent = mapE;
    this._form.classList.remove('form__hidden');
    this._inputDistance.focus();
  }

  hideForm() {
    this._clearInputFields();

    this._form.style.display = 'none';
    this._form.classList.add('form__hidden');
    setTimeout(() => this._form.style.display = 'grid', 1000);
  }

  editWorkout(e, workoutEl, workoutsForm) {
    const menu = e.target.closest('.menu');
    menu.classList.add('menu__hidden');

    this.editMode = true;
    this.curWorkoutEl = workoutEl;

    workoutsForm.forEach(formData => {
      if (formData.id === workoutEl.dataset.id) {
        this._inputType.value = formData.type;
        this._inputDistance.value = formData.distance;
        this._inputDuration.value = formData.duration;

        const coords = {
          latlng: {
            lat: formData.latlng[0],
            lng: formData.latlng[1],
          }
        };
        this.showForm(coords);

        if (formData.type === 'running') this._inputCadence.value = formData.cadence;
        if (formData.type === 'cycling') this._inputElevation.value = formData.elevation;
      }
    });
  }

  saveFormData = function (workout, state) {
    state.formData.type = this._inputType.value;
    state.formData.distance = Number(this._inputDistance.value);
    state.formData.duration = Number(this._inputDuration.value);
    state.formData.id = workout.id;
    state.formData.description = workout.description;
    state.formData.latlng = workout.coords;

    if (state.formData.type === 'running') state.formData.cadence = Number(this._inputCadence.value);
    if (state.formData.type === 'cycling') state.formData.elevation = Number(this._inputElevation.value);

    state.workoutsForm.push(state.formData);
    state.formData = {};
  }

  checkWorkoutElementExist() {
    if (this._parentElement.querySelector('li')) {
      const instruction = document.querySelector('.instruction');
      if (!instruction) return;
      instruction.remove();
    }
  }

  checkAddressExist(workouts) {
    workouts.forEach(work => {
      if (!work.address[0]) {
        let index = workouts.indexOf(work);
        workouts.splice(index, 1);
      }
    });
  }

  renderWorkout(workout) {
    // ADD HTML FOR BOTH
    let markup = this._generateMarkup(workout);

    // ADD HTML BASED ON TYPE
    workout.type === 'running' ? (markup += this._generateMarkupRunning(workout)) : (markup += this._generateMarkupCycling(workout));

    this._form.insertAdjacentHTML('afterend', markup);
  }

  _generateMarkup(workout) {
    return ` 
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <svg class="dots__btn" data-btn="${workout.nrWork}">
              <use href="${sprite}#icon-dots-three-horizontal"></use>
            </svg>
            <div class="menu menu__hidden" data-menu="${workout.nrWork}">
              <ul class="menu__list">
                <li class="menu__btn menu__btn--edit">
                  <svg class="menu__btn--icon">
                    <use href="${sprite}#icon-pencil"></use>
                  </svg>
                  <span>Edit form</span>
                </li>
                <li class="menu__btn menu__btn--delete">
                  <svg class="menu__btn--icon">
                    <use href="${sprite}#icon-trash"></use>
                  </svg>
                  <span>Delete workout</span>
                </li>
              </ul>
            </div>

            <div class="workout__details">
              <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
      `;
  }

  _generateMarkupRunning(workout) {
    return `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
          <div class="workout__details  workout__details--address">
            <span class="workout__icon">📍</span>
            <span class="workout__location">${workout.address[0]},</span>
            <span class="workout__city">${workout.address[1]}</span>
          </div>
        </li>
     `;
  }

  _generateMarkupCycling(workout) {
    return `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
         </div>
          <div class="workout__details workout__details--address">
            <span class="workout__icon">📍</span>
            <span class="workout__location">${workout.address[0]},</span>
            <span class="workout__city">${workout.address[1]}</span>
          </div>
        </li> 
      `;
  }
}

export default new WorkoutsListView();