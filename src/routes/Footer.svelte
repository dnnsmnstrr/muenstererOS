<!-- @migration-task Error while migrating Svelte code: `<a>` cannot be a child of `<a>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
<script>
	import { OWNER_NAME, links } from "$lib/config";

  const currentYear = new Date().getFullYear();
</script>

<footer class="pb-1 pr-1 flex justify-center gap-2 [&>*]:opacity-30">
  <p class="flex gap-2">© {currentYear} <span class="hidden sm:block">{OWNER_NAME}</span></p>
  <span>•</span>
  <a href="/legal" class="hover:opacity-70 transition-opacity flex gap-1">Legal Notice </a><a class="hidden sm:block" href="/legal#Data-Protection-Policy-GDPR">& Privacy Policy</a>
</footer>