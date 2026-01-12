<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import WindowButtons from './WindowButtons.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import {
		desktopFiles,
		updateFilePosition,
		dvdBounceActive,
		hideFile,
		renameFile
	} from '$lib/stores/desktop';
	import { goto } from '$app/navigation';
	import { ExternalLink, Trash2, Pencil, FolderOpen } from 'lucide-svelte';
	import File from './File.svelte';
	import { debugLog } from '$lib/stores/app';

	const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute in milliseconds

	const minHeight = 300;
	const minWidth = 200;
	const fileSize = 60;
	const breakpoint = 640;

	let {
		width = 0,
		height = 0,
		class: className
	}: {
		width?: number;
		height?: number;
		class?: string;
	} = $props();

	let dragging = $state(false);
	let resizing = $state(false);
	let defaultWidth = $derived(width < 640 ? minWidth : 400);
	let DraggableWidth = $state(400);
	let DraggableHeight = $state(minHeight);
	let DraggableX = $state(-1);
	let DraggableY = $state(-1);
	let initialized = $state(false);
	let isMaximized = $state(false);

	// Store previous state for restore
	let previousWidth = 400;
	let previousHeight = minHeight;
	let previousX = -1;
	let previousY = -1;

	// Drag state
	let isDraggingWindow = false;
	let draggingFileId: string | null = null;
	let dragStartX = 0;
	let dragStartY = 0;
	let initialX = 0;
	let initialY = 0;
	let hasDragged = false;
	const dragThreshold = 5; // pixels to move before considering it a drag

	// Maximize/restore function
	function toggleMaximize() {
		console.log('maximize toggle');
		if (isMaximized) {
			// Restore previous size and position
			DraggableWidth = previousWidth;
			DraggableHeight = previousHeight;
			DraggableX = previousX;
			DraggableY = previousY;
			isMaximized = false;
		} else {
			// Save current state
			previousWidth = DraggableWidth;
			previousHeight = DraggableHeight;
			previousX = DraggableX;
			previousY = DraggableY;
			// Maximize to full viewport
			DraggableWidth = width;
			DraggableHeight = height - 120; // leave space for dock
			DraggableX = 0;
			DraggableY = 0;
			isMaximized = true;
		}
	}

	// DVD Bounce animation
	let bounceAnimationId: number | null = null;
	let velocityX = 2;
	let velocityY = 2;

	// Inactivity timer for auto-starting DVD bounce
	let inactivityTimer: number | null = null;
	let isManualBounce = $state(false); // Track if bounce was manually activated

	let lastWidth = $state(0);
	let lastHeight = $state(0);

	$effect(() => {
		// Only run when width or height actually changes from external source
		if (width === lastWidth && height === lastHeight) return;

		const widthChanged = width !== lastWidth;
		const heightChanged = height !== lastHeight;

		lastWidth = width;
		lastHeight = height;

		// switch to vertical layout on mobile
		if (widthChanged) {
			if (width < breakpoint && DraggableWidth > defaultWidth && !dragging) {
				DraggableWidth = minWidth;
				DraggableHeight = minHeight;
			} else if (width > breakpoint && DraggableWidth < defaultWidth && !dragging) {
				DraggableWidth = defaultWidth;
				DraggableHeight = minHeight;
			}
		}

		// initial positioning (only once)
		if (!initialized && width > 0 && height > 0) {
			DraggableWidth = defaultWidth;
			DraggableX = width / 2 - DraggableWidth / 2;
			DraggableY = height / 3 - DraggableHeight / 2;
			initialized = true;
		}

		// keep window in view while changing window size
		if (widthChanged && DraggableX + DraggableWidth > width) {
			const availableWidth = width - DraggableX;
			if (availableWidth >= minWidth) {
				// Can fit at current position, shrink width
				DraggableWidth = availableWidth;
			} else {
				// Can't fit, move left to fit minWidth
				DraggableX = Math.max(0, width - minWidth);
				DraggableWidth = minWidth;
			}
		}
		if (heightChanged && DraggableY + DraggableHeight > height) {
			const availableHeight = height - DraggableY;
			if (availableHeight >= minHeight) {
				// Can fit at current position, shrink height
				DraggableHeight = availableHeight;
			} else {
				// Can't fit, move up to fit minHeight
				DraggableY = Math.max(0, height - minHeight);
				DraggableHeight = minHeight;
			}
		}
	});

	// Window dragging
	function handleWindowPointerDown(e: PointerEvent) {
		// Check if the maximize button was clicked
		const target = e.target as HTMLElement;
		const maximizeButton = target.closest('[data-window-action="maximize"]');
		if (maximizeButton) {
			toggleMaximize();
			return;
		}
		e.preventDefault();

		// Disable bounce animation when user interacts with window
		if ($dvdBounceActive) {
			dvdBounceActive.set(false);
		}

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

	// DVD Bounce animation
	function startDvdBounce() {
		if (bounceAnimationId) return; // Already running

		const animate = () => {
			if (!$dvdBounceActive) {
				bounceAnimationId = null;
				return;
			}

			// Update position
			DraggableX += velocityX;
			DraggableY += velocityY;

			// Check horizontal bounds and bounce
			if (DraggableX <= 0) {
				DraggableX = 0;
				velocityX = Math.abs(velocityX);
			} else if (DraggableX + DraggableWidth >= width) {
				DraggableX = width - DraggableWidth;
				velocityX = -Math.abs(velocityX);
			}

			// Check vertical bounds and bounce
			if (DraggableY <= 0) {
				DraggableY = 0;
				velocityY = Math.abs(velocityY);
			} else if (DraggableY + DraggableHeight >= height) {
				DraggableY = height - DraggableHeight;
				velocityY = -Math.abs(velocityY);
			}

			bounceAnimationId = requestAnimationFrame(animate);
		};
		debugLog('Starting DVD Bounce');

		bounceAnimationId = requestAnimationFrame(animate);
	}

	$effect(() => {
		if ($dvdBounceActive) {
			startDvdBounce();
		}

		return () => {
			if (bounceAnimationId) {
				cancelAnimationFrame(bounceAnimationId);
				bounceAnimationId = null;
			}
		};
	});

	// Inactivity timer functions
	function resetInactivityTimer() {
		// Clear existing timer
		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
		}

		// Set new timer to start bounce after inactivity
		inactivityTimer = setTimeout(() => {
			if (!$dvdBounceActive) {
				dvdBounceActive.set(true);
			}
		}, INACTIVITY_TIMEOUT);
	}

	// Initialize inactivity timer on mount and add global event listeners
	$effect(() => {
		resetInactivityTimer();

		const handleActivity = () => {
			resetInactivityTimer();
			// Stop bounce animation on any activity
			if ($dvdBounceActive) {
				console.log('stopping bouncex');
				dvdBounceActive.set(false);
			}
		};

		window.addEventListener('mousemove', handleActivity);
		window.addEventListener('click', handleActivity);
		window.addEventListener('scroll', handleActivity);
		window.addEventListener('touchstart', handleActivity);

		return () => {
			if (inactivityTimer) {
				clearTimeout(inactivityTimer);
			}
			// Clean up event listeners
			window.removeEventListener('mousemove', handleActivity);
			window.removeEventListener('click', handleActivity);
			window.removeEventListener('scroll', handleActivity);
			window.removeEventListener('touchstart', handleActivity);
		};
	});

	// File dragging
	function handleFilePointerDown(fileId: string, fileX: number, fileY: number) {
		return (e: PointerEvent) => {
			// Ignore right-clicks (context menu)
			if (e.button === 2) return;

			e.preventDefault();
			e.stopPropagation();
			draggingFileId = fileId;
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			initialX = fileX;
			initialY = fileY;
			hasDragged = false;
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		};
	}

	function handleFilePointerMove(e: PointerEvent) {
		if (!draggingFileId) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		// Check if moved beyond threshold
		if (!hasDragged && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
			hasDragged = true;
		}

		if (hasDragged) {
			let newX = initialX + deltaX;
			let newY = initialY + deltaY;

			// Apply bounds
			newX = Math.max(0, Math.min(newX, width - fileSize));
			newY = Math.max(0, Math.min(newY, height - fileSize));

			updateFilePosition(draggingFileId, newX, newY);
		}
	}

	function handleFilePointerUp(fileData: any) {
		return (e: PointerEvent) => {
			// Only navigate on left-click without drag
			if (!hasDragged && fileData?.href && e.button === 0) {
				// This was a click, not a drag - navigate to the href
				goto(fileData.href);
			}
			draggingFileId = null;
			hasDragged = false;
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		};
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
					onpointerdown={handleWindowPointerDown}
					onpointermove={handleWindowPointerMove}
					onpointerup={handleWindowPointerUp}
					onpointercancel={handleWindowPointerUp}
					ondblclick={() => {
						DraggableWidth = defaultWidth;
						DraggableHeight = minHeight;
						DraggableX = width / 2 - DraggableWidth / 2;
						DraggableY = height / 3 - DraggableHeight / 2;
					}}
				>
					<WindowButtons />
				</div>
				<div class={cn('flex h-full items-center justify-center', className)}>
					<slot />
				</div>
				<div
					class="absolute bottom-0 right-0 hidden h-8 w-8 cursor-nwse-resize select-none md:block"
					onpointerdown={handleResizePointerDown}
					onpointermove={handleResizePointerMove}
					onpointerup={handleResizePointerUp}
					onpointercancel={handleResizePointerUp}
					role="button"
					tabindex="-1"
					aria-label="Resize window"
				></div>
			</Card.Root>
		</div>
	{/if}
	{#if $desktopFiles.length > 0}
		{#each $desktopFiles.filter((f) => !f.hidden) as fileItem (fileItem.id)}
			<ContextMenu.Root>
				<ContextMenu.Trigger>
					<div
						transition:fade
						class="absolute z-10 block select-none"
						class:cursor-grabbing={draggingFileId === fileItem.id}
						style="left:{fileItem.x}px; top:{fileItem.y}px; width:{fileSize}px; height:{fileSize}px; user-select: none; touch-action: none;"
						draggable="false"
						onpointerdown={handleFilePointerDown(fileItem.id, fileItem.x || 0, fileItem.y || 0)}
						onpointermove={handleFilePointerMove}
						onpointerup={handleFilePointerUp(fileItem)}
						onpointercancel={handleFilePointerUp(fileItem)}
						ondragstart={(e) => e.preventDefault()}
						role="button"
						tabindex="-1"
						aria-label="Drag {fileItem.name || fileItem.id}"
					>
						<File
							name={fileItem.name || fileItem.id}
							href={fileItem.href}
							icon={fileItem.icon}
							size={fileSize}
						/>
					</div>
				</ContextMenu.Trigger>
				<ContextMenu.Content>
					<ContextMenu.Item
						onclick={() => {
							if (fileItem.href) {
								goto(fileItem.href);
							}
						}}
					>
						<FolderOpen class="mr-2 h-4 w-4" />
						Open
					</ContextMenu.Item>
					<ContextMenu.Item
						onclick={() => {
							if (fileItem.href) {
								window.open(fileItem.href, '_blank');
							}
						}}
					>
						<ExternalLink class="mr-2 h-4 w-4" />
						Open in New Tab
					</ContextMenu.Item>
					<ContextMenu.Item
						onclick={() => {
							const newName = prompt('Enter new name:', fileItem.name || fileItem.id);
							if (newName !== null) {
								renameFile(fileItem.id, newName);
							}
						}}
					>
						<Pencil class="mr-2 h-4 w-4" />
						Rename
					</ContextMenu.Item>
					<ContextMenu.Separator />
					<ContextMenu.Item onclick={() => hideFile(fileItem.id)}>
						<Trash2 class="mr-2 h-4 w-4" />
						Delete
					</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Root>
		{/each}
	{/if}
</div>
