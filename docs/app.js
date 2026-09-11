(() => {
  'use strict';
  const pets = {
    cat: { name: '냥이', alt: '빨간 목걸이를 한 회색 고양이 Pet' },
    dog: { name: '코기', alt: '갈색과 흰색 코기 Pet' },
    rabbit: { name: '더치 토끼', alt: '짙은 회색과 흰색 더치 토끼 Pet' },
    raccoon: { name: '클래식 라쿤', alt: '눈 주변이 검은 클래식 라쿤 Pet' }
  };
  let selected = 'cat';
  let demoTimer;
  let demoState = 'idle';
  const hero = document.getElementById('hero-pet');
  const bubble = document.getElementById('demo-bubble');
  const read = document.getElementById('demo-read');
  const announcement = document.getElementById('demo-announcement');
  function resetDemo() {
    clearTimeout(demoTimer);
    demoState = 'idle';
    bubble.hidden = true;
    read.hidden = false;
    hero.src = `assets/${selected}-idle.png`;
  }
  for (const card of document.querySelectorAll('[data-pet]')) {
    card.addEventListener('click', () => {
      if (!Object.hasOwn(pets, card.dataset.pet)) return;
      selected = card.dataset.pet;
      resetDemo();
      hero.alt = pets[selected].alt;
      document.getElementById('hero-pet-name').textContent = pets[selected].name;
      document.getElementById('selected-name').textContent = pets[selected].name;
      for (const option of document.querySelectorAll('[data-pet]')) {
        const active = option === card;
        option.classList.toggle('selected', active);
        option.setAttribute('aria-pressed', String(active));
      }
    });
  }
  document.getElementById('demo-trigger').addEventListener('click', () => {
    resetDemo();
    demoState = 'unread';
    bubble.hidden = false;
    document.getElementById('demo-text').textContent = '새 메시지가 도착했어요!';
    announcement.textContent = `${pets[selected].name}가 새 메시지를 알려줘요. 읽었어요 버튼으로 다음 반응을 볼 수 있습니다.`;
  });
  read.addEventListener('click', () => {
    if (demoState !== 'unread') return;
    demoState = 'happy';
    read.hidden = true;
    hero.src = `assets/${selected}-happy.png`;
    document.getElementById('demo-text').textContent = '다 읽었네요. 이제 잠깐 쉬어요!';
    announcement.textContent = '읽음 확인 후 Pet이 기뻐하고 다시 쉬어요.';
    demoTimer = setTimeout(resetDemo, 3000);
  });
  window.addEventListener('pagehide', () => clearTimeout(demoTimer));

  const repo = 'Yoodaddy0311/chatpet-releases';
  const status = document.getElementById('release-status');
  const installer = document.getElementById('installer-download');
  const portable = document.getElementById('portable-download');
  const meta = document.getElementById('download-meta');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  function validAsset(asset, tag, name) {
    return asset && asset.state === 'uploaded' && Number.isSafeInteger(asset.size) && asset.size > 1024 &&
      asset.browser_download_url === `https://github.com/${repo}/releases/download/${tag}/${name}`;
  }
  function enable(link, url) {
    link.href = url;
    link.classList.remove('is-disabled');
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
  }
  async function loadRelease() {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal, credentials: 'omit'
      });
      if (response.status === 404) {
        status.textContent = '첫 오픈 베타 배포를 준비하고 있어요.';
        installer.querySelector('span').textContent = '배포 준비 중';
        portable.textContent = '공개되면 여기에서 받을 수 있어요';
        return;
      }
      if (!response.ok) throw new Error('Release lookup unavailable');
      const release = await response.json();
      if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name) || !Array.isArray(release.assets)) throw new Error('Invalid release');
      const setupAsset = release.assets.find(asset => asset.name === 'ChatPetSetup.exe');
      const appAsset = release.assets.find(asset => asset.name === 'ChatPet.exe');
      const setupReady = validAsset(setupAsset, release.tag_name, 'ChatPetSetup.exe');
      const appReady = validAsset(appAsset, release.tag_name, 'ChatPet.exe');
      if (!setupReady || !appReady) throw new Error('Release files are not ready');
      enable(installer, setupAsset.browser_download_url);
      enable(portable, appAsset.browser_download_url);
      installer.querySelector('span').textContent = 'Windows용 다운로드';
      status.textContent = `${release.tag_name} · 지금 다운로드할 수 있어요`;
      meta.textContent = `Windows 64bit · 설치 파일 ${(setupAsset.size / 1024 / 1024).toFixed(0)} MB`;
    } catch {
      status.textContent = '배포 정보를 불러오지 못했어요.';
      installer.querySelector('span').textContent = '배포 페이지에서 확인';
      enable(installer, `https://github.com/${repo}/releases`);
      portable.textContent = '아래 배포 소식에서 파일을 확인해 주세요';
    } finally { clearTimeout(timeout); }
  }
  loadRelease();
})();
