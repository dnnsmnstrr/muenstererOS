<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import Heading from '$lib/components/typography/Heading.svelte';
	import Link from '$lib/components/typography/Link.svelte';
	import { MdSvelte } from '@jazzymcjazz/mdsvelte';
	import { renderers } from '$lib/components/typography';
	import {
		Plus,
		Trash2,
		ArrowUp,
		ArrowDown,
		MapPin,
		Music,
		Calendar,
		Code,
		InfoIcon,
		History,
		RotateCcw,
		Copy,
		Sparkles,
		Clock,
		ChevronDown,
		ChevronRight,
		Eye,
		FileText
	} from 'lucide-svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { formatDate } from '$lib/utils/helper';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { toast } from 'svelte-sonner';

	let {
		formData = $bindable(),
		schema = null,
		githubToken = '',
		gistId = ''
	} = $props();

	// History state
	let historyEntries = $state<Array<{
		version: string;
		committedAt: string;
		content: any;
		isLoading?: boolean;
	}>>([]);
	let isLoadingHistory = $state(false);
	let historyOpen = $state(false);
	let selectedHistoryVersion = $state<string | null>(null);

	// Preview mode: "side" (side-by-side or stacked preview) or "tab"
	let activeTab = $state<'editor' | 'preview'>('editor');
	let showSidePreview = $state(true);

	// Ensure default structure for Now page schema
	$effect(() => {
		if (!formData || typeof formData !== 'object') {
			formData = {};
		}
		if (formData.status === undefined) formData.status = '';
		if (!Array.isArray(formData.projects)) formData.projects = [];
		if (!Array.isArray(formData.plans)) formData.plans = [];
		if (!Array.isArray(formData.activities)) formData.activities = [];
		if (formData.location === undefined) formData.location = '';
		if (!formData.playlist || typeof formData.playlist !== 'object') {
			formData.playlist = { name: '', uri: '', url: '' };
		}
	});

	// Helper for array fields
	function addArrayItem(field: 'projects' | 'plans' | 'activities') {
		if (!Array.isArray(formData[field])) {
			formData[field] = [];
		}
		formData[field] = [...formData[field], ''];
	}

	function removeArrayItem(field: 'projects' | 'plans' | 'activities', index: number) {
		formData[field] = formData[field].filter((_: any, i: number) => i !== index);
	}

	function moveArrayItem(field: 'projects' | 'plans' | 'activities', index: number, direction: -1 | 1) {
		const newArr = [...formData[field]];
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= newArr.length) return;
		[newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
		formData[field] = newArr;
	}

	// Fetch Gist history entries on demand
	async function loadHistory() {
		if (historyEntries.length > 0 || isLoadingHistory) return;
		if (!githubToken || !gistId) {
			toast.error('GitHub token and Gist ID are required to load history');
			return;
		}

		isLoadingHistory = true;
		try {
			const api = new GitHubGistAPI(githubToken);
			const commits = await api.fetchGistHistory(gistId);

			historyEntries = commits.slice(0, 20).map((commit) => ({
				version: commit.version,
				committedAt: commit.committed_at,
				content: null
			}));
		} catch (error) {
			console.error('Failed to load history commits:', error);
			toast.error('Failed to load history entries');
		} finally {
			isLoadingHistory = false;
		}
	}

	async function loadHistoryContent(version: string) {
		const entryIndex = historyEntries.findIndex((h) => h.version === version);
		if (entryIndex === -1) return;

		if (historyEntries[entryIndex].content) {
			selectedHistoryVersion = version;
			return;
		}

		historyEntries[entryIndex].isLoading = true;
		try {
			const response = await fetch(`https://api.github.com/gists/${gistId}/${version}`, {
				headers: githubToken
					? {
							Authorization: `token ${githubToken}`,
							Accept: 'application/vnd.github.v3+json'
						}
					: {
							Accept: 'application/vnd.github.v3+json'
						}
			});

			if (!response.ok) throw new Error('Failed to fetch commit content');
			const gistCommit = await response.json();
			const nowFile = gistCommit.files['now.json'];

			if (nowFile && nowFile.content) {
				historyEntries[entryIndex].content = JSON.parse(nowFile.content);
				selectedHistoryVersion = version;
			} else {
				toast.error('no now.json found in this commit');
			}
		} catch (e) {
			console.error('Error fetching commit version:', e);
			toast.error('Failed to load version details');
		} finally {
			historyEntries[entryIndex].isLoading = false;
		}
	}

	function restoreHistoricalEntry(content: any) {
		if (!content) return;
		formData = structuredClone(content);
		toast.success('Restored entry from history!');
	}

	function copyFieldFromHistory(field: string, value: any) {
		if (value === undefined) return;
		formData[field] = structuredClone(value);
		toast.success(`Copied "${field}" from historical entry!`);
	}

	// Derived values for preview
	let formattedProjects = $derived(
		Array.isArray(formData?.projects) && formData.projects.length
			? '- ' + formData.projects.filter(Boolean).join('\n- ')
			: ''
	);
	let formattedPlans = $derived(
		Array.isArray(formData?.plans) && formData.plans.length
			? '- ' + formData.plans.filter(Boolean).join('\n- ')
			: ''
	);
	let formattedActivities = $derived(
		Array.isArray(formData?.activities) && formData.activities.length
			? '- ' + formData.activities.filter(Boolean).join('\n- ')
			: ''
	);
