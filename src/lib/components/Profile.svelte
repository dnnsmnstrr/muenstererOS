<script>
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
	import { NAME_ABBREVIATION, OWNER_NAME, descriptions, links } from "$lib/config";
  import Typewriter from "svelte-typewriter";
	import { Button } from "./ui/button";

</script>

  <Card.Header class="flex flex-row items-center justify-start gap-6 flex-wrap mt-4 md:mt-0">
    <Avatar.Root class="h-24 w-24">
      <Avatar.Image src="/.well-known/avatar?github" alt="@dnnsmnstrr" />
      <Avatar.Fallback>{NAME_ABBREVIATION}</Avatar.Fallback>
    </Avatar.Root>
    <div class="flex flex-col gap-2">
      <Card.Title>{OWNER_NAME}</Card.Title>
      <Card.Description class="h-6">
        <Typewriter mode="loopRandom" interval={100} delay={0} cursor={false}>
          {#each descriptions as description}
            {#if typeof description === 'object'}
              <a href={description.href} target="_blank">{description.name}</a>
            {:else}
               <span>{description}</span>
            {/if}
          {/each}
        </Typewriter>
      </Card.Description>
      <Card.Footer class="hidden md:block p-0 pt-2">
        <Button href={links.cv} size="sm" class="">Find out more...</Button>
      </Card.Footer>
    </div>
  </Card.Header>