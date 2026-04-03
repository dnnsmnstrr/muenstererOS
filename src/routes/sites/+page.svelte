<script lang="ts">
	import { onMount } from 'svelte';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Minus, Plus, Minimize, ZoomIn, ZoomOut, Expand, Focus } from 'lucide-svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { Button } from '$lib/components/ui/button';
	import { PAGE_TITLE_SUFFIX } from '$lib/config';
	import { isAppleDevice } from '$lib/utils/browser';

	interface Node {
		id: string;
		label: string;
		url: string;
		depth: number;
		type: 'root' | 'personal' | 'external';
		x: number;
		y: number;
		vx: number;
		vy: number;
	}

	interface Edge {
		source: string;
		target: string;
	}

	let nodes = $state<Node[]>([]);
	let edges = $state<Edge[]>([]);
	let loading = $state(true);
	let width = $state(800);
	let height = $state(600);
	let container: HTMLElement | undefined = $state();

	// View state
	let scale = $state(1);
	let isFullscreen = $state(false);

	// Panning state
	let offsetX = $state(0);
	let offsetY = $state(0);
	let isPanning = $state(false);
	let startPanX = 0;
	let startPanY = 0;

	// Depth control
	let displayDepth = $state(2);

	let showRecenter = $derived.by(() => {
		if (filteredNodes.length === 0) return false;
		return filteredNodes.every((node) => {
			const screenX = node.x * scale + offsetX;
			const screenY = node.y * scale + offsetY;
			return screenX < 0 || screenX > width || screenY < 0 || screenY > height;
		});
	});

	let nodesById = $derived(new Map(nodes.map((n) => [n.id, n])));

	let filteredNodes = $derived(nodes.filter((n) => n.depth <= displayDepth));
	let filteredEdges = $derived(
		edges
			.map((e) => ({
				source: nodesById.get(e.source),
				target: nodesById.get(e.target)
			}))
			.filter(
				(e) =>
					e.source && e.target && e.source.depth <= displayDepth && e.target.depth <= displayDepth
			)
	);

	async function fetchData() {
		loading = true;
		try {
			const response = await fetch('/api/network?depth=' + displayDepth);
			const data = await response.json();
			nodes = data.nodes.map((n: any) => ({
				...n,
				x: Math.random() * width,
				y: Math.random() * height,
				vx: 0,
				vy: 0
			}));
			edges = data.edges;
		} catch (error) {
			console.error('Failed to fetch network data:', error);
		} finally {
			loading = false;
		}
	}

	function updateSimulation() {
		const charge = -200;
		const springLength = 80;
		const springConstant = 0.08;
		const damping = 0.9;

		const activeNodes = filteredNodes;

		// Repulsion (Coulomb's Law)
		for (let i = 0; i < activeNodes.length; i++) {
			for (let j = i + 1; j < activeNodes.length; j++) {
				const dx = activeNodes[j].x - activeNodes[i].x;
				const dy = activeNodes[j].y - activeNodes[i].y;
				const distanceSq = dx * dx + dy * dy + 0.1;
				const force = charge / distanceSq;
				const fx = force * dx;
				const fy = force * dy;
				activeNodes[i].vx += fx;
				activeNodes[i].vy += fy;
				activeNodes[j].vx -= fx;
				activeNodes[j].vy -= fy;
			}
		}

		// Attraction (Hooke's Law)
		for (const edge of filteredEdges) {
			const source = edge.source;
			const target = edge.target;
			if (source && target) {
				const dx = target.x - source.x;
				const dy = target.y - source.y;
				const distance = Math.sqrt(dx * dx + dy * dy) + 0.1;
				const force = (distance - springLength) * springConstant;
				const fx = (force * dx) / distance;
				const fy = (force * dy) / distance;
				source.vx += fx;
				source.vy += fy;
				target.vx -= fx;
				target.vy -= fy;
			}
		}

		// Center gravity (reduced)
		const gravityFactor = 0.025;
		for (const node of activeNodes) {
			const dx = width / 2 - node.x;
			const dy = height / 2 - node.y;
			node.vx += dx * gravityFactor;
			node.vy += dy * gravityFactor;
		}

		// Update positions
		for (const node of activeNodes) {
			if (node.type === 'root') {
				node.vx = 0;
				node.vy = 0;
				node.x = width / 2;
				node.y = height / 2;
				continue;
			}
			node.x += node.vx;
			node.y += node.vy;
			node.vx *= damping;
			node.vy *= damping;
		}
	}

	function handlePointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement;
		const url = target?.dataset?.url;
		if (e.metaKey && url) {
			window.open(url, '_blank');
			return;
		}
		isPanning = true;
		startPanX = e.clientX - offsetX;
		startPanY = e.clientY - offsetY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPanning) return;
		offsetX = e.clientX - startPanX;
		offsetY = e.clientY - startPanY;
	}

	function handlePointerUp(e: PointerEvent) {
		isPanning = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = -e.deltaY;
		const zoomFactor = Math.pow(1.1, delta / 100);
		const newScale = Math.min(Math.max(0.1, scale * zoomFactor), 5);

		if (container) {
			const rect = container.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Zoom towards mouse position
			const worldX = (mouseX - offsetX) / scale;
			const worldY = (mouseY - offsetY) / scale;

			offsetX = mouseX - worldX * newScale;
			offsetY = mouseY - worldY * newScale;
			scale = newScale;
		}
	}

	$effect(() => {
		if (container) {
			container.addEventListener('wheel', handleWheel, { passive: false });
			return () => container?.removeEventListener('wheel', handleWheel);
		}
	});

	$effect(() => {
		if (!loading && nodes.length > 0) {
			const interval = setInterval(updateSimulation, 16);
			return () => clearInterval(interval);
		}
	});

	onMount(() => {
		if (container) {
			width = container.clientWidth;
			height = container.clientHeight || 600;
		}
		fetchData();
	});

	function toggleContainerFullscreen() {
		if (!container) return;
		if (!document.fullscreenElement) {
			container.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
			});
		} else {
			document.exitFullscreen();
		}
	}

	$effect(() => {
		const handleFullscreenChange = () => {
			isFullscreen = !!document.fullscreenElement;
			if (container) {
				width = container.clientWidth;
				height = container.clientHeight;
			}
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});

	function recenter() {
		scale = 1;
		offsetX = 0;
		offsetY = 0;
	}

	function getNodeColor(type: string) {
		switch (type) {
			case 'root':
				return 'var(--primary)';
			case 'personal':
				return 'var(--chart-1)';
			default:
				return 'var(--muted-foreground)';
		}
	}

	const MAX_DEPTH = 7;
</script>

<svelte:head>
	<title>{i18n.t('common.sites')}{PAGE_TITLE_SUFFIX}</title>
</svelte:head>

{#snippet controls(extraClasses = '')}
	<div class="flex flex-wrap items-center gap-2 {extraClasses}">
		<div class="flex items-center rounded-lg border bg-card p-1">
			<span class="px-2 text-xs font-medium text-muted-foreground">{i18n.t('sites.depth')}</span>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={() => (displayDepth = Math.max(1, displayDepth - 1))}
				disabled={displayDepth <= 1}
				aria-label={i18n.t('sites.decrease_depth')}
			>
				<Minus class="h-4 w-4" />
			</Button>
			<span class="w-4 text-center font-mono text-sm">{displayDepth}</span>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={() => {
					displayDepth = Math.min(MAX_DEPTH, displayDepth + 1);
					fetchData();
				}}
				disabled={displayDepth >= MAX_DEPTH}
				aria-label={i18n.t('sites.increase_depth')}
			>
				<Plus class="h-4 w-4" />
			</Button>
		</div>

		<div class="flex items-center rounded-lg border bg-card p-1">
			<span class="px-2 text-xs font-medium text-muted-foreground">{i18n.t('sites.zoom')}</span>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={() => {
					const newScale = Math.max(0.1, scale / 1.1);
					if (container) {
						const rect = container.getBoundingClientRect();
						const centerX = rect.width / 2;
						const centerY = rect.height / 2;
						const worldX = (centerX - offsetX) / scale;
						const worldY = (centerY - offsetY) / scale;
						offsetX = centerX - worldX * newScale;
						offsetY = centerY - worldY * newScale;
						scale = newScale;
					}
				}}
				disabled={scale <= 0.1}
				aria-label={i18n.t('common.zoom_out')}
			>
				<ZoomOut class="h-4 w-4" />
			</Button>
			<span class="w-10 text-center font-mono text-sm">{Math.round(scale * 100)}%</span>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={() => {
					const newScale = Math.min(5, scale * 1.1);
					if (container) {
						const rect = container.getBoundingClientRect();
						const centerX = rect.width / 2;
						const centerY = rect.height / 2;
						const worldX = (centerX - offsetX) / scale;
						const worldY = (centerY - offsetY) / scale;
						offsetX = centerX - worldX * newScale;
						offsetY = centerY - worldY * newScale;
						scale = newScale;
					}
				}}
				disabled={scale >= 5}
				aria-label={i18n.t('common.zoom_in')}
			>
				<ZoomIn class="h-4 w-4" />
			</Button>
		</div>

		<Button
			variant="outline"
			size="icon"
			class="{isFullscreen ? 'inline-flex' : 'hidden md:inline-flex'} h-10 w-10"
			onclick={toggleContainerFullscreen}
			aria-label={isFullscreen
				? i18n.t('common.exit_fullscreen')
				: i18n.t('common.enter_fullscreen')}
		>
			{#if isFullscreen}
				<Minimize class="h-4 w-4" />
			{:else}
				<Expand class="h-4 w-4" />
			{/if}
		</Button>
	</div>
{/snippet}

<div class="flex h-full flex-col p-4 md:p-8">
	<div class="mb-6 flex flex-col justify-between gap-4 md:items-end lg:flex-row">
		<div>
			<Heading>{i18n.t('common.sites')}</Heading>
			<p class="text-muted-foreground lg:max-w-[500px]">
				{i18n.t('sites.description', { shortcut: isAppleDevice() ? '⌘' : '^' })}
			</p>
		</div>

		{#if !isFullscreen}
			{@render controls()}
		{/if}
	</div>

	<div
		bind:this={container}
		class="relative flex-1 overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm {isFullscreen
			? 'fixed inset-0 z-50 rounded-none bg-background'
			: ''}"
		role="application"
		aria-label={i18n.t('sites.graph_label')}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		style="cursor: {isPanning ? 'grabbing' : 'grab'}"
	>
		{#if isFullscreen}
			<div class="absolute bottom-8 right-8 z-10" onpointerdown={(e) => e.stopPropagation()}>
				{@render controls()}
			</div>
		{/if}

		{#if showRecenter}
			<div class="absolute bottom-8 left-8 z-10" onpointerdown={(e) => e.stopPropagation()}>
				<Button
					variant="outline"
					size="icon"
					class="h-10 w-10 shadow-lg"
					onclick={recenter}
					aria-label={i18n.t('common.recenter')}
				>
					<Focus class="h-4 w-4" />
				</Button>
			</div>
		{/if}

		{#if loading}
			<div class="flex h-full items-center justify-center">
				<Loader title={i18n.t('sites.loading')} />
			</div>
		{:else}
			<svg {width} {height} class="h-full w-full">
				<g
					style="transform: translate({offsetX}px, {offsetY}px) scale({scale}); transform-origin: 0 0;"
				>
					<g>
						{#each filteredEdges as edge}
							<line
								x1={edge.source!.x}
								y1={edge.source!.y}
								x2={edge.target!.x}
								y2={edge.target!.y}
								stroke="currentColor"
								stroke-width="1"
								class="text-border"
							/>
						{/each}
					</g>
					<g>
						{#each filteredNodes as node}
							<g class="cursor-pointer">
								<title>{node.id}</title>
								<circle
									cx={node.x}
									cy={node.y}
									r={node.type === 'root'
										? 8
										: node.type === 'personal'
											? node.depth > 2
												? 4
												: 6
											: 4}
									fill={getNodeColor(node.type)}
									class="transition-transform duration-200 hover:scale-125"
									stroke="rgba(255,255,255,0.1)"
									style="transform-origin: {node.x}px {node.y}px;"
									data-url={node.url}
								/>
								<text
									x={node.x}
									y={node.y + 20}
									text-anchor="middle"
									font-size="10"
									class="fill-muted-foreground"
								>
									<a href={node.url} data-url={node.url}>
										{node.label}
									</a>
								</text>
							</g>
						{/each}
					</g>
				</g>
			</svg>
		{/if}
	</div>
</div>

<style>
	svg {
		user-select: none;
		touch-action: none;
	}
</style>
