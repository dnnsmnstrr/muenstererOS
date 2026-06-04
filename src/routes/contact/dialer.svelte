<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { Volume2, VolumeX } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { createWebHaptics } from 'web-haptics/svelte';

	interface Props {
		onMatch: (code: string) => void;
		codes: Record<string, string>;
	}

	let { onMatch, codes }: Props = $props();

	let input = $state('');
	let isMuted = $state(true);
	const { trigger, destroy } = createWebHaptics({
		debug: false,
		showSwitch: false
	});

	// DTMF Frequencies
	const FREQS = {
		'1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
		'4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
		'7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
		'*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
	};

	let audioCtx: AudioContext | null = null;

	onMount(() => {
		isMuted = window.localStorage.getItem('dialer_muted') !== 'false';
		return () => destroy();
	});

	function playTone(digit: string) {
		if (isMuted) return;
		if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

		const freqs = FREQS[digit as keyof typeof FREQS];
		if (!freqs) return;

		const osc1 = audioCtx.createOscillator();
		const osc2 = audioCtx.createOscillator();
		const gainNode = audioCtx.createGain();

		osc1.frequency.value = freqs[0];
		osc2.frequency.value = freqs[1];

		osc1.type = 'sine';
		osc2.type = 'sine';

		gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

		osc1.connect(gainNode);
		osc2.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		osc1.start();
		osc2.start();
		osc1.stop(audioCtx.currentTime + 0.5);
		osc2.stop(audioCtx.currentTime + 0.5);
	}

	function handlePress(digit: string) {
		playTone(digit);
		trigger(50);
		input = (input + digit).slice(-3);

		// Check for matches in rolling input
		for (let i = 1; i <= 3; i++) {
			const sub = input.slice(-i);
			if (codes[sub]) {
				onMatch(sub);
				input = ''; // Clear after match
				break;
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (FREQS[e.key as keyof typeof FREQS]) {
			handlePress(e.key);
		}
	}

	const buttons = [
		{ digit: '1', letters: '' },
		{ digit: '2', letters: 'ABC' },
		{ digit: '3', letters: 'DEF' },
		{ digit: '4', letters: 'GHI' },
		{ digit: '5', letters: 'JKL' },
		{ digit: '6', letters: 'MNO' },
		{ digit: '7', letters: 'PQRS' },
		{ digit: '8', letters: 'TUV' },
		{ digit: '9', letters: 'WXYZ' },
		{ digit: '*', letters: '' },
		{ digit: '0', letters: '+' },
		{ digit: '#', letters: '' }
	];

	function toggleMute() {
		isMuted = !isMuted;
		window.localStorage.setItem('dialer_muted', isMuted.toString());
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col items-center gap-4 p-4 border rounded-xl bg-card shadow-sm max-w-xs mx-auto">
	<div class="w-full flex justify-between items-center mb-2">
		<div class="text-2xl font-mono h-8 tracking-widest">{input}</div>
		<Button variant="ghost" size="icon" onclick={toggleMute}>
			{#if isMuted}
				<VolumeX class="w-4 h-4" />
			{:else}
				<Volume2 class="w-4 h-4" />
			{/if}
		</Button>
	</div>

	<div class="grid grid-cols-3 gap-3">
		{#each buttons as { digit, letters }}
			<Button
				variant="outline"
				class="h-16 w-16 flex flex-col items-center justify-center rounded-full p-0 pt-1"
				onclick={() => handlePress(digit)}
			>
				<span class="text-xl font-bold leading-none">{digit}</span>
				<span class="text-[10px] uppercase opacity-60 h-3 leading-none flex items-center justify-center">{letters}</span>
			</Button>
		{/each}
	</div>
</div>
