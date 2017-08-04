'use strict'

const logCont = document.getElementById('login-container');
const resCont = document.getElementById('reset-container');
const regCont = document.getElementById('register-container');

const triggerReset = document.getElementById('trigger-reset');
const triggerRegister = document.getElementById('trigger-register');
const triggerLogin = document.getElementById('trigger-login');

triggerReset.addEventListener('click', toggleReset)
triggerRegister.addEventListener('click', switchForm)
triggerLogin.addEventListener('click', switchForm)

function toggleReset() {
  resCont.classList.toggle('hidden');
}

function switchForm() {
  regCont.classList.toggle('hidden');
  logCont.classList.toggle('hidden');
}