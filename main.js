// main.js - Script principal pour l'initialisation de la page

import { initNavbar, initCountdown } from './navbar.js';
import { initContact } from './contact.js';

async function loadContactSection() {
  try {
    const response = await fetch('./contact.html');
    const html = await response.text();
    const container = document.getElementById('contact-container');
    if (container) {
      container.innerHTML = html;
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la section contact:', error);
  }
}

function initVolunteerForm() {
  const form = document.getElementById('volunteer-form');
  if (!form) return;

  const feedback = form.querySelector('.form-feedback');
  const pendingClass = 'is-pending';
  const successClass = 'is-success';
  const errorClass = 'is-error';

  const setFeedback = (message, state) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove(pendingClass, successClass, errorClass);
    if (state) {
      feedback.classList.add(state);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const firstname = String(data.get('firstname') ?? '').trim();
    const lastname = String(data.get('lastname') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    if (!firstname || !lastname || !email) {
      setFeedback('Merci de compléter tous les champs obligatoires.', errorClass);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFeedback('L’adresse e-mail semble invalide. Vérifie ton adresse.', errorClass);
      return;
    }

    setFeedback('Inscription en cours…', pendingClass);

    window.setTimeout(() => {
      setFeedback(`Merci ${firstname} ! On revient vers toi très vite.`, successClass);
      form.reset();
    }, 1100);
  });
}

function initSmoothAnchors() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  anchors.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

async function init() {
  initNavbar();
  initCountdown();
  initSmoothAnchors();
  initVolunteerForm();

  await loadContactSection();
  initContact();
}

document.addEventListener('DOMContentLoaded', init);