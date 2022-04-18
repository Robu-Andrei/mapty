export default class View {
  _parentElement = document.querySelector('.workouts');
  _sidebar = document.querySelector('.sidebar');
  _form = document.querySelector('.form');
  _errorH3 = document.querySelector('.error__heading');
  _errorText = document.querySelector('.error__text');
  _overlay = document.querySelector('.overlay');
  _windowMessage = document.querySelector('.message');
  _windowError = document.querySelector('.error');
  _btnClose = document.querySelector('.error__btn');
  _btnNo = document.querySelector('.no__btn');
  _btnClearAll = document.querySelector('.btn__options--clear');

  constructor() {
    this._btnNo.addEventListener('click', this.toggleDeleteMessage.bind(this));
    this._btnClearAll.addEventListener('click', this.toggleDeleteMessage.bind(this));
    this._btnClose.addEventListener('click', this.toggleError.bind(this));
  }

  renderError() {
    this._errorH3.innerHTML = this._errMsg1;
    this._errorText.innerHTML = this._errMsg2;
    this.toggleError();
  }

  toggleDeleteMessage() {
    this._overlay.classList.toggle('hidden');
    this._windowMessage.classList.toggle('hidden');
  }

  toggleError() {
    this._overlay.classList.toggle('hidden');
    this._windowError.classList.toggle('hidden');
  }
}
