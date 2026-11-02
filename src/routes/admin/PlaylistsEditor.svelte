<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import {
		Plus,
		Trash2,
		ArrowUp,
		ArrowDown,
		Music,
		ListMusic,
		Sparkles,
		History,
		RotateCcw,
		Copy,
		Clock,
		ChevronDown,
		Eye,
		FileText,
		ExternalLink,
		Search,
		Wand2,
		AlertCircle,
		Check,
		CopyPlus,
		Link2,
		Image as ImageIcon,
		Film
	} from 'lucide-svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { formatDate } from '$lib/utils/helper';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { GitHubGistAPI } from '$lib/utils/github-api';
	import { toast } from 'svelte-sonner';
	import {
		stripTrackingParams,
		extractSpotifyId,
		validateUrl,
		parseQuickPlaylistInput
	} from '$lib/utils/playlist-url';
	import type { PlaylistItem } from '$lib/types';
	import PlaylistCard from '../playlists/PlaylistCard.svelte';

	let {
		formData = $bindable(),
		schema = null,
		githubToken = '',
		gistId = ''
	} = $props();

	// History state
	let historyEntries = $state<
		Array<{
			version: string;
			committedAt: string;
			content: any;
			isLoading?: boolean;
		}>
	>([]);
	let isLoadingHistory = $state(false);
	let historyOpen = $state(false);
	let selectedHistoryVersion = $state<string | null>(null);

	// Tab / View mode: "editor" or "preview"
	let activeTab = $state<'editor' | 'preview'>('editor');
	let showSidePreview = $state(true);

	// Search filter for existing playlists
	let playlistSearch = $state('');

	// Current month auto-season helper
	function getCurrentSeason(): 'winter' | 'spring' | 'summer' | 'autumn' {
		const month = new Date().getMonth() + 1; // 1 - 12
		if (month === 12 || month === 1 || month === 2) return 'winter';
		if (month >= 3 && month <= 5) return 'spring';
		if (month >= 6 && month <= 8) return 'summer';
		return 'autumn';
	}

	// New Playlist Form State
	let quickPasteInput = $state('');
	let newTitle = $state('');
	let newType = $state<'season' | 'theme' | 'aggregated' | 'hidden'>('season');
	let newSeason = $state<'winter' | 'spring' | 'summer' | 'autumn' | ''>(getCurrentSeason());
	let newYear = $state<number | ''>(new Date().getFullYear());
	let newEmoji = $state('');
	let newUri = $state('');
	let newUrl = $state('');
	let newGif = $state('');
	let newImageUrl = $state('');
	let newDescription = $state('');

	// Expanded state for editing existing playlists (track indices)
	let expandedItems = $state<Record<number, boolean>>({});

	// Selected playlist for preview
	let previewIndex = $state<number | null>(null);

	// Ensure default structure for Playlists schema
	$effect(() => {
		if (!formData || typeof formData !== 'object') {
			formData = { playlists: [] };
		}
		if (!Array.isArray(formData.playlists)) {
			formData.playlists = [];
		}
	});

	// Quick paste import handler
	function handleQuickPaste() {
		if (!quickPasteInput.trim()) return;

		const parsed = parseQuickPlaylistInput(quickPasteInput);

		if (parsed.uri) newUri = parsed.uri;
		if (parsed.url) newUrl = parsed.url;
		if (parsed.gif) newGif = parsed.gif;
		if (parsed.imageUrl) newImageUrl = parsed.imageUrl;

		if (parsed.wasCleaned) {
			toast.success('Pasted link imported with tracking parameters automatically stripped!');
		} else {
			toast.success('Pasted details imported into form!');
		}

		quickPasteInput = '';
	}

	// Auto-clean URL field helper
	function cleanFieldUrl(
		fieldGetter: () => string,
		fieldSetter: (val: string) => void,
		fieldName: string
	) {
		const raw = fieldGetter();
		if (!raw) return;
		const { cleanedUrl, wasStripped } = stripTrackingParams(raw);
		if (wasStripped) {
			fieldSetter(cleanedUrl);
			toast.info(`Cleaned tracking parameters from ${fieldName}`);
		}
	}

	// Handle URI input change (auto-extract Spotify ID if URL/URI pasted)
	function handleUriInput(raw: string, setter: (val: string) => void) {
		const info = extractSpotifyId(raw);
		if (info.isUrlOrUri) {
			setter(info.id);
			toast.info(`Extracted Spotify Playlist ID: ${info.id}`);
		} else {
			setter(raw);
		}
	}

	// Validation derived state for new playlist form
	let newUrlValidation = $derived(validateUrl(newUrl));
	let newGifValidation = $derived(validateUrl(newGif));
	let newImageUrlValidation = $derived(validateUrl(newImageUrl));

	// Add new playlist to formData.playlists
	function addPlaylist() {
		if (!newTitle.trim()) {
			toast.error('Playlist title is required!');
			return;
		}

		if (!newUrlValidation.valid) {
			toast.error(`Invalid URL: ${newUrlValidation.error}`);
			return;
		}
		if (!newGifValidation.valid) {
			toast.error(`Invalid GIF URL: ${newGifValidation.error}`);
			return;
		}
		if (!newImageUrlValidation.valid) {
			toast.error(`Invalid Image URL: ${newImageUrlValidation.error}`);
			return;
		}

		const item: PlaylistItem = {
			title: newTitle.trim(),
			type: newType,
			uri: newUri.trim(),
			...(newType === 'season' && newSeason ? { season: newSeason as any } : {}),
			...(newType === 'season' && newYear ? { year: Number(newYear) } : {}),
			...(newEmoji.trim() ? { emoji: newEmoji.trim() } : {}),
			...(newUrl.trim() ? { url: stripTrackingParams(newUrl).cleanedUrl } : {}),
			...(newGif.trim() ? { gif: stripTrackingParams(newGif).cleanedUrl } : {}),
			...(newImageUrl.trim() ? { imageUrl: stripTrackingParams(newImageUrl).cleanedUrl } : {}),
			...(newDescription.trim() ? { description: newDescription.trim() } : {})
		};

		// Insert at the top of the array so it appears first on the page
		formData.playlists = [item, ...formData.playlists];

		// Reset form
		newTitle = '';
		newEmoji = '';
		newUri = '';
		newUrl = '';
		newGif = '';
		newImageUrl = '';
		newDescription = '';

		toast.success(`Added playlist "${item.title}"!`);
	}

	function removePlaylist(index: number) {
		const item = formData.playlists[index];
		formData.playlists = formData.playlists.filter((_: any, i: number) => i !== index);
		toast.success(`Removed playlist "${item?.title || 'item'}"`);
	}

	function duplicatePlaylist(index: number) {
		const item = formData.playlists[index];
		if (!item) return;
		const clone = { ...structuredClone(item), title: `${item.title} (Copy)` };
		formData.playlists.splice(index + 1, 0, clone);
		formData.playlists = [...formData.playlists];
		toast.success(`Duplicated "${item.title}"`);
	}

	function movePlaylist(index: number, direction: -1 | 1) {
		const newArr = [...formData.playlists];
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= newArr.length) return;
		[newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
		formData.playlists = newArr;
	}

	function cleanAllLinksInPlaylist(index: number) {
		const item = formData.playlists[index];
		if (!item) return;

		let cleanedCount = 0;
		if (item.url) {
			const { cleanedUrl, wasStripped } = stripTrackingParams(item.url);
			if (wasStripped) {
				item.url = cleanedUrl;
				cleanedCount++;
			}
		}
		if (item.gif) {
			const { cleanedUrl, wasStripped } = stripTrackingParams(item.gif);
			if (wasStripped) {
				item.gif = cleanedUrl;
				cleanedCount++;
			}
		}
		if (item.imageUrl) {
			const { cleanedUrl, wasStripped } = stripTrackingParams(item.imageUrl);
			if (wasStripped) {
				item.imageUrl = cleanedUrl;
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			formData.playlists = [...formData.playlists];
			toast.success(`Stripped tracking parameters from ${cleanedCount} field(s)!`);
		} else {
			toast.info('All link fields are already clean.');
		}
	}

	// Filtered playlists
	let filteredPlaylists = $derived(
		Array.isArray(formData?.playlists)
			? formData.playlists.map((p: PlaylistItem, originalIndex: number) => ({ p, originalIndex })).filter(({ p }: { p: PlaylistItem }) => {
					if (!playlistSearch.trim()) return true;
					const q = playlistSearch.toLowerCase();
					return (
						p.title?.toLowerCase().includes(q) ||
						p.description?.toLowerCase().includes(q) ||
						p.season?.toLowerCase().includes(q) ||
						p.year?.toString().includes(q) ||
						p.type?.toLowerCase().includes(q)
					);
				})
			: []
	);

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
			const playlistsFile = gistCommit.files['playlists.json'];

			if (playlistsFile && playlistsFile.content) {
				historyEntries[entryIndex].content = JSON.parse(playlistsFile.content);
				selectedHistoryVersion = version;
			} else {
				toast.error('no playlists.json found in this commit');
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
		toast.success('Restored playlists dataset from history!');
	}

	// Active preview item
	let previewItem = $derived<PlaylistItem>(
		previewIndex !== null && formData?.playlists?.[previewIndex]
			? formData.playlists[previewIndex]
			: formData?.playlists?.[0] || {
					title: newTitle || 'Preview Playlist',
					type: newType,
					season: newSeason as any,
					year: Number(newYear) || 2025,
					emoji: newEmoji || '🎵',
					uri: newUri,
					url: newUrl,
					gif: newGif,
					imageUrl: newImageUrl,
					description: newDescription
				}
	);

	const typeOptions = [
		{ value: 'season', label: 'Seasonal Playlist' },
		{ value: 'theme', label: 'Themed Playlist' },
		{ value: 'aggregated', label: 'Aggregated Playlist' },
		{ value: 'hidden', label: 'Hidden' }
	];

	const seasonOptions = [
		{ value: 'winter', label: 'Winter ❄️' },
		{ value: 'spring', label: 'Spring 🌸' },
		{ value: 'summer', label: 'Summer ☀️' },
		{ value: 'autumn', label: 'Autumn 🍁' }
	];
</script>

{#if formData}
<div class="space-y-6">
	<!-- History collapsible banner -->
	<Collapsible.Root bind:open={historyOpen} onOpenChange={(open) => { if (open) loadHistory(); }}>
		<Card class="border-dashed bg-muted/30">
			<Collapsible.Trigger class="flex w-full items-center justify-between p-4 text-left font-medium">
				<div class="flex items-center gap-2">
					<History class="h-4 w-4 text-primary" />
					<span>Playlists Version History & Draft Recovery</span>
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
						<div class="max-h-60 space-y-1 overflow-y-auto border-r pr-3">
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
											Restore Entire Playlists Dataset
										</Button>
									</div>

									<p class="text-xs text-muted-foreground">
										Contains {selectedEntry.content.playlists?.length || 0} playlists.
									</p>
								{:else if selectedEntry?.isLoading}
									<p class="text-xs text-muted-foreground py-4">Fetching content for this revision...</p>
								{/if}
							{:else}
								<p class="text-xs text-muted-foreground py-4 text-center">
									Select a revision on the left to inspect or restore it.
								</p>
							{/if}
						</div>
					</div>
				{/if}
			</Collapsible.Content>
		</Card>
	</Collapsible.Root>

	<!-- Main Header Controls -->
	<div class="flex items-center justify-between border-b pb-3">
		<div class="flex items-center gap-2">
			<Button
				variant={activeTab === 'editor' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeTab = 'editor')}
			>
				<FileText class="mr-1.5 h-4 w-4" /> Form & List
			</Button>
			<Button
				variant={activeTab === 'preview' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (activeTab = 'preview')}
			>
				<Eye class="mr-1.5 h-4 w-4" /> Card Preview
			</Button>
		</div>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				href="/playlists"
				target="_blank"
				class="flex items-center gap-1.5 text-xs"
			>
				<ExternalLink class="h-3.5 w-3.5" /> View /playlists Page
			</Button>
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
	</div>

	<!-- Layout Grid -->
	<div class="grid grid-cols-1 gap-6 {showSidePreview && activeTab === 'editor' ? 'xl:grid-cols-12' : ''}">
		<!-- Editor Column -->
		{#if activeTab === 'editor'}
			<div class="space-y-6 {showSidePreview ? 'xl:col-span-7' : ''}">

				<!-- Quick Import / URL paste box -->
				<div class="space-y-2 border rounded-xl p-4 bg-primary/5 border-primary/20">
					<Label class="flex items-center gap-1.5 font-semibold text-sm text-primary">
						<Wand2 class="h-4 w-4" /> Quick Import / Paste Link or Spotify URI
					</Label>
					<p class="text-xs text-muted-foreground">
						Paste a Spotify link, Spotify URI, Apple Music URL, or GIF/Image link. Tracking parameters like <code>?si=</code> will be stripped automatically.
					</p>
					<div class="flex items-center gap-2">
						<Input
							bind:value={quickPasteInput}
							placeholder="e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=123"
							class="text-xs font-mono h-9 bg-background"
							onkeydown={(e) => { if (e.key === 'Enter') handleQuickPaste(); }}
						/>
						<Button size="sm" onclick={handleQuickPaste}>
							Import
						</Button>
					</div>
				</div>

				<!-- Purpose-Built "Add New Playlist" Form -->
				<Card class="border-2 border-primary/20 shadow-sm">
					<CardHeader class="pb-3">
						<CardTitle class="flex items-center justify-between text-base">
							<span class="flex items-center gap-2">
								<Plus class="h-4 w-4 text-primary" /> Add New Playlist
							</span>
							<span class="text-xs font-normal text-muted-foreground">
								Auto-strips tracking parameters
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4 text-sm">
						<!-- Title & Emoji row -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
							<div class="sm:col-span-3 space-y-1">
								<Label for="new-title" class="font-semibold text-xs">
									Title <span class="text-destructive">*</span>
								</Label>
								<Input
									id="new-title"
									bind:value={newTitle}
									placeholder="e.g. Summer Breeze"
									class="h-9 text-xs"
								/>
							</div>
							<div class="space-y-1">
								<Label for="new-emoji" class="font-semibold text-xs">Emoji</Label>
								<Input
									id="new-emoji"
									bind:value={newEmoji}
									placeholder="e.g. 🌊"
									class="h-9 text-xs"
								/>
							</div>
						</div>

						<!-- Type, Season, Year row -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div class="space-y-1">
								<Label class="font-semibold text-xs">Type</Label>
								<CustomSelect
									value={newType}
									options={typeOptions}
									onValueChange={(val) => (newType = val as any)}
									class="h-9 text-xs"
								/>
							</div>

							{#if newType === 'season'}
								<div class="space-y-1">
									<Label class="font-semibold text-xs">Season</Label>
									<CustomSelect
										value={newSeason}
										options={seasonOptions}
										onValueChange={(val) => (newSeason = val as any)}
										class="h-9 text-xs"
									/>
								</div>

								<div class="space-y-1">
									<Label for="new-year" class="font-semibold text-xs">Year</Label>
									<Input
										id="new-year"
										type="number"
										bind:value={newYear}
										placeholder="2025"
										class="h-9 text-xs"
									/>
								</div>
							{/if}
						</div>

						<!-- Spotify URI input -->
						<div class="space-y-1">
							<Label for="new-uri" class="flex items-center justify-between text-xs font-semibold">
								<span>Spotify Playlist URI / ID</span>
								<span class="text-muted-foreground font-normal">e.g. 37i9dQZF1DXcBWIGoYBM5M</span>
							</Label>
							<Input
								id="new-uri"
								value={newUri}
								oninput={(e) => handleUriInput((e.target as HTMLInputElement).value, (val) => (newUri = val))}
								placeholder="Paste Spotify URI or Playlist ID"
								class="h-9 font-mono text-xs"
							/>
						</div>

						<!-- URL input with live validation & auto-cleaning -->
						<div class="space-y-1">
							<div class="flex items-center justify-between">
								<Label for="new-url" class="font-semibold text-xs flex items-center gap-1">
									<Link2 class="h-3.5 w-3.5 text-primary" /> Apple Music / Web URL
								</Label>
								{#if !newUrlValidation.valid}
									<span class="flex items-center gap-1 text-[11px] text-destructive">
										<AlertCircle class="h-3 w-3" /> {newUrlValidation.error}
									</span>
								{:else if newUrl.trim()}
									<span class="flex items-center gap-1 text-[11px] text-emerald-600">
										<Check class="h-3 w-3" /> Valid Link
									</span>
								{/if}
							</div>
							<div class="flex gap-2">
								<Input
									id="new-url"
									bind:value={newUrl}
									onblur={() => cleanFieldUrl(() => newUrl, (v) => (newUrl = v), 'Apple Music / Web URL')}
									placeholder="https://music.apple.com/de/playlist/..."
									class="h-9 font-mono text-xs flex-1 { !newUrlValidation.valid ? 'border-destructive' : '' }"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									class="h-9 px-2 text-xs"
									onclick={() => cleanFieldUrl(() => newUrl, (v) => (newUrl = v), 'Apple Music / Web URL')}
								>
									Clean
								</Button>
							</div>
						</div>

						<!-- GIF & Cover Image inputs -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<Label for="new-gif" class="font-semibold text-xs flex items-center gap-1">
										<Film class="h-3.5 w-3.5 text-primary" /> GIF URL
									</Label>
									{#if !newGifValidation.valid}
										<span class="text-[10px] text-destructive">Invalid URL</span>
									{/if}
								</div>
								<Input
									id="new-gif"
									bind:value={newGif}
									onblur={() => cleanFieldUrl(() => newGif, (v) => (newGif = v), 'GIF URL')}
									placeholder="https://media.giphy.com/..."
									class="h-9 font-mono text-xs { !newGifValidation.valid ? 'border-destructive' : '' }"
								/>
							</div>

							<div class="space-y-1">
								<div class="flex items-center justify-between">
									<Label for="new-image" class="font-semibold text-xs flex items-center gap-1">
										<ImageIcon class="h-3.5 w-3.5 text-primary" /> Cover Image URL
									</Label>
									{#if !newImageUrlValidation.valid}
										<span class="text-[10px] text-destructive">Invalid URL</span>
									{/if}
								</div>
								<Input
									id="new-image"
									bind:value={newImageUrl}
									onblur={() => cleanFieldUrl(() => newImageUrl, (v) => (newImageUrl = v), 'Image URL')}
									placeholder="https://is1-ssl.mzstatic.com/..."
									class="h-9 font-mono text-xs { !newImageUrlValidation.valid ? 'border-destructive' : '' }"
								/>
							</div>
						</div>

						<!-- Description -->
						<div class="space-y-1">
							<Label for="new-desc" class="font-semibold text-xs">Description</Label>
							<Textarea
								id="new-desc"
								bind:value={newDescription}
								placeholder="Optional short description..."
								rows={2}
								class="text-xs"
							/>
						</div>

						<!-- Add Button -->
						<Button onclick={addPlaylist} class="w-full">
							<Plus class="mr-1.5 h-4 w-4" /> Add Playlist to Top
						</Button>
					</CardContent>
				</Card>

				<!-- Existing Playlists List & Filter -->
				<div class="space-y-4">
					<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
						<div class="flex items-center gap-2">
							<ListMusic class="h-5 w-5 text-primary" />
							<h3 class="font-bold text-base">
								Playlists List ({formData.playlists?.length || 0})
							</h3>
						</div>

						<!-- Search Box -->
						<div class="relative w-full sm:w-64">
							<Search class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
							<Input
								bind:value={playlistSearch}
								placeholder="Search playlists..."
								class="pl-8 h-8 text-xs"
							/>
						</div>
					</div>

					{#if filteredPlaylists.length === 0}
						<div class="text-center py-8 text-muted-foreground italic text-xs border rounded-lg">
							{playlistSearch ? 'No playlists match your search filter.' : 'No playlists added yet.'}
						</div>
					{:else}
						<div class="space-y-3">
							{#each filteredPlaylists as { p, originalIndex }}
								<Card class="border shadow-xs transition-colors hover:border-primary/40">
									<CardHeader class="p-3">
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2 truncate">
												<span class="text-base">{p.emoji || '🎵'}</span>
												<span class="font-semibold text-sm truncate">{p.title || 'Untitled'}</span>
												{#if p.type === 'season' && p.season}
													<span class="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary capitalize">
														{p.season} {p.year || ''}
													</span>
												{:else if p.type}
													<span class="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground capitalize">
														{p.type}
													</span>
												{/if}
											</div>

											<div class="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													class="h-7 w-7"
													title="Preview Card"
													onclick={() => { previewIndex = originalIndex; activeTab = 'preview'; }}
												>
													<Eye class="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													class="h-7 w-7"
													disabled={originalIndex === 0}
													onclick={() => movePlaylist(originalIndex, -1)}
													title="Move Up"
												>
													<ArrowUp class="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													class="h-7 w-7"
													disabled={originalIndex === formData.playlists.length - 1}
													onclick={() => movePlaylist(originalIndex, 1)}
													title="Move Down"
												>
													<ArrowDown class="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													class="h-7 w-7"
													onclick={() => duplicatePlaylist(originalIndex)}
													title="Duplicate"
												>
													<CopyPlus class="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													class="h-7 w-7 text-destructive hover:bg-destructive/10"
													onclick={() => removePlaylist(originalIndex)}
													title="Delete"
												>
													<Trash2 class="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													class="h-7 px-2 text-xs"
													onclick={() => (expandedItems[originalIndex] = !expandedItems[originalIndex])}
												>
													{expandedItems[originalIndex] ? 'Collapse' : 'Edit'}
												</Button>
											</div>
										</div>
									</CardHeader>

									{#if expandedItems[originalIndex]}
										<CardContent class="p-3 pt-0 border-t mt-2 space-y-3 text-xs">
											<!-- Title & Emoji row -->
											<div class="grid grid-cols-1 gap-2 sm:grid-cols-4 pt-2">
												<div class="sm:col-span-3 space-y-1">
													<Label class="font-semibold text-[11px]">Title</Label>
													<Input bind:value={p.title} class="h-8 text-xs" />
												</div>
												<div class="space-y-1">
													<Label class="font-semibold text-[11px]">Emoji</Label>
													<Input bind:value={p.emoji} class="h-8 text-xs" />
												</div>
											</div>

											<!-- Type, Season, Year row -->
											<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
												<div class="space-y-1">
													<Label class="font-semibold text-[11px]">Type</Label>
													<CustomSelect
														value={p.type}
														options={typeOptions}
														onValueChange={(val) => { p.type = val as any; formData.playlists = [...formData.playlists]; }}
														class="h-8 text-xs"
													/>
												</div>
												{#if p.type === 'season'}
													<div class="space-y-1">
														<Label class="font-semibold text-[11px]">Season</Label>
														<CustomSelect
															value={p.season || ''}
															options={seasonOptions}
															onValueChange={(val) => { p.season = val as any; formData.playlists = [...formData.playlists]; }}
															class="h-8 text-xs"
														/>
													</div>
													<div class="space-y-1">
														<Label class="font-semibold text-[11px]">Year</Label>
														<Input type="number" bind:value={p.year} class="h-8 text-xs" />
													</div>
												{/if}
											</div>

											<!-- Spotify URI -->
											<div class="space-y-1">
												<Label class="font-semibold text-[11px]">Spotify URI / ID</Label>
												<Input
													value={p.uri || ''}
													oninput={(e) => handleUriInput((e.target as HTMLInputElement).value, (val) => { p.uri = val; formData.playlists = [...formData.playlists]; })}
													class="h-8 font-mono text-xs"
												/>
											</div>

											<!-- URL -->
											<div class="space-y-1">
												<div class="flex items-center justify-between">
													<Label class="font-semibold text-[11px]">Apple Music / Web URL</Label>
													{#if !validateUrl(p.url || '').valid}
														<span class="text-[10px] text-destructive">Invalid URL format</span>
													{/if}
												</div>
												<Input
													bind:value={p.url}
													onblur={() => {
														if (p.url) {
															const { cleanedUrl } = stripTrackingParams(p.url);
															p.url = cleanedUrl;
															formData.playlists = [...formData.playlists];
														}
													}}
													class="h-8 font-mono text-xs"
												/>
											</div>

											<!-- GIF & Cover Image -->
											<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
												<div class="space-y-1">
													<Label class="font-semibold text-[11px]">GIF URL</Label>
													<Input
														bind:value={p.gif}
														onblur={() => {
															if (p.gif) {
																const { cleanedUrl } = stripTrackingParams(p.gif);
																p.gif = cleanedUrl;
																formData.playlists = [...formData.playlists];
															}
														}}
														class="h-8 font-mono text-xs"
													/>
												</div>
												<div class="space-y-1">
													<Label class="font-semibold text-[11px]">Cover Image URL</Label>
													<Input
														bind:value={p.imageUrl}
														onblur={() => {
															if (p.imageUrl) {
																const { cleanedUrl } = stripTrackingParams(p.imageUrl);
																p.imageUrl = cleanedUrl;
																formData.playlists = [...formData.playlists];
															}
														}}
														class="h-8 font-mono text-xs"
													/>
												</div>
											</div>

											<!-- Description -->
											<div class="space-y-1">
												<Label class="font-semibold text-[11px]">Description</Label>
												<Textarea bind:value={p.description} rows={2} class="text-xs" />
											</div>

											<div class="flex justify-end pt-1">
												<Button
													variant="outline"
													size="sm"
													class="h-7 text-xs"
													onclick={() => cleanAllLinksInPlaylist(originalIndex)}
												>
													<Wand2 class="mr-1 h-3 w-3" /> Strip Tracking Params
												</Button>
											</div>
										</CardContent>
									{/if}
								</Card>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Live Rendered Preview Column -->
		{#if activeTab === 'preview' || showSidePreview}
			<div class="space-y-4 {activeTab === 'editor' ? 'xl:col-span-5 border-l pl-0 xl:pl-6' : 'w-full'}">
				<div class="flex items-center justify-between border-b pb-2">
					<div class="flex items-center gap-2">
						<Eye class="h-4 w-4 text-primary" />
						<h3 class="font-bold text-base">Playlist Card Preview</h3>
					</div>
					<span class="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
						Real-time
					</span>
				</div>

				<div class="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
					<p class="text-xs text-muted-foreground">
						Showing preview for: <strong>{previewItem.title || 'Untitled'}</strong>
					</p>

					<div class="max-w-sm mx-auto">
						<PlaylistCard
							playlist={previewItem}
							setSelectedPlaylistUri={() => {}}
						/>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}
