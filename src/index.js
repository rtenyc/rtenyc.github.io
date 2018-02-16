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

function initialize() {
  selectAll('.main-menu-link').on('click', (d, i, nodes) => {
    currentEvent.preventDefault();
    scrollToSection(nodes[i].dataset.section);
  });

  updateNavPosition();
  window.onscroll = throttle(updateNavPosition, 300);
}

if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'){
  initialize();
}
else {
  document.addEventListener('DOMContentLoaded', initialize);
}
