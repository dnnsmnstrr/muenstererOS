<script>
	import { OWNER_NAME, links } from "$lib/config";

  const currentYear = new Date().getFullYear();
</script>

<footer class="pb-1 pr-1 flex justify-center gap-2 [&>*]:opacity-30 h-card">
  <p class="flex gap-2">© {currentYear} <a class="hidden sm:block p-name" href="https://muensterer.tech/" rel="me">{OWNER_NAME}</a></p>
  <span>•</span>
  <a href="/legal" class="hover:opacity-70 transition-opacity flex gap-1">Legal Notice & Privacy Policy</a>
</footer>