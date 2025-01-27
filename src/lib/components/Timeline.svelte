<script lang="ts">
  interface TimelineItem {
    title: string;
    date: string;
    content: string;
    uri: string;
    gif: string;
  }

  interface Props {
    items: TimelineItem[];
  }

  let { items }: Props = $props();
</script>

<div class="relative">
  <div class="border-l border-gray-300">
    {#each items as item}
      <div class="mb-10 ml-4">
        <div class="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
        <div class="flex flex-col">
          <div class="font-bold">{item.title}</div>
          <div class="text-gray-600">{item.date}</div>
          <div class="mt-2">{item.content}</div>
        </div>
      </div>
    {/each}
  </div>
</div>