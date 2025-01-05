<script lang='ts'>
    import { fade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    
    let years: Record<number, string[]> = {
        2017: ['Kanye West', 'Ahzumjot', 'Cro', 'Prinz Pi', 'Casper'],
        2018: ['Ahzumjot', 'Rockstah', 'Kanye West', 'Cro', 'Casper'],
        2019: ['Kitschkrieg', 'Trettmann', 'Cro', 'Tua', 'Kanye West'],
        2020: ['Die Orsons', 'Fynn Kliemann', 'Cro', 'Fatoni', 'Kanye West'],
        2021: ['Cro', 'Ahzumjot', 'Maeckes', 'MAJAN', 'Kanye West'],
        2022: ['Ahzumjot', 'Cro', 'Maeckes', 'Schmyt', 'MAJAN'],
        2023: ['Cro', 'Kanye West', 'Levin Liam', 'MAJAN', 'Paula Hartmann'],
        2024: ['Tua', 'Paula Hartmann', 'Levin Liam', 'Maeckes', 'Berq'],
    }

    let currentYear = Number(Object.keys(years).pop()) || 2017;
    
    $: yearsList = Object.keys(years).map(Number);
    $: currentIndex = yearsList.indexOf(currentYear);
    $: isFirstYear = currentIndex === 0;
    $: isLastYear = currentIndex === yearsList.length - 1;

    function nextYear() {
        currentYear = yearsList[(currentIndex + 1) % yearsList.length];
    }

    function previousYear() {
        currentYear = yearsList[(currentIndex - 1 + yearsList.length) % yearsList.length];
    }
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-8">
        <button 
            class="px-4 py-2 bg-primary hover:scale-105 active:scale-110 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
            on:click={previousYear}
            disabled={isFirstYear}
        >
            Previous
        </button>
        <h2 class="text-2xl font-bold">{currentYear}</h2>
        <button 
            class="px-4 py-2 bg-primary hover:scale-105 active:scale-110 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200"
            on:click={nextYear}
            disabled={isLastYear}
        >
            Next
        </button>
    </div>

    <div class="relative">
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
    </div>
</div>

