<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", size = "default", ...restProps }: AlertDialogPrimitive.ActionProps & { variant?: any; size?: any } = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
/>
