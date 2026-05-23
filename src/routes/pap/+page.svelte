<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { Heading } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	let password = $state('');
	let isUnlocked = $state(false);

	type ItemType = 'emoji' | 'gif' | 'text';

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
	let selectedId = $state<string | null>(null);
	let newItemContent = $state('');

	// Dragging state
	let isDraggingItem = $state(false);
	let dragOffset = { x: 0, y: 0 };

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

		const isUrl = newItemContent.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
					  newItemContent.includes('giphy.com') ||
					  newItemContent.includes('tenor.com') ||
					  newItemContent.startsWith('http');

		if (isUrl && newItemContent.match(/\.(jpeg|jpg|gif|png|webp)/)) {
			addItem('gif', newItemContent);
		} else if (newItemContent.length <= 2 && /\p{Emoji}/u.test(newItemContent)) {
            // Simple emoji detection if it's 1-2 chars and contains emoji
            addItem('emoji', newItemContent);
        } else {
			addItem('text', newItemContent);
		}
		newItemContent = '';
	}

	function removeItem(id: string) {
		items = items.filter((i) => i.id !== id);
		if (selectedId === id) selectedId = null;
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
				isUnlocked = true; // Auto-unlock if hash is present and valid
			}
		} catch (e) {
			console.error('Failed to parse hash', e);
		}
	}

	onMount(() => {
		loadFromHash();
		window.addEventListener('hashchange', loadFromHash);

		const handleMouseMove = (e: MouseEvent) => {
			if (isDraggingItem && selectedId) {
				const item = items.find((i) => i.id === selectedId);
				if (item) {
					item.x = e.clientX - dragOffset.x;
					item.y = e.clientY - dragOffset.y;
					saveToHash();
				}
			}
		};

		const handleMouseUp = () => {
			isDraggingItem = false;
		};

		const handlePaste = (e: ClipboardEvent) => {
			if (!isUnlocked) return;
			const text = e.clipboardData?.getData('text');
			if (text) {
				const isUrl = text.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
							  text.includes('giphy.com') ||
							  text.includes('tenor.com') ||
							  text.startsWith('http');

				if (isUrl && text.match(/\.(jpeg|jpg|gif|png|webp)/)) {
					addItem('gif', text);
					toast.success('GIF pasted!');
				}
			}
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('paste', handlePaste);

		return () => {
			window.removeEventListener('hashchange', loadFromHash);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
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

    function updateSelectedItem(props: Partial<CanvasItem>) {
        if (!selectedId) return;
        const index = items.findIndex(i => i.id === selectedId);
        if (index !== -1) {
            items[index] = { ...items[index], ...props };
            saveToHash();
        }
    }
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
		<div class="flex h-full w-full flex-col space-y-6">
			<div class="flex items-center justify-between">
				<Heading class="mb-0">{i18n.t('pap.title')}</Heading>
				<p class="hidden text-sm text-muted-foreground sm:block">Move items around and share your creation!</p>
				<Button variant="outline" onclick={() => (isUnlocked = false)} size="sm">
					{i18n.t('common.quit')}
				</Button>
			</div>

			<div class="sticky top-0 z-50 flex w-full flex-col items-center space-y-4">
				<div
					class="flex items-center space-x-2 rounded-full border bg-background/80 p-2 shadow-sm backdrop-blur-sm"
				>
					<div class="flex items-center space-x-2 px-2">
						<Input
							placeholder="Paste GIF URL or type text..."
							bind:value={newItemContent}
							class="h-8 w-64"
							onkeydown={(e) => e.key === 'Enter' && handleInputSubmit()}
						/>
						<Button size="sm" variant="secondary" onclick={handleInputSubmit}>Add</Button>
					</div>

					<div class="mx-2 h-6 w-px bg-border"></div>

                    <div class="flex items-center space-x-1 border-l pl-2">
                        {#each ['😊', '😂', '❤️', '🔥', '✨', '🍕', '🚀', '🎨'] as emoji}
                            <button
                                class="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors text-lg"
                                onclick={() => addItem('emoji', emoji)}
                            >
                                {emoji}
                            </button>
                        {/each}
                    </div>

					<div class="mx-2 h-6 w-px bg-border"></div>

					<Button
						variant="ghost"
						size="sm"
						onclick={() => (items = [])}
						class="text-xs"
						disabled={items.length === 0}
					>
						{i18n.t('pap.clear_canvas')}
					</Button>
				</div>

                {#if selectedId}
                    {@const selectedItem = items.find(i => i.id === selectedId)}
                    {#if selectedItem}
                        <div class="flex items-center space-x-2 rounded-lg border bg-background/80 p-2 shadow-sm backdrop-blur-sm text-xs">
                            <span class="font-bold">Edit:</span>
                            {#if selectedItem.type === 'text'}
                                <Input type="color" class="h-6 w-10 p-0 border-none" value={selectedItem.color} oninput={(e) => updateSelectedItem({ color: e.currentTarget.value })} />
                                <Button variant="outline" size="sm" class="h-6 px-2" onclick={() => updateSelectedItem({ fontWeight: selectedItem.fontWeight === 'bold' ? 'normal' : 'bold' })}>
                                    <b>B</b>
                                </Button>
                                <Input type="number" class="h-6 w-12" value={selectedItem.fontSize} oninput={(e) => updateSelectedItem({ fontSize: parseInt(e.currentTarget.value) })} />
                            {/if}
                            <div class="flex items-center space-x-1 border-l pl-2">
                                <span>Size:</span>
                                <Button variant="outline" size="sm" class="h-6 px-2" onclick={() => updateSelectedItem({ scale: Math.max(0.1, selectedItem.scale - 0.1) })}>-</Button>
                                <Button variant="outline" size="sm" class="h-6 px-2" onclick={() => updateSelectedItem({ scale: selectedItem.scale + 0.1 })}>+</Button>
                            </div>
                            <div class="flex items-center space-x-1 border-l pl-2">
                                <span>Rotate:</span>
                                <Button variant="outline" size="sm" class="h-6 px-2" onclick={() => updateSelectedItem({ rotation: selectedItem.rotation - 15 })}>↺</Button>
                                <Button variant="outline" size="sm" class="h-6 px-2" onclick={() => updateSelectedItem({ rotation: selectedItem.rotation + 15 })}>↻</Button>
                            </div>
                            <Button variant="destructive" size="sm" class="h-6 px-2 ml-4" onclick={() => removeItem(selectedId!)}>Remove</Button>
                        </div>
                    {/if}
                {/if}
			</div>

			<!-- Workspace -->
			<div
				class="relative flex-grow cursor-crosshair overflow-hidden rounded-xl border bg-card/50 shadow-inner min-h-[500px]"
				onmousedown={(e) => {
					if (e.target === e.currentTarget) {
						selectedId = null;
					}
				}}
			>
				{#each items as item (item.id)}
					<div
						class={cn(
							'absolute cursor-move select-none',
							selectedId === item.id ? 'z-50 ring-2 ring-primary ring-offset-2 rounded-sm' : 'z-10'
						)}
						style="left: {item.x}px; top: {item.y}px; transform: translate(-50%, -50%) rotate({item.rotation}deg) scale({item.scale});"
						onmousedown={(e) => {
							e.stopPropagation();
							selectedId = item.id;
							isDraggingItem = true;
							const rect = e.currentTarget.getBoundingClientRect();
                            // Use client coords for consistency with handleMouseMove
							dragOffset = {
								x: e.clientX - item.x,
								y: e.clientY - item.y
							};
						}}
					>
						{#if item.type === 'emoji'}
							<span class="text-6xl">{item.content}</span>
						{:else if item.type === 'gif'}
							<img
								src={item.content}
								alt="GIF"
								class="max-h-48 max-w-48 object-contain drop-shadow-lg pointer-events-none"
							/>
						{:else if item.type === 'text'}
							<div
								style="font-size: {item.fontSize}px; color: {item.color}; font-weight: {item.fontWeight};"
								class="whitespace-nowrap px-2 py-1"
							>
								{item.content}
							</div>
						{/if}
					</div>
				{/each}
                {#if items.length === 0}
                    <div class="flex h-full items-center justify-center text-muted-foreground italic">
                        The canvas is empty. Add something!
                    </div>
                {/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.cursor-move) {
		touch-action: none;
	}
</style>
