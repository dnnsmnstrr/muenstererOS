<script lang="ts">
	import PlaylistScreensaver from '$lib/components/PlaylistScreensaver.svelte';
</script>

<svelte:head>
	<title>Playlist Covers</title>
</svelte:head>

<div class="fixed inset-0 z-40 h-screen w-screen overflow-hidden bg-black">
	<PlaylistScreensaver standalone={true} />
</div>
