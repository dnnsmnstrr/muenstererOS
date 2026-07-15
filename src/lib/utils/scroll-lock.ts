const SCROLLABLE_SELECTOR = '[data-command-list]';

/**
 * Locks the document while still allowing the command results to scroll.
 * The touch handler is needed for iOS Safari, where scroll gestures can chain
 * from a fixed dialog to the page behind it.
 */
export function lockCommandPaletteScroll() {
	const body = document.body;
	const root = document.documentElement;
	const scrollY = window.scrollY;
	const previousBodyStyle = body.getAttribute('style');
	const previousRootOverflow = root.style.overflow;
	let touchStartY = 0;

	body.style.position = 'fixed';
	body.style.top = `-${scrollY}px`;
	body.style.width = '100%';
	body.style.overflow = 'hidden';
	root.style.overflow = 'hidden';

	const onTouchStart = (event: TouchEvent) => {
		touchStartY = event.touches[0]?.clientY ?? 0;
	};

	const onTouchMove = (event: TouchEvent) => {
		const target = event.target instanceof Element ? event.target : null;
		const list = target?.closest<HTMLElement>(SCROLLABLE_SELECTOR);

		if (!list) {
			event.preventDefault();
			return;
		}

		const currentY = event.touches[0]?.clientY ?? touchStartY;
		const movingDown = currentY > touchStartY;
		const atTop = list.scrollTop <= 0;
		const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;

		// Stop the gesture at either edge so it cannot scroll the page behind.
		if ((movingDown && atTop) || (!movingDown && atBottom)) event.preventDefault();
	};

	document.addEventListener('touchstart', onTouchStart, { passive: true });
	document.addEventListener('touchmove', onTouchMove, { passive: false });

	return () => {
		document.removeEventListener('touchstart', onTouchStart);
		document.removeEventListener('touchmove', onTouchMove);
		if (previousBodyStyle === null) body.removeAttribute('style');
		else body.setAttribute('style', previousBodyStyle);
		root.style.overflow = previousRootOverflow;
		window.scrollTo(0, scrollY);
	};
}
