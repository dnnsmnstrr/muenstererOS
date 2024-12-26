<script lang='ts'>
    import { fade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    
    let years: Record<number, string[]> = {
        2019: ['Kitschkrieg', 'Trettmann', 'Cro', 'Tua', 'Kanye West'],
        2020: ['Die Orsons', 'Fynn Kliemann', 'Cro', 'Fatoni', 'Kanye West'],
        2021: ['Cro', 'Ahzumjot', 'Maeckes', 'MAJAN', 'Kanye West'],
        2022: ['Ahzumjot', 'Cro', 'Maeckes', 'Schmyt', 'MAJAN'],
        2023: ['Cro', 'Kanye West', 'Levin Liam', 'MAJAN', 'Paula Hartmann'],
        2024: ['Tua', 'Paula Hartmann', 'Levin Liam', 'Maeckes', 'Berq'],
    }

    let currentYear = 2024;

    function nextYear() {
        const yearsList = Object.keys(years).map(Number);
        const currentIndex = yearsList.indexOf(currentYear);
        currentYear = yearsList[(currentIndex + 1) % yearsList.length];
    }

    function previousYear() {
        const yearsList = Object.keys(years).map(Number);
        const currentIndex = yearsList.indexOf(currentYear);
        currentYear = yearsList[(currentIndex - 1 + yearsList.length) % yearsList.length];
    }
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-8">
        <button 
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            on:click={previousYear}
        >
            Previous
        </button>
        <h2 class="text-2xl font-bold">{currentYear}</h2>
        <button 
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            on:click={nextYear}
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

<style>
    .container {
        max-width: 600px;
    }
</style>

