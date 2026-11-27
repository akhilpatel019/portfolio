/* Editorial selected-work interaction for the portfolio. */
(() => {
  'use strict';
  const sourceGrid = document.querySelector('.work-grid');
  const stage = document.querySelector('#selectedWorkStage');
  if (!sourceGrid || !stage) return;

  const cards = Array.from(sourceGrid.querySelectorAll('.project-card'));
  if (!cards.length) return;

  const projects = cards.map((card, index) => {
    const image = card.querySelector('.project-image img');
    const icon = card.querySelector('.project-image i');
    const title = card.querySelector('.project-content h3')?.textContent.trim() || `Project ${index + 1}`;
    const description = card.querySelector('.project-content p')?.textContent.trim() || '';
    const category = card.querySelector('.project-category')?.textContent.trim() || 'Website';
    const link = card.querySelector('.project-link');
    return {
      index,
      title,
      description,
      category,
      image: image?.getAttribute('src') || '',
      alt: image?.getAttribute('alt') || title,
      icon: icon?.className || 'ri-window-line',
      url: link?.href || '#',
      linkText: link?.textContent.trim().replace(/\s+/g, ' ') || 'View project'
    };
  });

  stage.innerHTML = `
    <div class="selected-feature" aria-label="Featured project">
      <div class="selected-feature-visual">
        <div class="selected-feature-media"></div>
        <span class="selected-feature-hint"><i class="ri-cursor-line"></i> Move over the picture</span>
        <span class="selected-feature-index"></span>
      </div>
      <div class="selected-feature-copy">
        <span class="selected-feature-category"></span>
        <h3 class="selected-feature-title"></h3>
        <p class="selected-feature-description"></p>
        <a class="selected-feature-link" target="_blank" rel="noopener noreferrer"></a>
      </div>
    </div>
    <nav class="selected-work-list" aria-label="Choose a project"></nav>`;

  const feature = stage.querySelector('.selected-feature');
  const media = stage.querySelector('.selected-feature-media');
  const number = stage.querySelector('.selected-feature-index');
  const category = stage.querySelector('.selected-feature-category');
  const title = stage.querySelector('.selected-feature-title');
  const description = stage.querySelector('.selected-feature-description');
  const link = stage.querySelector('.selected-feature-link');
  const list = stage.querySelector('.selected-work-list');
  let imageSwapTimer = 0;

  projects.forEach(project => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selected-work-item';
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="selected-work-number">${String(project.index + 1).padStart(2, '0')}</span><span class="selected-work-name"></span><i class="ri-arrow-right-up-line" aria-hidden="true"></i>`;
    button.querySelector('.selected-work-name').textContent = project.title;
    button.addEventListener('click', () => selectProject(project.index));
    list.appendChild(button);
  });

  function selectProject(index) {
    const project = projects[index];
    const oldImage = media.querySelector('img');
    window.clearTimeout(imageSwapTimer);
    if (oldImage) oldImage.classList.add('is-leaving');
    imageSwapTimer = window.setTimeout(() => {
      media.replaceChildren();
      if (project.image) {
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.alt;
        img.loading = index === 0 ? 'eager' : 'lazy';
        media.appendChild(img);
      } else {
        const icon = document.createElement('i');
        icon.className = `selected-feature-icon ${project.icon}`;
        icon.setAttribute('aria-hidden', 'true');
        media.appendChild(icon);
      }
      media.dataset.project = String(index + 1);
    }, oldImage ? 160 : 0);
    number.textContent = `${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    category.textContent = project.category;
    title.textContent = project.title;
    description.textContent = project.description;
    link.href = project.url;
    link.innerHTML = `${project.linkText} <i class="ri-arrow-up-right-line" aria-hidden="true"></i>`;
    list.querySelectorAll('.selected-work-item').forEach((button, itemIndex) => {
      const active = itemIndex === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    feature.dataset.active = String(index);
  }

  media.addEventListener('pointermove', event => {
    const image = media.querySelector('img');
    if (!image || event.pointerType === 'touch') return;
    const rect = media.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    image.style.transform = `scale(1.055) translate(${x * -9}px, ${y * -7}px)`;
  }, { passive: true });
  media.addEventListener('pointerleave', () => {
    const image = media.querySelector('img');
    if (image) image.style.transform = '';
  }, { passive: true });

  selectProject(0);
  sourceGrid.hidden = true;
  sourceGrid.setAttribute('aria-hidden', 'true');
  stage.classList.add('is-ready');
})();
