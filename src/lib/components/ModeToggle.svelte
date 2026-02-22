<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Sun, Moon } from "lucide-svelte";
  import { setMode, resetMode } from "mode-watcher";
  import { i18n } from "$lib/i18n/i18n.svelte";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
      <Button variant="outline" size="icon">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">{i18n.t('command.toggle_dark_mode')}</span>
      </Button>
    </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onclick={() => setMode("light")}
      >{i18n.t('settings.light')}</DropdownMenu.Item
    >
    <DropdownMenu.Item onclick={() => setMode("dark")}>{i18n.t('settings.dark')}</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => resetMode()}>{i18n.t('settings.system')}</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>