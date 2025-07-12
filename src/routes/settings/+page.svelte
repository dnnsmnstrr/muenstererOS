<script lang="ts">
	import { Link } from "$lib/components/typography";
	import Heading from "$lib/components/typography/Heading.svelte";
  import * as Card from "$lib/components/ui/card";
	import SettingsForm from "./SettingsForm.svelte";
</script>

<div class="container">
  <div class="flex items-center justify-between max-w-screen-sm">
    <Heading>Settings</Heading>
    <Link href="/admin" class="text-muted-foreground no-underline" showIcon>Admin</Link>
  </div>

  <Card.Root class="mb-40 max-w-screen-sm">
    <Card.Header>
      <Card.Title>
        Look & Feel
      </Card.Title>
    </Card.Header>
    <Card.Content>
      <SettingsForm />
    </Card.Content>
  </Card.Root>
</div>