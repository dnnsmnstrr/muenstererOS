<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { Heading } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils/utils';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { onMount, untrack } from 'svelte';
	import { Plus, Trash, Download, Share, Pen } from 'lucide-svelte';
	import { confirmDelete, ConfirmDeleteDialog } from '$lib/components/ui/confirm-delete-dialog';
	import IconPicker from '$lib/components/IconPicker.svelte';
	import EmojiPicker from '$lib/components/EmojiPicker.svelte';
	import * as LucideIcons from 'lucide-svelte';
	import type { Component } from 'svelte';
	import * as SplitButton from '$lib/components/ui/split-button';

	let password = $state('');
	let isUnlocked = $state(false);

	type ItemType = 'emoji' | 'gif' | 'text' | 'icon';

	interface CanvasItem {
		id: string;
		type: ItemType;
		content: string;
		x: number;
		y: number;
		rotation: number;
		scale: number;
		fontSize?: number;
		color?: string;
		fontWeight?: string;
	}

	let items = $state<CanvasItem[]>([]);
	let selectedIds = $state<string[]>([]);
	let selectedItemHeight = $state(0);
	let itemRefs = $state<Record<string, HTMLDivElement>>({});
	let workspaceWidth = $state(0);
	let newItemContent = $state('');

	// Dragging state
	let isDraggingItem = $state(false);
	let dragStart = { x: 0, y: 0 };
	let dragItemPositions = $state<Record<string, { x: number; y: number }>>({});

	// Selection rectangle state
	let isSelecting = $state(false);
	let selectionRect = $state<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
	let workspaceEl: HTMLDivElement | undefined = $state(undefined);

	const MARGIN = 100;
	let canvasSize = $derived(
		items.length > 0
			? {
					width: Math.max(500, ...items.map((i) => i.x + MARGIN)),
					height: Math.max(500, ...items.map((i) => i.y + MARGIN))
				}
			: { width: 500, height: 500 }
	);

	function addItem(type: ItemType, content: string, x?: number, y?: number) {
		const newItem: CanvasItem = {
			id: crypto.randomUUID(),
			type,
			content,
			x: x ?? 100 + Math.random() * 200,
			y: y ?? 100 + Math.random() * 200,
			rotation: Math.random() * 20 - 10,
			scale: 1,
			fontSize: type === 'text' ? 24 : undefined,
			color: type === 'text' ? 'currentColor' : undefined,
			fontWeight: type === 'text' ? 'normal' : undefined
		};
		items.push(newItem);
		saveToHash();
	}

	function handleInputSubmit() {
		if (!newItemContent.trim()) return;

		const isUrl =
			newItemContent.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
			newItemContent.includes('giphy.com') ||
			newItemContent.includes('tenor.com') ||
			newItemContent.startsWith('http');

		if (
			isUrl &&
			(newItemContent.match(/\.(jpeg|jpg|gif|png|webp)/) ||
				newItemContent.includes('giphy') ||
				newItemContent.includes('tenor'))
		) {
			addItem('gif', newItemContent);
		} else if (newItemContent.length <= 2 && /\p{Emoji}/u.test(newItemContent)) {
			addItem('emoji', newItemContent);
		} else if ((LucideIcons as any)[newItemContent]) {
			addItem('icon', newItemContent);
		} else {
			addItem('text', newItemContent);
		}
		newItemContent = '';
	}

	function removeSelectedItems() {
		items = items.filter((i) => !selectedIds.includes(i.id));
		selectedIds = [];
		saveToHash();
	}

	function saveToHash() {
		if (typeof window === 'undefined') return;
		try {
			const data = JSON.stringify(items);
			const hash = btoa(encodeURIComponent(data));
			window.location.hash = hash;
		} catch (e) {
			console.error('Failed to save to hash', e);
		}
	}

	function loadFromHash() {
		if (typeof window === 'undefined') return;
		const hash = window.location.hash.slice(1);
		if (!hash) return;
		try {
			const data = decodeURIComponent(atob(hash));
			const parsed = JSON.parse(data);
			if (Array.isArray(parsed)) {
				items = parsed;
				isUnlocked = true;
			}
		} catch (e) {
			console.error('Failed to parse hash', e);
		}
	}

	onMount(() => {
		loadFromHash();
		window.addEventListener('hashchange', loadFromHash);

		const handleMouseMove = (e: MouseEvent) => {
			if (isSelecting && workspaceEl) {
				const rect = workspaceEl.getBoundingClientRect();
				const x = e.clientX - rect.left + workspaceEl.scrollLeft;
				const y = e.clientY - rect.top + workspaceEl.scrollTop;
				selectionRect = { ...selectionRect!, x2: x, y2: y };
				return;
			}
			if (isDraggingItem && selectedIds.length > 0) {
				const dx = e.clientX - dragStart.x;
				const dy = e.clientY - dragStart.y;
				for (const id of selectedIds) {
					const item = items.find((i) => i.id === id);
					const startPos = dragItemPositions[id];
					if (item && startPos) {
						item.x = startPos.x + dx;
						item.y = startPos.y + dy;
					}
				}
				saveToHash();
			}
		};

		const handleMouseUp = () => {
			if (isSelecting && selectionRect) {
				const x1 = Math.min(selectionRect.x1, selectionRect.x2);
				const y1 = Math.min(selectionRect.y1, selectionRect.y2);
				const x2 = Math.max(selectionRect.x1, selectionRect.x2);
				const y2 = Math.max(selectionRect.y1, selectionRect.y2);
				selectedIds = items
					.filter((item) => item.x >= x1 && item.x <= x2 && item.y >= y1 && item.y <= y2)
					.map((item) => item.id);
			}
			isSelecting = false;
			selectionRect = null;
			isDraggingItem = false;
			dragItemPositions = {};
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (isSelecting && workspaceEl) {
				const rect = workspaceEl.getBoundingClientRect();
				const x = e.touches[0].clientX - rect.left + workspaceEl.scrollLeft;
				const y = e.touches[0].clientY - rect.top + workspaceEl.scrollTop;
				selectionRect = { ...selectionRect!, x2: x, y2: y };
				return;
			}
			if (isDraggingItem && selectedIds.length > 0) {
				const dx = e.touches[0].clientX - dragStart.x;
				const dy = e.touches[0].clientY - dragStart.y;
				for (const id of selectedIds) {
					const item = items.find((i) => i.id === id);
					const startPos = dragItemPositions[id];
					if (item && startPos) {
						item.x = startPos.x + dx;
						item.y = startPos.y + dy;
					}
				}
				saveToHash();
			}
		};

		const handleTouchEnd = () => {
			if (isSelecting && selectionRect) {
				const x1 = Math.min(selectionRect.x1, selectionRect.x2);
				const y1 = Math.min(selectionRect.y1, selectionRect.y2);
				const x2 = Math.max(selectionRect.x1, selectionRect.x2);
				const y2 = Math.max(selectionRect.y1, selectionRect.y2);
				selectedIds = items
					.filter((item) => item.x >= x1 && item.x <= x2 && item.y >= y1 && item.y <= y2)
					.map((item) => item.id);
			}
			isSelecting = false;
			selectionRect = null;
			isDraggingItem = false;
			dragItemPositions = {};
		};

		const handlePaste = (e: ClipboardEvent) => {
			if (!isUnlocked) return;
			const text = e.clipboardData?.getData('text');
			if (text) {
				const isUrl =
					text.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
					text.includes('giphy.com') ||
					text.includes('tenor.com') ||
					text.startsWith('http');

				if (
					isUrl &&
					(text.match(/\.(jpeg|jpg|gif|png|webp)/) ||
						text.includes('giphy') ||
						text.includes('tenor'))
				) {
					addItem('gif', text);
					toast.success('GIF pasted!');
				}
			}
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', handleTouchEnd);
		window.addEventListener('paste', handlePaste);

		return () => {
			window.removeEventListener('hashchange', loadFromHash);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
			window.removeEventListener('paste', handlePaste);
		};
	});

	function handleUnlock() {
		if (password.toLowerCase() === 'paula') {
			isUnlocked = true;
			toast.success('Access granted');
		} else {
			toast.error(i18n.t('pap.invalid_password'));
			password = '';
		}
	}

	let lastWorkspaceWidth = 0;

	$effect(() => {
		if (workspaceWidth > 0 && lastWorkspaceWidth > 0 && workspaceWidth !== lastWorkspaceWidth) {
			const ratio = workspaceWidth / lastWorkspaceWidth;
			untrack(() => {
				for (const item of items) {
					item.x = Math.round(item.x * ratio);
				}
				saveToHash();
			});
		}
		lastWorkspaceWidth = workspaceWidth;
	});

	$effect(() => {
		const id = selectedIds[0];
		if (id && itemRefs[id]) {
			selectedItemHeight = itemRefs[id].offsetHeight;
		}
	});

	function updateSelectedItem(props: Partial<CanvasItem>) {
		const id = selectedIds[0];
		if (!id) return;
		const index = items.findIndex((i) => i.id === id);
		if (index !== -1) {
			items[index] = { ...items[index], ...props };
			saveToHash();
		}
	}
	function bringForward(id: string) {
		const idx = items.findIndex((i) => i.id === id);
		if (idx < items.length - 1) {
			const next = [...items];
			[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
			items = next;
			saveToHash();
		}
	}

	function sendBackward(id: string) {
		const idx = items.findIndex((i) => i.id === id);
		if (idx > 0) {
			const next = [...items];
			[next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
			items = next;
			saveToHash();
		}
	}

	function bringToFront(id: string) {
		const idx = items.findIndex((i) => i.id === id);
		if (idx !== -1) {
			const item = items[idx];
			items = [...items.slice(0, idx), ...items.slice(idx + 1), item];
			saveToHash();
		}
	}

	function sendToBack(id: string) {
		const idx = items.findIndex((i) => i.id === id);
		if (idx !== -1) {
			const item = items[idx];
			items = [item, ...items.slice(0, idx), ...items.slice(idx + 1)];
			saveToHash();
		}
	}

	function encodeUrl(preview = false) {
		const data = JSON.stringify(items);
		const hash = btoa(encodeURIComponent(data));
		return `${window.location.origin}/pap${preview ? '/preview' : ''}?data=${hash}`;
	}

	function exportImage() {
		window.open(encodeUrl(true), '_blank');
	}

	async function shareCanvas({ editor = false } = {}) {
		try {
			await navigator.clipboard.writeText(encodeUrl(!editor));
			toast.success('Preview link copied to clipboard!');
		} catch (err) {
			toast.error('Failed to copy link');
		}
	}

	let currentAction = $state<string>('share');
</script>

<svelte:head>
	<title>{i18n.t('pap.title')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

<div class="container mx-auto flex h-full flex-col items-center justify-center space-y-8 p-4">
	{#if !isUnlocked}
		<div class="flex w-full max-w-md flex-col space-y-4 rounded-lg border bg-card p-8 shadow-lg">
			<Heading depth={2} class="text-center">{i18n.t('pap.title')}</Heading>
			<p class="text-center text-muted-foreground">{i18n.t('pap.password_prompt')}</p>
			<div class="flex flex-col space-y-2">
				<Input
					type="password"
					placeholder={i18n.t('pap.password_placeholder')}
					bind:value={password}
					onkeydown={(e) => e.key === 'Enter' && handleUnlock()}
				/>
				<Button onclick={handleUnlock}>{i18n.t('pap.unlock')}</Button>
			</div>
		</div>
	{:else}
		<div class="flex h-full max-h-dvh w-full flex-col space-y-6 overflow-hidden">
			<div class="flex items-center justify-between">
				<div class="sticky top-0 z-50 flex w-full flex-col items-center space-y-4">
					<div
						class="flex flex-col items-center rounded-2xl border bg-background/80 p-2 shadow-sm backdrop-blur-sm md:flex-row md:space-x-2 md:rounded-full"
					>
						<div class="flex w-full items-center space-x-2 px-1 md:w-auto">
							<Input
								placeholder="Paste GIF URL or type text..."
								bind:value={newItemContent}
								class="h-8 flex-grow rounded-full md:w-64"
								onkeydown={(e) => e.key === 'Enter' && handleInputSubmit()}
							/>
							<Button size="sm" variant="ghost" onclick={handleInputSubmit}>
								<Plus /> <span class="hidden md:block">Add</span>
							</Button>
						</div>

						<div
							class="mt-2 flex w-full items-center justify-between border-t pt-2 md:mt-0 md:w-auto md:justify-start md:border-l md:border-t-0 md:pl-1 md:pt-0"
						>
							<div class="flex items-center gap-1 md:mx-2">
								<EmojiPicker
									onSelect={(emoji) => addItem('emoji', emoji)}
									class="h-8 w-8 p-0"
									showLast={false}
								/>

								<div class="mx-1 h-6 w-px bg-border md:mx-2"></div>

								<IconPicker
									value="Sticker"
									onSelect={(icon) => addItem('icon', icon)}
									clearOnSelect
									triggerMode="button"
									class="h-8 w-8 p-0"
								/>
							</div>

							<div class="mx-2 hidden h-6 w-px bg-border md:ml-1 md:block"></div>

							<SplitButton.Root
								bind:value={currentAction}
								onclick={(e) => {
									if (e.action === 'share') shareCanvas();
									if (e.action === 'export') exportImage();
									if (e.action === 'editor') {
										toast.info('You are already in the editor!');
									}
									if (e.action === 'clear') {
										confirmDelete({
											title: 'Clear Canvas',
											description:
												'Are you sure you want to clear the entire canvas? This cannot be undone.',
											onConfirm: async () => {
												items = [];
											}
										});
									}
								}}
								onActionSelect={(action) => {
									currentAction = 'share';
									if (action === 'share') shareCanvas();
									if (action === 'export') exportImage();
									if (action === 'editor') shareCanvas({ editor: true });
									if (action === 'clear') {
										confirmDelete({
											title: 'Clear Canvas',
											description:
												'Are you sure you want to clear the entire canvas? This cannot be undone.',
											onConfirm: async () => {
												items = [];
											}
										});
									}
								}}
								disabled={items.length === 0}
							>
								<SplitButton.Action value="share" variant="ghost" size="sm" class="text-xs">
									<Share class="mr-1 size-4" /> Share
								</SplitButton.Action>
								<SplitButton.Action value="export" variant="ghost" size="sm" class="text-xs">
									<Download class="mr-1 size-4" /> Export
								</SplitButton.Action>
								<SplitButton.Action value="editor" variant="ghost" size="sm" class="text-xs">
									<Pen class="mr-1 size-4" /> Editor Link
								</SplitButton.Action>
								<SplitButton.Action
									value="clear"
									variant="ghost"
									size="sm"
									class="text-xs text-destructive"
								>
									<Trash class="mr-1 size-4" />
									{i18n.t('pap.clear_canvas')}
								</SplitButton.Action>
								<SplitButton.Select>
									<SplitButton.SelectTrigger variant="ghost" size="sm" class="px-2" />
									<SplitButton.SelectContent>
										<SplitButton.SelectAction value="share">
											<Share class="mr-2 size-4" /> Share
										</SplitButton.SelectAction>
										<SplitButton.SelectAction value="export">
											<Download class="mr-2 size-4" /> Export
										</SplitButton.SelectAction>
										<SplitButton.SelectAction value="editor">
											<Pen class="mr-2 size-4" /> Editor
										</SplitButton.SelectAction>
										<SplitButton.SelectSeparator />
										<SplitButton.SelectAction value="clear" class="text-destructive">
											<Trash class="mr-2 size-4" />
											{i18n.t('pap.clear_canvas')}
										</SplitButton.SelectAction>
									</SplitButton.SelectContent>
								</SplitButton.Select>
							</SplitButton.Root>
						</div>
					</div>
				</div>
			</div>

			<!-- Workspace -->
			<div
				role="none"
				bind:clientWidth={workspaceWidth}
				bind:this={workspaceEl}
				class="relative min-h-[500px] flex-grow cursor-crosshair overflow-auto rounded-xl border bg-card/50 shadow-inner"
				onmousedown={(e) => {
					if (e.target === e.currentTarget) {
						selectedIds = [];
						const rect = e.currentTarget.getBoundingClientRect();
						const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
						const y = e.clientY - rect.top + e.currentTarget.scrollTop;
						isSelecting = true;
						selectionRect = { x1: x, y1: y, x2: x, y2: y };
					}
				}}
			>
				<div
					class="pointer-events-none"
					style="min-width: {canvasSize.width}px; min-height: {canvasSize.height}px"
				></div>
				{#if selectionRect}
					<div
						class="pointer-events-none absolute z-50 rounded border-2 border-blue-400 bg-blue-400/10"
						style="left: {Math.min(selectionRect.x1, selectionRect.x2)}px; top: {Math.min(
							selectionRect.y1,
							selectionRect.y2
						)}px; width: {Math.abs(selectionRect.x2 - selectionRect.x1)}px; height: {Math.abs(
							selectionRect.y2 - selectionRect.y1
						)}px;"
					></div>
				{/if}
				{#if selectedIds.length === 1}
					{@const selectedItem = items.find((i) => i.id === selectedIds[0])}
					{#if selectedItem}
						<div
							class="absolute z-[60] flex flex-col items-center gap-2 space-x-2 rounded-lg border bg-background/80 p-2 text-xs shadow-sm backdrop-blur-sm md:flex-row"
							style="left: {selectedItem.x}px; top: {selectedItem.y -
								selectedItemHeight / 2 -
								8}px; transform: translate(-50%, -100%);"
						>
							{#if selectedItem.type === 'text' || selectedItem.type === 'icon'}
								<div class="flex items-center gap-1">
									<span class="font-bold">Color:</span>
									<Input
										type="color"
										class="h-6 w-10 border-none p-0"
										value={selectedItem.color}
										oninput={(e) => updateSelectedItem({ color: e.currentTarget.value })}
									/>
									{#if selectedItem.type === 'text'}
										<Button
											variant="outline"
											size="sm"
											class="h-6 px-2"
											onclick={() =>
												updateSelectedItem({
													fontWeight: selectedItem.fontWeight === 'bold' ? 'normal' : 'bold'
												})}
										>
											<b>B</b>
										</Button>
									{/if}
									<Input
										type="number"
										class="h-6 w-16"
										value={selectedItem.fontSize || (selectedItem.type === 'icon' ? 32 : 24)}
										oninput={(e) =>
											updateSelectedItem({ fontSize: parseInt(e.currentTarget.value) })}
									/>
								</div>
							{/if}
							<div class="flex items-center gap-1">
								{#if selectedItem.type !== 'text'}
									<div
										class="flex items-center gap-1 {selectedItem.type === 'text' ||
										selectedItem.type === 'icon'
											? 'border-l'
											: ''} pl-2"
										onwheel={(e) => {
											e.preventDefault();
											updateSelectedItem({
												scale: Math.max(0.1, selectedItem.scale + (e.deltaY > 0 ? -0.1 : 0.1))
											});
										}}
									>
										<span>Size:</span>
										<Button
											variant="outline"
											size="sm"
											class="h-6 px-2"
											onclick={() =>
												updateSelectedItem({ scale: Math.max(0.1, selectedItem.scale - 0.1) })}
											>-</Button
										>
										<Button
											variant="outline"
											size="sm"
											class="h-6 px-2"
											onclick={() => updateSelectedItem({ scale: selectedItem.scale + 0.1 })}
											>+</Button
										>
									</div>
								{/if}
								<div
									class="flex items-center gap-1 md:border-l pl-2"
									onwheel={(e) => {
										e.preventDefault();
										updateSelectedItem({
											rotation: selectedItem.rotation + (e.deltaY > 0 ? -15 : 15)
										});
									}}
								>
									<span>Rotate:</span>
									<Button
										variant="outline"
										size="sm"
										class="h-6 px-2"
										onclick={() => updateSelectedItem({ rotation: selectedItem.rotation - 15 })}
										>↺</Button
									>
									<Button
										variant="outline"
										size="sm"
										class="h-6 px-2"
										onclick={() => updateSelectedItem({ rotation: selectedItem.rotation + 15 })}
										>↻</Button
									>
								</div>
								<Button
									variant="destructive"
									size="sm"
									class="ml-4 h-6 px-2"
									onclick={removeSelectedItems}>Remove</Button
								>
							</div>
						</div>
					{/if}
				{:else if selectedIds.length > 1}
					<div
						class="absolute z-[60] flex items-center gap-2 rounded-lg border bg-background/80 px-3 py-2 text-xs shadow-sm backdrop-blur-sm"
						style="left: {items.find((i) => i.id === selectedIds[0])?.x ?? 0}px; top: {items.find(
							(i) => i.id === selectedIds[0]
						)?.y ?? 0 - selectedItemHeight / 2 - 8}px; transform: translate(-50%, -100%);"
					>
						<span>{selectedIds.length} items selected</span>
						<Button variant="destructive" size="sm" class="h-6 px-2" onclick={removeSelectedItems}
							>Remove all</Button
						>
					</div>
				{/if}
				{#each items as item, i (item.id)}
					{@const zIndex = 10 + i}
					<ContextMenu.Root>
						<ContextMenu.Trigger>
							<div
								role="button"
								tabindex="-1"
								bind:this={itemRefs[item.id]}
								class={cn(
									'absolute cursor-move select-none',
									selectedIds.includes(item.id) && 'rounded-sm ring-2 ring-primary ring-offset-2'
								)}
								style="left: {item.x}px; top: {item.y}px; z-index: {zIndex}; transform: translate(-50%, -50%) rotate({item.rotation}deg) scale({item.scale});"
								onmousedown={(e) => {
									e.stopPropagation();
									if (e.metaKey || e.ctrlKey) {
										selectedIds = selectedIds.includes(item.id)
											? selectedIds.filter((id) => id !== item.id)
											: [...selectedIds, item.id];
									} else if (!selectedIds.includes(item.id)) {
										selectedIds = [item.id];
									}
									isDraggingItem = true;
									dragStart = { x: e.clientX, y: e.clientY };
									dragItemPositions = Object.fromEntries(
										selectedIds.map((id) => {
											const i = items.find((it) => it.id === id)!;
											return [id, { x: i.x, y: i.y }];
										})
									);
								}}
								ontouchstart={(e) => {
									e.stopPropagation();
									if (!selectedIds.includes(item.id)) {
										selectedIds = [item.id];
									}
									isDraggingItem = true;
									dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
									dragItemPositions = Object.fromEntries(
										selectedIds.map((id) => {
											const i = items.find((it) => it.id === id)!;
											return [id, { x: i.x, y: i.y }];
										})
									);
								}}
							>
								{#if item.type === 'emoji'}
									<span class="text-6xl">{item.content}</span>
								{:else if item.type === 'gif'}
									<img
										src={item.content}
										alt="GIF"
										class="pointer-events-none max-h-48 max-w-48 object-contain drop-shadow-lg"
									/>
								{:else if item.type === 'text'}
									<div
										style="font-size: {item.fontSize}px; color: {item.color}; font-weight: {item.fontWeight};"
										class="whitespace-nowrap px-2 py-1"
									>
										{item.content}
									</div>
								{:else if item.type === 'icon'}
									{@const Icon = (LucideIcons as any)[item.content] as Component}
									<div style="color: {item.color || 'currentColor'}">
										<Icon size={item.fontSize ? item.fontSize * 2 : 64} />
									</div>
								{/if}
							</div>
						</ContextMenu.Trigger>
						<ContextMenu.Content class="min-w-40">
							<ContextMenu.Item onclick={() => bringToFront(item.id)}>
								Bring to Front
							</ContextMenu.Item>
							<ContextMenu.Item onclick={() => bringForward(item.id)}>
								Bring Forward
							</ContextMenu.Item>
							<ContextMenu.Separator />
							<ContextMenu.Item onclick={() => sendBackward(item.id)}>
								Send Backward
							</ContextMenu.Item>
							<ContextMenu.Item onclick={() => sendToBack(item.id)}>Send to Back</ContextMenu.Item>
						</ContextMenu.Content>
					</ContextMenu.Root>
				{/each}
				{#if items.length === 0}
					<div class="flex h-full items-center justify-center italic text-muted-foreground">
						The canvas is empty. Add something!
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
<ConfirmDeleteDialog />

<style>
	:global(.cursor-move) {
		touch-action: none;
	}
</style>
