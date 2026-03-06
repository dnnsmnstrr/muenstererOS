<script lang="ts">
	import { onMount } from 'svelte';
	import Heading from '$lib/components/typography/Heading.svelte';
	import { Loader2 } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';

	interface Node {
		id: string;
		label: string;
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

	async function fetchData() {
		try {
			const response = await fetch('/api/network');
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
		const springLength = 100;
		const springConstant = 0.05;
		const damping = 0.9;

		// Repulsion (Coulomb's Law)
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const dx = nodes[j].x - nodes[i].x;
				const dy = nodes[j].y - nodes[i].y;
				const distanceSq = dx * dx + dy * dy + 0.1;
				const force = charge / distanceSq;
				const fx = force * dx;
				const fy = force * dy;
				nodes[i].vx += fx;
				nodes[i].vy += fy;
				nodes[j].vx -= fx;
				nodes[j].vy -= fy;
			}
		}

		// Attraction (Hooke's Law)
		for (const edge of edges) {
			const source = nodes.find((n) => n.id === edge.source);
			const target = nodes.find((n) => n.id === edge.target);
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

		// Center gravity
		for (const node of nodes) {
			const dx = width / 2 - node.x;
			const dy = height / 2 - node.y;
			node.vx += dx * 0.01;
			node.vy += dy * 0.01;
		}

		// Update positions
		for (const node of nodes) {
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

			// Boundary constraints
			node.x = Math.max(20, Math.min(width - 20, node.x));
			node.y = Math.max(20, Math.min(height - 20, node.y));
		}
	}

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
</script>

<svelte:head>
	<title>{i18n.t('common.sites')}{i18n.t('common.page_title_suffix')}</title>
</svelte:head>

<div class="flex h-full flex-col p-4 md:p-8">
	<div class="mb-6">
		<Heading>{i18n.t('common.sites')}</Heading>
		<p class="text-muted-foreground">
			A visualization of my personal website network and its connections.
		</p>
	</div>

	<div
		bind:this={container}
		class="relative flex-1 overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm"
	>
		{#if loading}
			<div class="flex h-full items-center justify-center">
				<Loader2 class="h-8 w-8 animate-spin text-primary" />
			</div>
		{:else}
			<svg {width} {height} class="h-full w-full">
				<g>
					{#each edges as edge}
						{@const source = nodes.find((n) => n.id === edge.source)}
						{@const target = nodes.find((n) => n.id === edge.target)}
						{#if source && target}
							<line
								x1={source.x}
								y1={source.y}
								x2={target.x}
								y2={target.y}
								stroke="currentColor"
								stroke-width="1"
								class="text-border"
							/>
						{/if}
					{/each}
				</g>
				<g>
					{#each nodes as node}
						<g class="cursor-pointer">
							<title>{node.id}</title>
							<circle
								cx={node.x}
								cy={node.y}
								r={node.type === 'root' ? 8 : node.type === 'personal' ? 6 : 4}
								fill={getNodeColor(node.type)}
								class="transition-all hover:scale-125"
								style="transform-origin: {node.x}px {node.y}px;"
							/>
							<text
								x={node.x}
								y={node.y + 20}
								text-anchor="middle"
								font-size="10"
								class="fill-muted-foreground"
							>
								{node.label}
							</text>
						</g>
					{/each}
				</g>
			</svg>
		{/if}
	</div>
</div>

<style>
	svg {
		user-select: none;
	}
</style>
