export const getJson = async function (lat, lng) {
  try {
    const response = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=pk.80ef52d1b29d1b14b53da653709c01f1&lat=${lat}&lon=${lng}&normalizeaddress=1&format=json`);

    if (!response.ok) throw new Error(`Location doesn't exist!`);
    const data = await response.json();
    return data;
  }
  catch (err) {
    throw err;
  }
}

export const getDataFromNewDate = function () {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const month = months[new Date().getMonth()];
  const date = String(new Date().getDate()).padStart(2, 0);
  const hour = String(new Date().getHours()).padStart(2, 0);
  const min = String(new Date().getMinutes()).padStart(2, 0);
  const sec = String(new Date().getSeconds()).padStart(2, 0);
  return [month, date, hour, min, sec];
}

export const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));

export const allPositive = (...inputs) => inputs.every(inp => inp > 0);

export const findPopupByClassName = function (popups, workout) {
  // class = leaflet-popup running-popup 3201455437 leaflet-zoom-animated
  const popup = popups.find(pop => `leaflet-popup ${workout.type}-popup ${workout.id} leaflet-zoom-animated` === pop.className);

  return popup;
}

export const findMarkerByClassName = function (markers, workout) {
  const marker = markers.find(mark => mark.className === `leaflet-marker-icon ${workout.id} leaflet-zoom-animated leaflet-interactive`);

  return marker;
}

export const findWorkout = function (workouts, workoutEl) {
  const workout = workouts.find(work => work.id === workoutEl.dataset.id);
  return workout;
};