</script>

<div class="space-y-6">
	<!-- History collapsible banner -->
	<Collapsible.Root bind:open={historyOpen} onOpenChange={(open) => { if (open) loadHistory(); }}>
		<Card class="border-dashed bg-muted/30">
			<Collapsible.Trigger class="flex w-full items-center justify-between p-4 text-left font-medium">
				<div class="flex items-center gap-2">
					<History class="h-4 w-4 text-primary" />
					<span>Version History & Draft Recovery</span>
					{#if historyEntries.length > 0}
						<span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
							{historyEntries.length} revisions available
						</span>
					{/if}
				</div>
				<ChevronDown class="h-4 w-4 transition-transform duration-200 {historyOpen ? 'rotate-180' : ''}" />
			</Collapsible.Trigger>

			<Collapsible.Content class="px-4 pb-4">
				{#if isLoadingHistory}
					<div class="flex items-center gap-2 py-4 text-sm text-muted-foreground">
						<Clock class="h-4 w-4 animate-spin" /> Loading history revisions from GitHub...
					</div>
				{:else if historyEntries.length === 0}
					<p class="py-2 text-sm text-muted-foreground">
						No history loaded yet. Make sure a valid token is provided.
					</p>
				{:else}
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
						<!-- Revisions list -->
						<div class="max-h-60 space-y-1 overflow-y-auto pr-1 border-r pr-3">
							{#each historyEntries as rev}
								<button
									type="button"
									onclick={() => loadHistoryContent(rev.version)}
									class="flex w-full items-center justify-between rounded p-2 text-left text-xs hover:bg-accent {selectedHistoryVersion === rev.version ? 'bg-accent font-semibold' : ''}"
								>
									<span class="truncate">{formatDate(rev.committedAt)}</span>
									{#if rev.isLoading}
										<span class="text-muted-foreground">loading...</span>
									{:else if rev.content}
										<span class="text-xs text-emerald-600 font-medium">Loaded</span>
									{/if}
								</button>
							{/each}
						</div>

						<!-- Selected revision detail -->
						<div class="lg:col-span-2 space-y-3">
							{#if selectedHistoryVersion}
								{@const selectedEntry = historyEntries.find((h) => h.version === selectedHistoryVersion)}
								{#if selectedEntry?.content}
									<div class="flex items-center justify-between rounded bg-background p-2 border">
										<span class="text-xs font-semibold text-muted-foreground">
											Revision from {formatDate(selectedEntry.committedAt)}
										</span>
										<Button
											size="sm"
											variant="default"
											onclick={() => restoreHistoricalEntry(selectedEntry.content)}
										>
											<RotateCcw class="mr-1 h-3.5 w-3.5" />
											Restore Entire Entry
										</Button>
									</div>

									<div class="space-y-2 text-xs">
										<div class="flex items-center justify-between rounded border bg-card p-2">
											<span class="font-medium truncate max-w-[70%]">Status: "{selectedEntry.content.status || ''}"</span>
											<Button
												size="sm"
												variant="ghost"
												class="h-6 px-2 text-xs"
												onclick={() => copyFieldFromHistory('status', selectedEntry.content.status)}
											>
												<Copy class="mr-1 h-3 w-3" /> Copy Status
											</Button>
										</div>

										<div class="flex items-center justify-between rounded border bg-card p-2">
											<span class="font-medium">Projects ({selectedEntry.content.projects?.length || 0})</span>
											<Button
												size="sm"
												variant="ghost"
												class="h-6 px-2 text-xs"
												onclick={() => copyFieldFromHistory('projects', selectedEntry.content.projects)}
											>
												<Copy class="mr-1 h-3 w-3" /> Copy Projects
											</Button>
										</div>

										<div class="flex items-center justify-between rounded border bg-card p-2">
											<span class="font-medium">Plans ({selectedEntry.content.plans?.length || 0})</span>
											<Button
												size="sm"
												variant="ghost"
												class="h-6 px-2 text-xs"
												onclick={() => copyFieldFromHistory('plans', selectedEntry.content.plans)}
											>
												<Copy class="mr-1 h-3 w-3" /> Copy Plans
											</Button>
										</div>

										{#if selectedEntry.content.activities}
											<div class="flex items-center justify-between rounded border bg-card p-2">
												<span class="font-medium">Activities ({selectedEntry.content.activities?.length || 0})</span>
												<Button
													size="sm"
													variant="ghost"
													class="h-6 px-2 text-xs"
													onclick={() => copyFieldFromHistory('activities', selectedEntry.content.activities)}
												>
													<Copy class="mr-1 h-3 w-3" /> Copy Activities
												</Button>
											</div>
										{/if}
									</div>
								{:else if selectedEntry?.isLoading}
									<p class="text-xs text-muted-foreground py-4">Fetching content for this revision...</p>
								{/if}
							{:else}
								<p class="text-xs text-muted-foreground py-4 text-center">
									Select a revision on the left to inspect its fields or restore it.
								</p>
							{/if}
						</div>
					</div>
				{/if}
			</Collapsible.Content>
		</Card>
	</Collapsible.Root>

	<!-- Main Editor / Preview split screen controls -->
	<div class="flex items-center justify-between border-b pb-3">
		<div class="flex items-center gap-2">
			<Button
				variant={activeTab === 'editor' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeTab = 'editor')}
			>
				<FileText class="mr-1.5 h-4 w-4" /> Form Fields
			</Button>
			<Button
				variant={activeTab === 'preview' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeTab = 'preview')}
			>
				<Eye class="mr-1.5 h-4 w-4" /> Full Preview
			</Button>
		</div>

		<Button
			variant="ghost"
			size="sm"
			class="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground"
			onclick={() => (showSidePreview = !showSidePreview)}
		>
			<Sparkles class="h-3.5 w-3.5" />
			{showSidePreview ? 'Hide Side Preview' : 'Show Side Preview'}
		</Button>
	</div>

	<!-- Layout Container -->
	<div class="grid grid-cols-1 gap-6 {showSidePreview && activeTab === 'editor' ? 'xl:grid-cols-12' : ''}">
		<!-- Form Fields Editor Column -->
		{#if activeTab === 'editor'}
			<div class="space-y-6 {showSidePreview ? 'xl:col-span-7' : ''}">
				<!-- Status section -->
				<div class="space-y-2">
					<Label for="now-status" class="flex items-center gap-1.5 font-semibold text-base">
						<InfoIcon class="h-4 w-4 text-primary" /> Status (Markdown supported)
					</Label>
					<Textarea
						id="now-status"
						bind:value={formData.status}
						rows={3}
						placeholder="What are you currently focused on?"
						class="font-mono text-sm"
					/>
					<p class="text-xs text-muted-foreground">Markdown syntax like links or bold text can be used.</p>
				</div>

				<!-- Location & Playlist row -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="now-location" class="flex items-center gap-1.5 font-semibold">
							<MapPin class="h-4 w-4 text-primary" /> Location
						</Label>
						<Input
							id="now-location"
							bind:value={formData.location}
							placeholder="e.g. Mainz, Germany"
						/>
					</div>

					<div class="space-y-2 border rounded-lg p-3 bg-muted/10">
						<Label class="flex items-center gap-1.5 font-semibold">
							<Music class="h-4 w-4 text-primary" /> Playlist Details
						</Label>
						<div class="space-y-2">
							<Input
								bind:value={formData.playlist.name}
								placeholder="Playlist Name"
								class="text-xs h-8"
							/>
							<Input
								bind:value={formData.playlist.url}
								placeholder="URL (Apple Music / Spotify)"
								class="text-xs h-8"
							/>
							<Input
								bind:value={formData.playlist.uri}
								placeholder="URI (Optional Spotify URI)"
								class="text-xs h-8"
							/>
						</div>
					</div>
				</div>

				<!-- Projects List -->
				<div class="space-y-3 border rounded-lg p-4 bg-card">
					<div class="flex items-center justify-between">
						<Label class="flex items-center gap-1.5 font-semibold text-base">
							<Code class="h-4 w-4 text-primary" /> Projects
						</Label>
						<Button size="sm" variant="outline" onclick={() => addArrayItem('projects')}>
							<Plus class="mr-1 h-3.5 w-3.5" /> Add Project
						</Button>
					</div>
					{#if formData.projects.length === 0}
						<p class="text-xs text-muted-foreground italic py-2">No projects added yet.</p>
					{:else}
						<div class="space-y-2">
							{#each formData.projects as _, idx}
								<div class="flex items-center gap-2">
									<Input
										bind:value={formData.projects[idx]}
										placeholder="e.g. Building [Jones](https://jones.expo.app)"
										class="flex-1 font-mono text-sm"
									/>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										disabled={idx === 0}
										onclick={() => moveArrayItem('projects', idx, -1)}
										title="Move Up"
									>
										<ArrowUp class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										disabled={idx === formData.projects.length - 1}
										onclick={() => moveArrayItem('projects', idx, 1)}
										title="Move Down"
									>
										<ArrowDown class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive hover:bg-destructive/10"
										onclick={() => removeArrayItem('projects', idx)}
										title="Delete"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Plans List -->
				<div class="space-y-3 border rounded-lg p-4 bg-card">
					<div class="flex items-center justify-between">
						<Label class="flex items-center gap-1.5 font-semibold text-base">
							<Calendar class="h-4 w-4 text-primary" /> Plans
						</Label>
						<Button size="sm" variant="outline" onclick={() => addArrayItem('plans')}>
							<Plus class="mr-1 h-3.5 w-3.5" /> Add Plan
						</Button>
					</div>
					{#if formData.plans.length === 0}
						<p class="text-xs text-muted-foreground italic py-2">No plans added yet.</p>
					{:else}
						<div class="space-y-2">
							{#each formData.plans as _, idx}
								<div class="flex items-center gap-2">
									<Input
										bind:value={formData.plans[idx]}
										placeholder="e.g. Releasing my app soon"
										class="flex-1 font-mono text-sm"
									/>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										disabled={idx === 0}
										onclick={() => moveArrayItem('plans', idx, -1)}
										title="Move Up"
									>
										<ArrowUp class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										disabled={idx === formData.plans.length - 1}
										onclick={() => moveArrayItem('plans', idx, 1)}
										title="Move Down"
									>
										<ArrowDown class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive hover:bg-destructive/10"
										onclick={() => removeArrayItem('plans', idx)}
										title="Delete"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Activities List -->
				<div class="space-y-3 border rounded-lg p-4 bg-card">
					<div class="flex items-center justify-between">
						<Label class="flex items-center gap-1.5 font-semibold text-base">
							<Sparkles class="h-4 w-4 text-primary" /> Activities
						</Label>
						<Button size="sm" variant="outline" onclick={() => addArrayItem('activities')}>
							<Plus class="mr-1 h-3.5 w-3.5" /> Add Activity
						</Button>
					</div>
					{#if formData.activities.length === 0}
						<p class="text-xs text-muted-foreground italic py-2">No activities added yet.</p>
					{:else}
						<div class="space-y-2">
							{#each formData.activities as _, idx}
								<div class="flex items-center gap-2">
									<Input
										bind:value={formData.activities[idx]}
										placeholder="e.g. Traveled in Canada for 2 Weeks"
										class="flex-1 font-mono text-sm"
									/>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										disabled={idx === 0}
										onclick={() => moveArrayItem('activities', idx, -1)}
										title="Move Up"
									>
										<ArrowUp class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										disabled={idx === formData.activities.length - 1}
										onclick={() => moveArrayItem('activities', idx, 1)}
										title="Move Down"
									>
										<ArrowDown class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive hover:bg-destructive/10"
										onclick={() => removeArrayItem('activities', idx)}
										title="Delete"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Dynamic schema fields fallback if schema has extra properties -->
				{#if schema && schema.properties}
					{@const knownKeys = ['status', 'projects', 'plans', 'activities', 'location', 'playlist', 'updatedAt', '$schema']}
					{@const extraKeys = Object.keys(schema.properties).filter((k) => !knownKeys.includes(k))}
					{#if extraKeys.length > 0}
						<div class="space-y-3 border rounded-lg p-4 bg-muted/20">
							<h4 class="font-semibold text-sm">Additional Schema Fields</h4>
							{#each extraKeys as key}
								<div class="space-y-1">
									<Label class="capitalize text-xs">{key}</Label>
									<Input bind:value={formData[key]} class="h-8 text-xs" />
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- Live Rendered Preview Column (or Full Preview tab) -->
		{#if activeTab === 'preview' || showSidePreview}
			<div class="space-y-4 {activeTab === 'editor' ? 'xl:col-span-5 border-l pl-0 xl:pl-6' : 'w-full'}">
				<div class="flex items-center justify-between border-b pb-2">
					<div class="flex items-center gap-2">
						<Eye class="h-4 w-4 text-primary" />
						<h3 class="font-bold text-base">Live Preview</h3>
					</div>
					<span class="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
						Real-time
					</span>
				</div>

				<!-- Rendered Card Grid matching /now page layout -->
				<div class="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
					<!-- Status Card -->
					<Card class="p-4">
						<Heading depth={2} class="mb-2 text-lg">
							<InfoIcon class="mb-0.5 mr-2 inline-block h-4 w-4" />
							{i18n.t('now.status')}
						</Heading>
						<div class="prose prose-sm dark:prose-invert">
							{#if formData.status}
								<MdSvelte source={formData.status} {renderers} />
							{:else}
								<p class="text-xs text-muted-foreground italic">No status set</p>
							{/if}
						</div>
					</Card>

					<!-- Location Card -->
					<Card class="p-4">
						<Heading depth={2} class="mb-2 text-lg">
							<MapPin class="mr-2 inline-block h-4 w-4" />
							{i18n.t('now.location')}
						</Heading>
						<p class="text-sm">{formData.location || 'Not set'}</p>
					</Card>

					<!-- Playlist Card -->
					<Card class="p-4">
						<Heading depth={2} class="mb-2 text-lg">
							<Music class="mr-2 inline-block h-4 w-4" />
							{i18n.t('common.playlist')}
						</Heading>
						{#if formData.playlist && formData.playlist.name}
							<div class="text-sm">
								{#if formData.playlist.url}
									<Link href={formData.playlist.url} target="_blank" rel="noopener noreferrer">
										{formData.playlist.name}
									</Link>
								{:else}
									<span>{formData.playlist.name}</span>
								{/if}
							</div>
						{:else}
							<p class="text-xs text-muted-foreground">{i18n.t('now.no_playlist')}</p>
						{/if}
					</Card>

					<!-- Plans Card -->
					<Card class="p-4">
						<Heading depth={2} class="mb-2 text-lg">
							<Calendar class="mr-2 inline-block h-4 w-4" />
							{i18n.t('now.plans')}
						</Heading>
						<div class="prose prose-sm dark:prose-invert">
							{#if formattedPlans}
								<MdSvelte source={formattedPlans} {renderers} />
							{:else}
								<p class="text-xs text-muted-foreground italic">No plans listed</p>
							{/if}
						</div>
					</Card>

					<!-- Projects Card -->
					<Card class="p-4">
						<Heading depth={2} class="mb-2 text-lg">
							<Code class="mr-2 inline-block h-4 w-4" />
							{i18n.t('common.projects')}
						</Heading>
						<div class="prose prose-sm dark:prose-invert">
							{#if formattedProjects}
								<MdSvelte source={formattedProjects} {renderers} />
							{:else}
								<p class="text-xs text-muted-foreground italic">No projects listed</p>
							{/if}
						</div>
					</Card>

					<!-- Activities Card (if present) -->
					{#if formattedActivities}
						<Card class="p-4">
							<Heading depth={2} class="mb-2 text-lg">
								<Sparkles class="mr-2 inline-block h-4 w-4" />
								Activities
							</Heading>
							<div class="prose prose-sm dark:prose-invert">
								<MdSvelte source={formattedActivities} {renderers} />
							</div>
						</Card>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
