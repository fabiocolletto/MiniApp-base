const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function createSvgElement(tag, attributes) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  Object.entries(attributes).forEach(([attribute, value]) => {
    element.setAttribute(attribute, value);
  });
  return element;
}

export function createPasswordToggleIcon(mode = 'show') {
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  const eyeOutline = createSvgElement('path', {
    d: 'M2.25 12c1.8-4.08 5.74-6.75 9.75-6.75s7.95 2.67 9.75 6.75c-1.8 4.08-5.74 6.75-9.75 6.75S4.05 16.08 2.25 12z',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.append(eyeOutline);

  if (mode === 'show') {
    const iris = createSvgElement('circle', {
      cx: '12',
      cy: '12',
      r: '3.25',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
    });

    const pupil = createSvgElement('circle', {
      cx: '12',
      cy: '12',
      r: '1.5',
      fill: 'currentColor',
    });

    svg.append(iris, pupil);
    return svg;
  }

  const upperLid = createSvgElement('path', {
    d: 'M6.5 6.5C8.3 5.3 10.2 4.75 12 4.75c3.96 0 7.8 2.3 9.75 6.75',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
  });

  const lowerLid = createSvgElement('path', {
    d: 'M17.5 17.5C15.7 18.7 13.8 19.25 12 19.25 8.04 19.25 4.2 16.95 2.25 12.5',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
  });

  const slash = createSvgElement('path', {
    d: 'M4 4l16 16',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
  });

  svg.append(upperLid, lowerLid, slash);

  return svg;
}
