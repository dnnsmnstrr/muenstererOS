/**
 * Tracks a redirect event using GoatCounter's JavaScript API.
 * Since count.js is loaded asynchronously, this function attempts to wait
 * for the API to load before sending the event. It uses a timeout to prevent
 * hanging if GoatCounter is blocked by an ad-blocker.
 *
 * @param name The name of the redirect (e.g., 'github')
 * @param callback Optional callback to execute after the event has been tracked or skipped
 */
export function trackRedirect(name: string, callback?: () => void) {
	if (typeof window === 'undefined') {
		if (callback) callback();
		return;
	}

	const track = () => {
		const goatcounter = (window as any).goatcounter;
		if (goatcounter && typeof goatcounter.count === 'function') {
			goatcounter.count({
				path: 'redirect-' + name.toLowerCase(),
				title: 'Redirect: ' + name,
				event: true
			});
		}
	};

	// If goatcounter is already loaded, track and execute callback with a safe delay
	if ((window as any).goatcounter && typeof (window as any).goatcounter.count === 'function') {
		track();
		if (callback) {
			setTimeout(callback, 100);
		}
		return;
	}

	// If goatcounter is not yet loaded, wait up to 500ms
	let attempts = 0;
	const interval = setInterval(() => {
		attempts++;
		if ((window as any).goatcounter && typeof (window as any).goatcounter.count === 'function') {
			clearInterval(interval);
			track();
			if (callback) {
				setTimeout(callback, 100);
			}
		} else if (attempts >= 5) { // 500ms timeout
			clearInterval(interval);
			if (callback) callback();
		}
	}, 100);
}
