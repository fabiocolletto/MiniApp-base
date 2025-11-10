(function(window, document){
  'use strict';

  var instances = new Set();
  var registry = new WeakMap();

  function t(key, fallback, params){
    if(typeof window.$t === 'function'){
      try{
        var translated = window.$t(key, params);
        if(typeof translated === 'string' && translated && translated !== key){
          return translated;
        }
      }catch(_){ }
    }
    if(typeof fallback === 'string' && params && fallback.indexOf('{{') !== -1){
      return fallback.replace(/{{(\w+)}}/g, function(_, token){
        return Object.prototype.hasOwnProperty.call(params, token) ? params[token] : '';
      });
    }
    return typeof fallback === 'string' ? fallback : key;
  }

  function parsePerView(value){
    var defaults = [1, 2, 3, 4, 5];
    if(!value){
      return defaults;
    }
    var parts = String(value).split(/[\s,]+/).filter(Boolean);
    var result = defaults.slice();
    for(var i = 0; i < parts.length && i < result.length; i++){
      var num = parseInt(parts[i], 10);
      if(Number.isFinite(num) && num > 0){
        result[i] = num;
      }
    }
    for(var j = 1; j < result.length; j++){
      if(result[j] < result[j - 1]){
        result[j] = result[j - 1];
      }
    }
    return result;
  }

  function resolvePerView(instance){
    var values = instance.perView;
    var width = window.innerWidth || document.documentElement.clientWidth || 0;
    if(width >= 1280) return values[4];
    if(width >= 1024) return values[3];
    if(width >= 768) return values[2];
    if(width >= 480) return values[1];
    return values[0];
  }

  function getFirstVisibleIndex(instance){
    var viewport = instance.viewport;
    var total = instance.items.length;
    if(total === 0){
      return 0;
    }
    var scrollLeft = viewport.scrollLeft;
    for(var i = 0; i < total; i++){
      var slide = instance.items[i];
      if(!slide) continue;
      if((slide.offsetLeft + slide.offsetWidth) > scrollLeft + 1){
        var maxStart = Math.max(0, total - (instance.currentPerView || 1));
        return Math.min(i, maxStart);
      }
    }
    return Math.max(0, total - (instance.currentPerView || 1));
  }

  function scrollToIndex(instance, index){
    if(!instance.items.length){
      return;
    }
    var maxIndex = instance.items.length - 1;
    var targetIndex = Math.max(0, Math.min(index, maxIndex));
    var slide = instance.items[targetIndex];
    if(!slide){
      return;
    }
    var left = slide.offsetLeft;
    try{
      instance.viewport.scrollTo({ left: left, behavior: 'smooth' });
    }catch(_){
      instance.viewport.scrollLeft = left;
    }
  }

  function scrollByStep(instance, direction){
    if(!instance.items.length){
      return;
    }
    var step = instance.currentPerView || 1;
    var total = instance.items.length;
    var start = getFirstVisibleIndex(instance);
    if(direction > 0){
      var maxStart = Math.max(0, total - step);
      scrollToIndex(instance, Math.min(maxStart, start + step));
    }else{
      scrollToIndex(instance, Math.max(0, start - step));
    }
  }

  function updateStatus(instance){
    if(!instance.status){
      return;
    }
    var total = instance.items.length;
    if(!total){
      instance.status.textContent = '';
      instance.status.setAttribute('aria-hidden', 'true');
      return;
    }
    var step = instance.currentPerView || 1;
    var start = getFirstVisibleIndex(instance);
    var from = Math.min(total, start + 1);
    var to = Math.min(total, start + step);
    instance.status.textContent = t('carousel.status', '{{from}}–{{to}} de {{total}}', {
      from: from,
      to: to,
      total: total
    });
    instance.status.removeAttribute('aria-hidden');
  }

  function updateControls(instance){
    var total = instance.items.length;
    var step = instance.currentPerView || 1;
    var viewport = instance.viewport;
    var start = getFirstVisibleIndex(instance);
    var maxStart = Math.max(0, total - step);
    var hasOverflow = !!viewport && (viewport.scrollWidth - viewport.clientWidth) > 1;
    var shouldHide = !hasOverflow || total <= step;
    if(instance.prevButton){
      instance.prevButton.hidden = shouldHide;
      instance.prevButton.disabled = shouldHide || start <= 0;
      if(shouldHide){
        instance.prevButton.setAttribute('aria-hidden', 'true');
      }else{
        instance.prevButton.removeAttribute('aria-hidden');
      }
    }
    if(instance.nextButton){
      instance.nextButton.hidden = shouldHide;
      instance.nextButton.disabled = shouldHide || start >= maxStart;
      if(shouldHide){
        instance.nextButton.setAttribute('aria-hidden', 'true');
      }else{
        instance.nextButton.removeAttribute('aria-hidden');
      }
    }
  }

  function onScroll(instance){
    if(instance._scrollFrame){
      cancelAnimationFrame(instance._scrollFrame);
    }
    instance._scrollFrame = requestAnimationFrame(function(){
      instance._scrollFrame = null;
      updateStatus(instance);
      updateControls(instance);
    });
  }

  function attachEvents(instance){
    instance.viewport.addEventListener('scroll', function(){
      onScroll(instance);
    }, { passive: true });

    instance.viewport.addEventListener('keydown', function(event){
      if(event.defaultPrevented) return;
      var key = event.key;
      if(key === 'ArrowLeft'){
        event.preventDefault();
        scrollByStep(instance, -1);
      }else if(key === 'ArrowRight'){
        event.preventDefault();
        scrollByStep(instance, 1);
      }else if(key === 'Home'){
        event.preventDefault();
        scrollToIndex(instance, 0);
      }else if(key === 'End'){
        event.preventDefault();
        var last = Math.max(0, instance.items.length - (instance.currentPerView || 1));
        scrollToIndex(instance, last);
      }
    });

    if(instance.prevButton){
      instance.prevButton.addEventListener('click', function(){
        scrollByStep(instance, -1);
      });
    }
    if(instance.nextButton){
      instance.nextButton.addEventListener('click', function(){
        scrollByStep(instance, 1);
      });
    }
  }

  function createControl(direction){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'carousel-control carousel-control--' + direction;
    var labelKey = direction === 'prev' ? 'carousel.prev' : 'carousel.next';
    var fallback = direction === 'prev' ? 'Anterior' : 'Próximo';
    btn.setAttribute('aria-label', t(labelKey, fallback));
    btn.setAttribute('data-i18n-attr', 'aria-label:' + labelKey);
    var icon = document.createElement('span');
    icon.className = 'carousel-control-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = direction === 'prev' ? '‹' : '›';
    btn.appendChild(icon);
    return btn;
  }

  function buildStructure(container){
    var perView = parsePerView(container.getAttribute('data-carousel-per-view'));
    var labelKey = container.getAttribute('data-carousel-label-key') || '';
    var label = container.getAttribute('data-carousel-label') || container.getAttribute('aria-label') || '';
    var children = Array.from(container.children).filter(function(node){
      return node && node.nodeType === 1;
    });

    var viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('role', 'group');
    viewport.setAttribute('aria-roledescription', 'carousel');
    if(label){
      viewport.setAttribute('aria-label', label);
    }
    if(labelKey){
      viewport.setAttribute('data-i18n-attr', 'aria-label:' + labelKey);
    }

    var track = document.createElement('div');
    track.className = 'carousel-track';
    track.setAttribute('role', 'list');

    children.forEach(function(child){
      var slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.setAttribute('role', 'listitem');
      slide.appendChild(child);
      track.appendChild(slide);
    });

    viewport.appendChild(track);

    var status = document.createElement('div');
    status.className = 'carousel-status u-sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-hidden', 'true');

    var instance = {
      container: container,
      viewport: viewport,
      track: track,
      status: status,
      perView: perView,
      currentPerView: perView[0],
      prevButton: null,
      nextButton: null,
      items: []
    };

    instance.prevButton = createControl('prev');
    instance.nextButton = createControl('next');

    container.innerHTML = '';
    container.setAttribute('data-carousel-bound', 'true');
    container.appendChild(instance.prevButton);
    container.appendChild(viewport);
    container.appendChild(instance.nextButton);
    container.appendChild(status);

    instance.items = Array.from(track.children);

    attachEvents(instance);
    registry.set(container, instance);
    instances.add(instance);

    updateLayout(instance);

    if(window.I18nManager && typeof window.I18nManager.apply === 'function'){
      window.I18nManager.apply();
    }

    return instance;
  }

  function updateLayout(instance){
    instance.items = Array.from(instance.track.children);
    instance.currentPerView = resolvePerView(instance);
    instance.container.style.setProperty('--carousel-per-view', String(instance.currentPerView));
    updateStatus(instance);
    updateControls(instance);
  }

  function mount(container){
    if(!container){
      return null;
    }
    if(registry.has(container)){
      var existing = registry.get(container);
      updateLayout(existing);
      return existing;
    }
    return buildStructure(container);
  }

  function refresh(container){
    if(!container){
      return;
    }
    var instance = registry.get(container);
    if(!instance){
      instance = buildStructure(container);
    }else{
      updateLayout(instance);
    }
  }

  function refreshAll(){
    instances.forEach(function(instance){
      if(!document.body.contains(instance.container)){
        instances.delete(instance);
        registry.delete(instance.container);
        return;
      }
      updateLayout(instance);
    });
  }

  function scheduleResize(){
    if(scheduleResize._frame){
      cancelAnimationFrame(scheduleResize._frame);
    }
    scheduleResize._frame = requestAnimationFrame(function(){
      scheduleResize._frame = null;
      refreshAll();
    });
  }

  window.addEventListener('resize', scheduleResize, { passive: true });
  window.addEventListener('orientationchange', scheduleResize, { passive: true });

  window.CarouselManager = {
    mount: mount,
    refresh: refresh,
    refreshAll: refreshAll
  };
})(window, document);
