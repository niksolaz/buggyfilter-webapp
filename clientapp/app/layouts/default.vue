<script setup lang="ts">
const currentView = ref("home");

provide("currentView", currentView);

const showView = (view: string) => {
  currentView.value = view;
};
</script>

<template>
  <div class="bg-brand-50">
    <nav
      class="flex justify-center py-10 [&>div]:mx-2 [&>div]:text-brand-500 [&>div]:font-semibold [&>div]:hover:underline [&>div]:hover:text-brand-700 [&>div]:focus:text-brand-600"
    >
      <div @click="showView('home')">
        <div class="flex items-center justify-center gap-2 w-full">
          <div
            class="flex items-center justify-center size-6 border border-brand-500 rounded-full bg-brand-500"
          >
            <span class="text-xl text-white font-bold">B</span>
          </div>
          <div class="font-bold text-xl text-brand-500 tracking-tight">
            BuggyFilter
          </div>
        </div>
      </div>
      <div
        class="font-bold text-xl text-brand-500 tracking-tight"
        @click="showView('pricing')"
      >
        Prezzo
      </div>
    </nav>
    <main class="flex min-h-screen items-start justify-center p-4">
      <div class="w-full max-w-fit">
        <div>
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
