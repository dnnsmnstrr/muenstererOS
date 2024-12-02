<script>
	import { OWNER_NAME, links } from "$lib/config";

  const currentYear = new Date().getFullYear();
</script>

<footer class="pb-1 pr-1 flex justify-center gap-2 [&>*]:opacity-30">
  <p class="flex gap-2">© {currentYear} <span class="hidden sm:block">{OWNER_NAME}</span></p>
  <span>•</span>
  <a href="/legal" class="hover:opacity-70 transition-opacity flex gap-1">Legal Notice <a class="hidden sm:block" href="/legal#Data-Protection-Policy-GDPR">& Privacy Policy</a></a>
</footer>