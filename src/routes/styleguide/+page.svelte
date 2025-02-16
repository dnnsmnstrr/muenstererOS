<script lang="ts">
  import Heading from "$lib/components/typography/Heading.svelte";
  import Link from "$lib/components/typography/Link.svelte";
  import List from "$lib/components/typography/List.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import WindowButtons from "$lib/components/WindowButtons.svelte";
	import Kbd from "$lib/components/typography/Kbd.svelte";
	import File from "$lib/components/File.svelte";
</script>

<svelte:head>
  <title>Styleguide</title>
  <meta name="description" content="Styleguide for custom components" />
</svelte:head>

<div class="container">
  <Heading>Styleguide</Heading>

  <section class="mb-8">
    <Heading depth={2}>Typography</Heading>
    <Heading depth={3}>Heading Component</Heading>
    <Heading>Example Heading</Heading>
    <Heading depth={3}>Link Component</Heading>
    <Link href="https://example.com" target="_blank">Example Link</Link>
    <Heading depth={3}>List Component</Heading>
    <List>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </List>
    <Heading depth={3}>Other Text</Heading>
    <Kbd>Keyboard</Kbd>
  </section>

  <section class="mb-8">
    <Heading depth={2}>Profile</Heading>
    <Profile />
  </section>

  <section class="mb-8">
    <Heading depth={2}>WindowButtons</Heading>
    <WindowButtons />
    <Heading depth={2}>File</Heading>
    <File name="example" href="https://example.com" />
  </section>
</div>