import { interpolateNumber } from 'd3-interpolate';
import { event as currentEvent, select, selectAll } from 'd3-selection';
import { transition } from 'd3-transition';
import 'scrollingelement';
import throttle from 'lodash.throttle';

function scrollTopTween(scrollTo) {
  return () => {
    const i = interpolateNumber(document.scrollingElement.scrollTop, scrollTo);
    return (t) => {
      document.scrollingElement.scrollTop = i(t);
    }; 
  };
}

function scrollToSection(sectionName) {
  select('body')
    .transition()
    .duration(1000)
    .tween('scrolltosection', scrollTopTween(select(`#${sectionName}`).node().offsetTop))
    .on('end', () => document.location.hash = sectionName);
}

function closestSection() {
  const scrollTop = document.scrollingElement.scrollTop;
  let closest;
  selectAll('.home-section').each((d, i, nodes) => {
    const section = nodes[i];
    if (!closest || section.offsetTop - 150 < scrollTop) {
      closest = section;
    }
  });
  return closest;
}

function updateNavPosition() {
  const section = closestSection().id;
  selectAll('.main-menu a').classed('active', false);
  select(`.main-menu-link[data-section="${section}"]`).classed('active', true);
  select('.main-menu')
    .classed('dark-background', section === 'contact') ;
}

var currentSlide;
var slideCount;

function openModal(project) {
  select('body').classed('modal-open', true);
  select('.project-modal')
    .classed('open', true)
    .style('top', `${window.scrollY}px`);
  select('.project-modal-inner')
    .append(() => project.select('.project-modal-contents').node().cloneNode(true));

  selectAll('.project-modal-inner .project-modal-contents-slide')
    .style('display', 'none');

  select('.project-modal-inner .project-modal-contents-slide')
    .style('display', 'block');

  currentSlide = 0;
  slideCount = selectAll('.project-modal .project-modal-contents-slide').size();
}

function closeModal() {
  select('body').classed('modal-open', false);
  select('.project-modal')
    .classed('open', false);

  select('.project-modal-inner .project-modal-contents').remove();
}

function previousProjectSlide() {
  currentSlide--;
  if (currentSlide < 0) {
    currentSlide = slideCount - 1;
  }
  goToSlide(currentSlide);
}

function advanceProjectSlide() {
  currentSlide = (currentSlide + 1) % slideCount;
  goToSlide(currentSlide);
}

function goToSlide(index) {
  const slides = selectAll('.project-modal .project-modal-contents-slide');
  slides.style('display', 'none');
  select(slides.nodes()[currentSlide]).style('display', 'block');
}

function initialize() {
  selectAll('.main-menu-link').on('click', (d, i, nodes) => {
    currentEvent.preventDefault();
    scrollToSection(nodes[i].dataset.section);
  });

  selectAll('.project-grid-item').on('click', (d, i, nodes) => {
    currentEvent.preventDefault();
    openModal(select(nodes[i]));
  });

  select('.project-modal-close').on('click', () => {
    currentEvent.preventDefault();
    closeModal();
  });

  select('.project-modal-background').on('click', closeModal);

  select('.project-modal-previous').on('click', previousProjectSlide);
  select('.project-modal-next').on('click', advanceProjectSlide);

  updateNavPosition();
  window.onscroll = throttle(updateNavPosition, 300);
}

if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'){
  initialize();
}
else {
  document.addEventListener('DOMContentLoaded', initialize);
}
