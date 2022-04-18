import * as model from './model.js';
import mapView from './views/mapView.js';
import workoutsListView from './views/workoutsListView.js';
import workoutFeaturesView from './views/workoutFeaturesView.js';
import { findWorkout } from './helpers.js';

import 'leaflet';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Get position from Geo API and load map
const controlMap = function () {
  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(position => mapView.loadMap(position, model.state.workouts), () => mapView.renderError());
}

const createWorkout = async function () {
  try {
    // Create new workout
    workoutsListView.newWorkout(model.Running, model.Cycling, model.state.workouts);

    const workout = model.state.workouts.at(-1);

    // Create the workout number
    model.createWorkNumber();

    // Find the address when I click on the map
    await model.findAddress(workout);

    // Save data from form when edit the workout
    workoutsListView.saveFormData(workout, model.state);
    model.setLocalStorage('workoutsForm', model.state.workoutsForm);

    // Render workout on map as marker
    mapView.renderWorkoutMarker(workout);

    // Render workout on list
    workoutsListView.renderWorkout(workout);

    // Hide form + clear input fields
    workoutsListView.hideForm();

    // If there is a workout in the list, the instruction message disappears
    workoutsListView.checkWorkoutElementExist();

    // If a workout doesn't contain an address, remove it from workouts array. In this way, it will not be saved in the local storage and when I reload the page it will not be rendered in the list.
    workoutsListView.checkAddressExist(model.state.workouts);

    // Set local storage to all workouts
    model.setLocalStorage('workouts', model.state.workouts);
  }
  catch (err) {
    workoutFeaturesView.renderError();
  }
}

const controlWorkout = async function () {
  if (workoutsListView.editMode) {
    await createWorkout();
    controlDelete(workoutsListView.curWorkoutEl);
    workoutsListView.editMode = false;
  }
  else await createWorkout();
}

// Render workouts on the list when the page reloads
const loadWorkouts = function (workouts) {
  if (workouts.length === 0) return;

  workouts.forEach(work => workoutsListView.renderWorkout(work));
}

const controlEdit = function (e, workoutEl) {
  workoutsListView.editWorkout(e, workoutEl, model.state.workoutsForm);
}

const controlDelete = function (workoutEl) {
  const workout = findWorkout(model.state.workouts, workoutEl);
  workoutFeaturesView.deleteWorkout(workoutEl, workout, model.state);

  model.setLocalStorage('workouts', model.state.workouts);
  model.setLocalStorage('workoutsForm', model.state.workoutsForm);
  workoutFeaturesView.addInstruction(model.state.workouts);
}

const controlDeleteAllWorkouts = function () {
  workoutFeaturesView.deleteAllWorkouts(model.state);

  localStorage.removeItem('workouts');
  localStorage.removeItem('workoutsForm');

  workoutFeaturesView.toggleDeleteMessage();
  workoutFeaturesView.addInstruction(model.state.workouts);
}

const controlMoveToPopup = function (workoutEl) {
  const workout = findWorkout(model.state.workouts, workoutEl);
  mapView.moveToPopup(workout);
}

const controlSort = function (e) {
  workoutFeaturesView.sortAndRender(e, model.state.workouts);
  model.setLocalStorage('workouts', model.state.workouts);
}

const init = function () {
  controlMap();
  model.getWorkoutsArray();
  loadWorkouts(model.state.workouts);
  model.getFormData();
  workoutsListView.addHandlerForm(controlWorkout);
  workoutFeaturesView.addInstruction(model.state.workouts);
  mapView.addHandlerMoveToPopup(controlMoveToPopup);
  workoutsListView.addHandlerEdit(controlEdit);
  workoutFeaturesView.addHandlerDelete(controlDelete);
  workoutFeaturesView.addHandlerDeleteAllWorkouts(controlDeleteAllWorkouts);
  workoutFeaturesView.addHandlerSort(controlSort);
}

init();