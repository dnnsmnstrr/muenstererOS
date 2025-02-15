import { browser } from '$app/environment';
import { debug, debugLog } from '$lib/stores/app';

export const isBrowser = typeof document !== "undefined";

export function closeWindow() {
  debugLog('Attempting to close window');
	window.close();
}

export function isBrowserInFullscreen() {
  const isFullscreen = document.fullscreenElement
  // debugLog(`Browser is ${isFullscreen ? 'not' : ''} in fullscreen mode`)
	return isFullscreen
}

export function toggleFullscreen() {
	var elem = document.documentElement;
	if (document.fullscreenEnabled && elem.requestFullscreen) {
		if (isBrowserInFullscreen() && document.exitFullscreen) {
			debugLog('Exiting fullscreen');
			document.exitFullscreen();
		} else {
			debugLog('Entering fullscreen');
			elem.requestFullscreen();
		}
	} else {
		debugLog('Your browser cannot use fullscreen right now');
	}
}

export function printPage() {
  debugLog('Opening print dialog');
  setTimeout(() => {
    // give the menu a moment to close
    window.print();
  }, 10);
}

export function reloadPage() {
  debugLog('Reloading page');
  window.location.reload();
}

export function bookmark(title: string, url: string) {
  debugLog('Bookmarking', title, url);
	if (window?.sidebar) {
		// Firefox
		window.sidebar.addPanel(title, url, '');
	} else if (window.opera && window.print) {
		// Opera
		var elem = document.createElement('a');
		elem.setAttribute('href', url);
		elem.setAttribute('title', title);
		elem.setAttribute('rel', 'sidebar');
		elem.click(); //this.title=document.title;
	} else if (document.all) {
		// ie
		window.external.AddFavorite(url, title);
	}
}

function getPlatform() {
    if (!browser) {
      return 'unknown';
    }
    // 2022 way of detecting. Note : this userAgentData feature is available only in secure contexts (HTTPS)
    if (typeof navigator.userAgentData !== 'undefined' && navigator.userAgentData != null) {
        return navigator.userAgentData.platform;
    }
    // Deprecated but still works for most of the browser
    if (typeof navigator.platform !== 'undefined') {
        if (typeof navigator.userAgent !== 'undefined' && /android/.test(navigator.userAgent.toLowerCase())) {
            // android device’s navigator.platform is often set as 'linux', so let’s use userAgent for them
            return 'android';
        }
        return navigator.platform;
    }
    return 'unknown';
}

export const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
	},
	any: function () {
    if (!browser) {
      return false;
    }
		return (
			isMobile.Android() ||
			isMobile.BlackBerry() ||
			isMobile.iOS() ||
			isMobile.Opera() ||
			isMobile.Windows()
		);
	}
};

export function isAppleDevice() {
  let platform = getPlatform().toLowerCase();
  let isOSX = /mac/.test(platform);
  let isIOS = ['iphone', 'ipad', 'ipod'].indexOf(platform) >= 0;
  return isOSX || isIOS; // Apple device (desktop or iOS)
}

export function waitForElementToDisplay<T extends Element = Element>(
	selector: string,
	callback: (element: T) => void,
	checkFrequencyInMs = 1000,
	timeoutInMs = 5000
) {
	const startTimeInMs = Date.now();
	(function loopSearch() {
		const element = document.querySelector<T>(selector);
		if (element != null) {
			callback(element);
			return;
		} else {
			setTimeout(function () {
				if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
				loopSearch();
			}, checkFrequencyInMs);
		}
	})();
}

export const scrollToTop = (selector = 'main') => {
  debugLog('scrolling to top');
  const element = document.querySelector(selector)
  if (element) {
    element.scrollTop = 0;
  }
}

export const scrollToBottom = (selector = 'main') => {
  debugLog('scrolling to bottom');
	const element = document.querySelector(selector);
	if (element) {
		element.scrollTop = element.scrollHeight;
	}
};