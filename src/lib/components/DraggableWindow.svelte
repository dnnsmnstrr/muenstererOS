<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script context="module">
	import 'dragdroptouch-bug-fixed'; // for mobile platforms
	import { asDraggable } from 'svelte-drag-and-drop-actions';
</script>

<script lang="ts">
	import WindowButtons from './WindowButtons.svelte';
	import * as Card from '$lib/components/ui/card';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import { filePosition } from '$lib/stores/desktop';

	const minHeight = 300;
	const minWidth = 210;
	const fileSize = 50;
	const padding = 20;
	const breakpoint = 640
	export let width = 0;
	export let height = 0;
	let dragging = false;
	$: defaultWidth = width < 640 ? minWidth : 390;
	let DraggableWidth = defaultWidth || 250;
	let DraggableHeight = minHeight;
	let DraggableX = 0;
	let DraggableY = 0;

	$: if (width || height) {
		// switch to vertical layout on mobile
		if (width < breakpoint && DraggableWidth > defaultWidth && !dragging) {
			DraggableWidth = minWidth
			DraggableHeight = minHeight
		} else if (width > breakpoint && DraggableWidth < defaultWidth && !dragging) {
			DraggableWidth = defaultWidth
			DraggableHeight = minHeight
		}

		// initial positioning
		if (!DraggableX) {
			DraggableX = width / 2 - DraggableWidth / 2;
		}
		if (!DraggableY) {
			DraggableY = height / 3 - DraggableHeight / 2;
		}

		// keep window in view while changing window size
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

		// keep file in view
		if (width < $filePosition.x + fileSize) {
			$filePosition.x = width - (fileSize + 20);
		}
	}

	function handleDragChange(x: number, y: number) {
		if (x) {
			DraggableX = x;
		}
		if (y) {
			DraggableY = y;
		}
	}

	function handleFileChange(x: number, y: number) {
		if (x) {
			$filePosition.x = x;
		}
		if (y) {
			$filePosition.y = y;
		}
	}

	function startResizing() {
		dragging = true;
		return { x: DraggableWidth, y: DraggableHeight };
	}
	function continueResizing(x: number, y: number) {
		if (x > defaultWidth) {
			DraggableWidth = x;
		}
		DraggableHeight = y;
		// TODO: enable the following while option is pressed to resize around the center
		// DraggableX = width / 2 - DraggableWidth / 2
		// DraggableY = height / 3 - DraggableHeight / 2
	}
	function finishResizing(x: number, y: number) {
		if (x > defaultWidth) {
			DraggableWidth = x;
		}
		DraggableHeight = y;
		dragging = false;
	}
</script>

<div class="relative block" style="width:{width}px; height:{height}px;">
	{#if width && height}
		<div
			transition:fade
			class="absolute block left-[{DraggableX}px] top-[{DraggableY}px] w-[{DraggableWidth}px] h-[{DraggableHeight}px] z-30"
			style="left:{DraggableX}px; top:{DraggableY}px; width:{DraggableWidth}px; height:{DraggableHeight}px;"
			use:asDraggable={{
				minX: 0,
				minY: 0,
				maxX: width - DraggableWidth,
				maxY: height - DraggableHeight,
				onDragStart: { x: DraggableX, y: DraggableY },
				onDragMove: handleDragChange,
				onDragEnd: handleDragChange
			}}
		>
			<Card.Root class="mb-0 block h-full w-full">
				<div
					class="absolute left-0 top-0 block h-10 w-full cursor-grab"
          role="application"
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
					class="hidden absolute bottom-0 right-0 md:block h-8 w-8 cursor-nwse-resize"
					use:asDraggable={{
						onDragStart: startResizing,
						onDragMove: continueResizing,
						onDragEnd: finishResizing,
						minX: minWidth,
						minY: minHeight,
						maxX: width - DraggableX,
						maxY: height - DraggableY
					}}
				/>
			</Card.Root>
		</div>
	{/if}
	{#if $$slots.file && ($filePosition.x || $filePosition.y)}
		<div
			transition:fade
			class="absolute bottom-0 right-0 z-10 block h-8 w-8 cursor-move"
			style="left:{$filePosition.x}px; top:{$filePosition.y}px; width:{fileSize}px; height:{fileSize}px;"
			use:asDraggable={{
				minX: 0,
				minY: 0,
				maxX: width - fileSize,
				maxY: height - fileSize,
				onDragStart: { x: $filePosition.x, y: $filePosition.y },
				onDragMove: handleFileChange,
				onDragEnd: handleFileChange
			}}
		>
			<slot name="file" />
		</div>
	{/if}
</div>
