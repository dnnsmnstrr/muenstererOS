<script lang='ts'>
    import { fade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { i18n } from '$lib/i18n/i18n.svelte';
    
    let years: Record<number, string[]> = {
        2017: ['Kanye West', 'Ahzumjot', 'Cro', 'Prinz Pi', 'Casper'],
        2018: ['Ahzumjot', 'Rockstah', 'Kanye West', 'Cro', 'Casper'],
        2019: ['Kitschkrieg', 'Trettmann', 'Cro', 'Tua', 'Kanye West'],
        2020: ['Die Orsons', 'Fynn Kliemann', 'Cro', 'Fatoni', 'Kanye West'],
        2021: ['Cro', 'Ahzumjot', 'Maeckes', 'MAJAN', 'Kanye West'],
        2022: ['Ahzumjot', 'Cro', 'Maeckes', 'Schmyt', 'MAJAN'],
        2023: ['Cro', 'Kanye West', 'Levin Liam', 'MAJAN', 'Paula Hartmann'],
        2024: ['Tua', 'Paula Hartmann', 'Levin Liam', 'Maeckes', 'Berq'],
        2025: ['Cro', 'Levin Liam', 'Tua', 'Nina Chuba', 'Zartmann']
    }

    let currentYear = $state(Number(Object.keys(years).pop()) || 2017);
    let viewMode = $state<'years' | 'stats'>('years');
    
    let yearsList = $derived(Object.keys(years).map(Number));
    let currentIndex = $derived(yearsList.indexOf(currentYear));
    let isFirstYear = $derived(currentIndex === 0);
    let isLastYear = $derived(currentIndex === yearsList.length - 1);

    function nextYear() {
        if (isLastYear) {
            viewMode = 'stats';
        } else {
            currentYear = yearsList[currentIndex + 1];
        }
    }

    function previousYear() {
        if (viewMode === 'stats') {
            viewMode = 'years';
        } else {
            currentYear = yearsList[currentIndex - 1];
        }
    }

    let artistStats = $derived.by(() => {
        const counts: Record<string, number> = {};
        Object.values(years).forEach(artistList => {
            artistList.forEach(artist => {
                counts[artist] = (counts[artist] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    });

    let maxAppearances = $derived(Math.max(...artistStats.map(s => s.count), 1));
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-8">
        <button 
            class="px-4 py-2 bg-primary hover:scale-105 active:scale-110 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
            onclick={previousYear}
            disabled={viewMode === 'years' && isFirstYear}
        >
            {i18n.t('playlists.previous')}
        </button>
        <h2 class="text-2xl font-bold">
            {#if viewMode === 'years'}
                {currentYear}
            {:else}
                {i18n.t('playlists.stats')}
            {/if}
        </h2>
        <button 
            class="px-4 py-2 bg-primary hover:scale-105 active:scale-110 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
            onclick={nextYear}
            disabled={viewMode === 'stats'}
        >
            {i18n.t('playlists.next')}
        </button>
    </div>

    <div class="relative">
        {#if viewMode === 'years'}
            {#each years[currentYear] as artist, i (artist)}
                <div
                    class="w-full py-4"
                    in:fade={{ duration: 300 }}
                    out:fade={{ duration: 300 }}
                    animate:flip={{ duration: 300 }}
                >
                    <div class="flex items-center gap-4">
                        <span class="text-xl font-bold w-8">{i + 1}</span>
                        <span class="text-lg">{artist}</span>
                    </div>
                </div>
            {/each}
        {:else}
            <div in:fade={{ duration: 300 }} class="space-y-6">
                <h3 class="text-xl font-semibold mb-4">{i18n.t('playlists.artist_frequency')}</h3>
                <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {#each artistStats as { name, count }}
                        <div class="space-y-1">
                            <div class="flex justify-between text-sm">
                                <span>{name}</span>
                                <span class="text-muted-foreground">{count} {i18n.t('playlists.appearances')}</span>
                            </div>
                            <div class="h-4 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-primary transition-all duration-500 ease-out"
                                    style="width: {(count / maxAppearances) * 100}%"
                                ></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

