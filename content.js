// 페드로 파스칼 이미지 배열 설정
const pedroImages = [
  chrome.runtime.getURL("images/pedro1.jpg"),
  chrome.runtime.getURL("images/pedro2.jpg"),
  chrome.runtime.getURL("images/pedro3.gif"),
  chrome.runtime.getURL("images/pedro4.gif"),
  chrome.runtime.getURL("images/pedro5.gif"),
  chrome.runtime.getURL("images/pedro6.gif"),
  chrome.runtime.getURL("images/pedro7.gif"),
  chrome.runtime.getURL("images/pedro8.jpg"),
  chrome.runtime.getURL("images/pedro9.gif"),
  chrome.runtime.getURL("images/pedro10.gif"),
  chrome.runtime.getURL("images/pedro11.gif"),
  chrome.runtime.getURL("images/pedro12.gif"),
  chrome.runtime.getURL("images/pedro13.gif"),
  chrome.runtime.getURL("images/pedro14.jpg"),
  chrome.runtime.getURL("images/pedro15.gif"),
];

// 이미지 URL 확인용 로그
console.log("페드로 이미지 URLs:", pedroImages);

// 랜덤 이미지 선택 함수
function getRandomPedro() {
  const randomIndex = Math.floor(Math.random() * pedroImages.length);
  const selectedImage = pedroImages[randomIndex];
  console.log("선택된 이미지:", selectedImage); // 디버깅용
  return selectedImage;
}

// 더 정확한 광고 선택자 정의
const adSelectors = [
  "div[class*='advertisement']",
  "div[class*='banner']",
  "div[id*='banner']",
  "div[class*='sponsor']",
  "div[id*='sponsor']",
  "div[class*='ad-']",
  "div[id*='ad-']",
  "ins.adsbygoogle",
  "iframe[id*='google_ads']",
  "[data-ad]",
  "[data-advertisement]",
  ".ad_bottom",
  ".ad_top",
  ".ad_left",
  ".ad_right",
  "#ads",
  "#ad",
  ".advertisement",
  "div[id^='div-gpt-ad']",
  "div[class*='ads_']",
  "div[id*='ads_']",
  ".adsbygoogle",
  "div[class*='ad-container']",
  "div[class*='ad_container']",
  "amp-ad",
  "amp-embed",
  ".i-amphtml-element",
  "amp-sticky-ad",
  "[type='adsense']",
  "div[class*='i-amphtml-ad']",
  "div[id*='i-amphtml-ad']",
  ".wiki-ads",
  ".namu-ads",
  "[class*='wiki-ad']",
  "[id*='wiki-ad']",
  "iframe[src*='ad']",
  "iframe[src*='ads']",
  "iframe[src*='doubleclick']",
  "iframe[src*='advertising']",
  "iframe[id*='google_ads']",
  "iframe[data-ad]",
  "iframe[class*='ad-']",
  "iframe[class*='advertisement']",
  "div[class*='floating-ad']",
  "div[class*='bottom-ad']",
  "div[id*='floating-ad']",
  "div[id*='bottom-ad']"
];

function isLikelyAd(element) {
  // AMP 광고 요소 확인
  if (element.tagName && element.tagName.toLowerCase().startsWith('amp-')) {
    return true;
  }
  
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  // 헤더나 네비게이션 영역 제외
  if (element.closest('header') || element.closest('nav')) {
    return false;
  }
  
  // 최소 크기 확인 (너무 작은 요소 제외)
  if (rect.width < 100 || rect.height < 50) {
    return false;
  }
  
  // 일반적인 광고 크기 확인
  if (rect.width > window.innerWidth * 0.9 || rect.height > window.innerHeight * 0.9) {
    return false;
  }

  return true;
}

// 이미지 교체 시간 관리를 위한 변수
const REFRESH_INTERVAL = 30000; // 30초
let lastReplaced = new Map(); // 각 광고 요소별 마지막 교체 시간 저장

function replaceAds() {
  adSelectors.forEach(selector => {
    const ads = document.querySelectorAll(selector);
    ads.forEach(ad => {
      if (isLikelyAd(ad)) {
        const now = Date.now();
        const lastTime = lastReplaced.get(ad) || 0;
        
        if (now - lastTime >= REFRESH_INTERVAL) {
          // iframe인 경우 부모 요소의 크기를 사용
          const targetElement = ad.tagName.toLowerCase() === 'iframe' ? ad.parentElement : ad;
          const width = targetElement.offsetWidth;
          const height = targetElement.offsetHeight;
          
          const img = document.createElement('img');
          img.src = getRandomPedro();
          img.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 9999;
          `;
          
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `
            position: relative;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
          `;
          
          wrapper.appendChild(img);
          targetElement.parentNode.insertBefore(wrapper, targetElement);
          targetElement.style.display = 'none';
          
          lastReplaced.set(ad, now);
        }
      }
    });
  });
}

// 스크롤 이벤트 리스너 추가
let isScrolling;
window.addEventListener('scroll', () => {
  // 스크롤 중에는 교체 작업 중단
  window.clearTimeout(isScrolling);
  isScrolling = setTimeout(() => {
    replaceAds();
  }, 100);
}, false);

// AMP 광고를 위한 빠른 대응
function handleAMPAds() {
  const ampObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'AMP-AD' || 
              node.classList?.contains('i-amphtml-element') ||
              node.id?.includes('google_ads')) {
            // AMP 광고 요소 발견 시 즉시 교체
            replaceAds();
          }
        });
      }
    });
  });

  // AMP 관련 요소 감시 시작
  ampObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 페이지 로드 시점에 따른 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    replaceAds();
    handleAMPAds();
  });
} else {
  replaceAds();
  handleAMPAds();
}

// 추가적인 동적 변경 감지를 위한 MutationObserver
const pageObserver = new MutationObserver(debounce(() => {
  replaceAds();
}, 1000));

pageObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// 디바운스 함수
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// MutationObserver에 디바운스 적용
const debouncedReplaceAds = debounce(replaceAds, 1000);

// 동적 콘텐츠를 위한 MutationObserver 설정
const observer = new MutationObserver(debouncedReplaceAds);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// iframe이 동적으로 추가되는 것을 감지
const observeIframes = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IFRAME') {
          replaceAds();
        }
      });
    }
  });
});

observeIframes.observe(document.body, {
  childList: true,
  subtree: true
});
