<script lang="ts">
	import Heading from "$lib/components/typography/Heading.svelte";
  import * as Card from "$lib/components/ui/card";
	import SettingsForm from "./SettingsForm.svelte";
</script>

<div class="container">
  <Heading>Settings</Heading>

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