'use strict';

const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const navLinks = [...nav.querySelectorAll('a:not(.button)')];
const mobile = window.matchMedia('(max-width: 850px)');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.querySelector('use').setAttribute('href', `assets/icons.svg#${open ? 'close' : 'menu'}`);
}

header.classList.add('has-menu');
menu.hidden = false;
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
nav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !mobile.matches) return;
  setMenu(false);
  const section = document.querySelector(link.hash);
  if (section) {
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
  }
});
header.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    menu.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
mobile.addEventListener('change', () => setMenu(false));

const navSections = navLinks.map((link) => document.querySelector(link.hash));
let activeSection = -1;
let framePending = false;

function updateNav() {
  const threshold = header.offsetHeight + Math.min(window.innerHeight * .2, 140);
  const index = navSections.reduce((current, section, i) =>
    section.getBoundingClientRect().top <= threshold ? i : current, 0);
  if (index !== activeSection) {
    navLinks.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    activeSection = index;
  }
  framePending = false;
}

function scheduleNavUpdate() {
  if (framePending) return;
  framePending = true;
  window.requestAnimationFrame(updateNav);
}

window.addEventListener('scroll', scheduleNavUpdate, { passive: true });
window.addEventListener('resize', scheduleNavUpdate);
window.addEventListener('load', scheduleNavUpdate);
updateNav();

const filters = document.querySelector('.filters');
const serviceCards = [...document.querySelectorAll('.service-card')];
filters.hidden = false;
filters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  const category = button.dataset.filter;
  for (const filter of filters.querySelectorAll('button')) {
    filter.setAttribute('aria-pressed', String(filter === button));
  }
  for (const card of serviceCards) {
    card.hidden = category !== 'all' && card.dataset.category !== category;
  }
});

const lightbox = document.querySelector('.lightbox');
const photo = lightbox.querySelector('img');
const caption = document.querySelector('#lightbox-caption');
if (typeof lightbox.showModal === 'function') {
  document.querySelector('.gallery-grid').addEventListener('click', (event) => {
    const link = event.target.closest('.gallery-item');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    photo.src = link.href;
    photo.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
    lightbox.showModal();
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target !== lightbox) return;
    const rect = lightbox.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
  });
}

const quoteForm = document.querySelector('#quote-form');
const serviceField = quoteForm.elements.namedItem('service');
quoteForm.hidden = false;
for (const link of document.querySelectorAll('[data-topic]')) {
  link.addEventListener('click', () => { serviceField.value = link.dataset.topic; });
}
for (const field of [quoteForm.elements.namedItem('name'), quoteForm.elements.namedItem('details')]) {
  field.addEventListener('input', () => field.setCustomValidity(''));
}
quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  const name = data.get('name').trim();
  const phone = data.get('phone').trim();
  const details = data.get('details').trim();
  if (!name || !details) {
    const field = quoteForm.elements.namedItem(name ? 'details' : 'name');
    field.setCustomValidity(name ? 'Please describe the work you need.' : 'Please enter your name.');
    field.reportValidity();
    return;
  }
  const message = [
    'Hello CGI Marine, I would like to request a quote.',
    '',
    `Name: ${name}`,
    ...(phone ? [`Phone: ${phone}`] : []),
    `Service: ${data.get('service')}`,
    '',
    `Requirements: ${details}`,
  ].join('\n');
  const whatsapp = new URL('https://wa.me/2348146111799');
  whatsapp.searchParams.set('text', message);
  window.location.assign(whatsapp.href);
});

document.querySelector('#year').textContent = new Date().getFullYear();
