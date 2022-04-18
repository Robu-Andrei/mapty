import workoutsListView from './workoutsListView.js';
import View from './View.js';
import 'leaflet';
import icon from 'url:../../img/icon.png';

class MapView extends View {
  _mapZoomLevel = 14;
  _map = {};
  _errMsg1 = 'Could not get your position ⚠️';
  _errMsg2 = 'Allow location access to find your position';

  addHandlerMoveToPopup(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const workoutEl = e.target.closest('.workout');
      if (!workoutEl) return;
      handler(workoutEl);
    });
  }

  loadMap(position, workouts) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this._map = L.map('map').setView(coords, this._mapZoomLevel);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this._map);

    // Handling click on map
    this._map.on('click', workoutsListView.showForm.bind(workoutsListView));

    // Render marker after loading a map
    workouts.forEach(work => this.renderWorkoutMarker(work));
  }

  renderWorkoutMarker(workout) {
    const myIcon = L.icon({
      iconUrl: `${icon}`,
      iconSize: [46, 46],
      iconAnchor: [22, 94],
      popupAnchor: [0, -90],
      className: `${workout.id}`,
    });

    L.marker(workout.coords, { icon: myIcon })
      .addTo(this._map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup ${workout.id}`
      }))
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }

  moveToPopup(workout) {
    this._map.setView(workout.coords, this._mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1.5
      }
    });
  }
}

export default new MapView();