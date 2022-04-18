import { getJson, getDataFromNewDate } from './helpers';

export const state = {
  workouts: [],
  workoutsForm: [],
  formData: {},
};

class Workout {
  id = String(Date.now()).slice(-10);
  address = [];

  constructor(coords, distance, duration, dateForSort) {
    this.coords = coords;      // [lat, lng]
    this.distance = distance;  // in km
    this.duration = duration;  // in min
    this.dateForSort = dateForSort;
  }

  _formatDateAndTime() {
    const [month, date, hour, min, sec] = getDataFromNewDate();
    return `${month} ${date} - ${hour}:${min}:${sec}`;
  }

  _setDescription() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${this._formatDateAndTime()}`;
  }
};

export class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence, dateForSort) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.dateForSort = dateForSort;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;     // min/km
  }
};

export class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain, dateForSort) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.dateForSort = dateForSort;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);   // km/h
  }
};

export const findAddress = async function (workout) {
  try {
    const latitude = workout.coords[0];
    const longitude = workout.coords[1];

    const data = await getJson(latitude, longitude);

    // E.g. If road = DN65, then I don't add it in the address 
    if (data.address.road && data.address.road.length > 4) workout.address.push(data.address.road);
    if (data.address.suburb) workout.address.push(data.address.suburb);
    workout.address.push(data.address.city);
    workout.address.push(data.address.county);
  }
  catch (err) {
    throw err;
  }
}

export const setLocalStorage = function (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Get workouts array from local storage
export const getWorkoutsArray = function () {
  const data = JSON.parse(localStorage.getItem('workouts'));
  if (!data) return;
  state.workouts = data;
}

// Get form data for edit from local storage
export const getFormData = function () {
  const data = JSON.parse(localStorage.getItem('workoutsForm'));
  if (!data) return;
  state.workoutsForm = data;
}

export const createWorkNumber = function () {
  state.workouts.forEach(function (workout, count) {
    workout.nrWork = String(count + 1);
  });
}
