<template>
  <div class="callback">
    <GelOAuthCallback
      v-slot="{ loading }"
      redirect-to="/"
    >
      <UCard>
        <template #header>
          <h2>OAuth callback</h2>
        </template>
        <UButton :loading="loading">
          Loading...
        </UButton>
      </UCard>
    </GelOAuthCallback>
  </div>
</template>
