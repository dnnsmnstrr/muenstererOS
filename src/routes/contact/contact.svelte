<script>
	import Heading from "$lib/components/typography/Heading.svelte";
	import { links } from "$lib/config";

</script>
<div>
    <Heading>Contact</Heading>

    <p>
        You can contact me at <a href={links.mailto}>{links.email}</a>
    </p>
</div>