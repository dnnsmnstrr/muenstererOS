<script module>
  // import  DragDropTouch  from 'svelte-drag-drop-touch' // for mobile platforms
  import { asDraggable } from 'svelte-drag-and-drop-actions'
</script>

<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  let DraggableX = $state(20), DraggableY = $state(20), DraggableWidth = 80, DraggableHeight = 30
  let ArenaWidth = 400, ArenaHeight = 400

  function onDragMove (x,y, dx,dy) { DraggableX = x; DraggableY = y }
  function onDragEnd  (x,y, dx,dy) { DraggableX = x; DraggableY = y }
</script>

<div class="relative block"
style="width:{ArenaWidth}px; height:{ArenaHeight}px;">
  <div
    class="absolute block cursor-move left-[{DraggableX}px] top-[{DraggableY}px] w-[{DraggableWidth}px] h-[{DraggableHeight}px]"
    style="left:{DraggableX}px; top:{DraggableY}px; width:{DraggableWidth}px; height:{DraggableHeight}px;"
    use:asDraggable={{
      minX:0,minY:0, maxX:ArenaWidth-DraggableWidth,maxY:ArenaHeight-DraggableHeight,
      onDragStart:{x:DraggableX,y:DraggableY}, onDragMove, onDragEnd
    }}
  >
    {@render children?.()}
  </div>
</div>
