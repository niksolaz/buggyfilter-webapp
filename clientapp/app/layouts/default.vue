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
      <div @click="showView('home')">Home</div>
      <div @click="showView('pricing')">Pricing</div>
    </nav>
    <main class="flex min-h-screen items-start justify-center p-4">
      <div class="w-full max-w-md">
        <div class="mb-6 text-center">
          <div class="flex items-center justify-center gap-2 w-full py-6">
            <div
              class="flex items-center justify-center size-12 border border-brand-500 rounded-full bg-brand-500"
            >
              <span class="text-4xl text-white font-bold">B</span>
            </div>
            <span class="font-bold text-4xl text-brand-500 tracking-tight"
              >BuggyFilter</span
            >
          </div>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">
            Segnalazione e triage intelligente dei bug
          </p>
        </div>
        <div>
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
