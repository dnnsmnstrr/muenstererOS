<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import WindowButtons from './WindowButtons.svelte';
	import * as Card from '$lib/components/ui/card';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import { filePosition } from '$lib/stores/desktop';
	import { goto } from '$app/navigation';

	const minHeight = 300;
	const minWidth = 210;
	const fileSize = 50;
	const padding = 20;
	const breakpoint = 640;

	export let width = 0;
	export let height = 0;

	let dragging = false;
	let resizing = false;
	$: defaultWidth = width < 640 ? minWidth : 390;
	let DraggableWidth = defaultWidth || 250;
	let DraggableHeight = minHeight;
	let DraggableX = -1;
	let DraggableY = -1;
	let initialized = false;

	// Drag state
	let isDraggingWindow = false;
	let isDraggingFile = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let initialX = 0;
	let initialY = 0;

	$: if (width || height) {
		// switch to vertical layout on mobile
		if (width < breakpoint && DraggableWidth > defaultWidth && !dragging) {
			DraggableWidth = minWidth;
			DraggableHeight = minHeight;
		} else if (width > breakpoint && DraggableWidth < defaultWidth && !dragging) {
			DraggableWidth = defaultWidth;
			DraggableHeight = minHeight;
		}

		// initial positioning (only once)
		if (!initialized && width > 0 && height > 0) {
			DraggableX = width / 2 - DraggableWidth / 2;
			DraggableY = height / 3 - DraggableHeight / 2;
			initialized = true;
		}

		// keep window in view while changing window size (but not while dragging)
		if (!isDraggingWindow && !resizing) {
			if (DraggableX + DraggableWidth > width) {
				if (width - DraggableX > minWidth) {
					DraggableWidth = width - DraggableX;
				} else if (width - DraggableWidth - padding > padding) {
					DraggableX = width - DraggableWidth - padding;
				}
			}
			if (DraggableY + DraggableHeight > height) {
				DraggableHeight = height - DraggableHeight;
			}
		}

		// keep file in view
		if (width < $filePosition.x + fileSize) {
			$filePosition.x = width - (fileSize + 20);
		}
	}

	// Window dragging
	function handleWindowPointerDown(e: PointerEvent) {
		e.preventDefault();
		isDraggingWindow = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		initialX = DraggableX;
		initialY = DraggableY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handleWindowPointerMove(e: PointerEvent) {
		if (!isDraggingWindow) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		let newX = initialX + deltaX;
		let newY = initialY + deltaY;

		// Apply bounds
		newX = Math.max(0, Math.min(newX, width - DraggableWidth));
		newY = Math.max(0, Math.min(newY, height - DraggableHeight));

		DraggableX = newX;
		DraggableY = newY;
	}

	function handleWindowPointerUp(e: PointerEvent) {
		isDraggingWindow = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
	}

	// File dragging
	function handleFilePointerDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDraggingFile = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		initialX = $filePosition.x;
		initialY = $filePosition.y;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handleFilePointerMove(e: PointerEvent) {
		if (!isDraggingFile) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		let newX = initialX + deltaX;
		let newY = initialY + deltaY;

		// Apply bounds
		newX = Math.max(0, Math.min(newX, width - fileSize));
		newY = Math.max(0, Math.min(newY, height - fileSize));

		$filePosition.x = newX;
		$filePosition.y = newY;
	}

	function handleFilePointerUp(e: PointerEvent) {
		isDraggingFile = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
	}

	// Window resizing
	function handleResizePointerDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		resizing = true;
		dragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		initialX = DraggableWidth;
		initialY = DraggableHeight;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handleResizePointerMove(e: PointerEvent) {
		if (!resizing) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		let newWidth = initialX + deltaX;
		let newHeight = initialY + deltaY;

		// Apply bounds
		newWidth = Math.max(minWidth, Math.min(newWidth, width - DraggableX));
		newHeight = Math.max(minHeight, Math.min(newHeight, height - DraggableY));

		if (newWidth > defaultWidth) {
			DraggableWidth = newWidth;
		}
		DraggableHeight = newHeight;
		// TODO: enable the following while option is pressed to resize around the center
		// DraggableX = width / 2 - DraggableWidth / 2
		// DraggableY = height / 3 - DraggableHeight / 2
	}

	function handleResizePointerUp(e: PointerEvent) {
		resizing = false;
		dragging = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
	}
</script>

<div class="relative block" style="width:{width}px; height:{height}px;">
	{#if width && height}
		<div
			transition:fade
			class="absolute z-30 block"
			style="left:{DraggableX}px; top:{DraggableY}px; width:{DraggableWidth}px; height:{DraggableHeight}px; user-select: none; touch-action: none;"
		>
			<Card.Root class="mb-0 block h-full w-full">
				<div
					class="absolute left-0 top-0 block h-10 w-full select-none"
					role="application"
					class:cursor-grab={!isDraggingWindow}
					class:cursor-grabbing={isDraggingWindow}
					on:pointerdown={handleWindowPointerDown}
					on:pointermove={handleWindowPointerMove}
					on:pointerup={handleWindowPointerUp}
					on:pointercancel={handleWindowPointerUp}
					on:dblclick={() => {
						DraggableWidth = defaultWidth;
						DraggableHeight = minHeight;
						DraggableX = width / 2 - DraggableWidth / 2;
						DraggableY = height / 3 - DraggableHeight / 2;
					}}
				>
					<WindowButtons />
				</div>
				<div class={cn('flex h-full items-center justify-center', $$props.class)}>
					<slot />
				</div>
				<div
					class="absolute bottom-0 right-0 hidden h-8 w-8 cursor-nwse-resize select-none md:block"
					on:pointerdown={handleResizePointerDown}
					on:pointermove={handleResizePointerMove}
					on:pointerup={handleResizePointerUp}
					on:pointercancel={handleResizePointerUp}
					role="button"
					tabindex="-1"
					aria-label="Resize window"
				></div>
			</Card.Root>
		</div>
	{/if}
	{#if $$slots.file && ($filePosition.x || $filePosition.y)}
		<div
			transition:fade
			class="absolute z-10 block select-none"
			class:cursor-move={!isDraggingFile}
			class:cursor-grabbing={isDraggingFile}
			style="left:{$filePosition.x}px; top:{$filePosition.y}px; width:{fileSize}px; height:{fileSize}px; user-select: none; touch-action: none;"
			draggable="false"
			on:pointerdown={handleFilePointerDown}
			on:pointermove={handleFilePointerMove}
			on:pointerup={handleFilePointerUp}
			on:pointercancel={handleFilePointerUp}
			on:dragstart={(e) => e.preventDefault()}
			role="button"
			tabindex="-1"
			aria-label="Drag file"
		>
			<slot name="file" />
		</div>
	{/if}
</div>
