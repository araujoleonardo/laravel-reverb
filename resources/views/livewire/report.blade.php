<div class="mt-8 flex flex-row justify-between items-center">
    <x-button wire:click="processReport">
        Processar Relatório
    </x-button>

    <span class="relative flex h-3 w-3">
      <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          :class="{
            'bg-yellow-400':$wire.status === 'processing',
            'bg-green-400':$wire.status === 'done'
          }"
      ></span>
      <span
          class="relative inline-flex h-3 w-3 rounded-full"
          :class="{
            'bg-yellow-500':$wire.status === 'processing',
            'bg-green-500':$wire.status === 'done'
          }"
      ></span>
    </span>
</div>
