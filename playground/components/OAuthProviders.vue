<template>
  <GelAuthProviders v-slot="{ oAuthProviders: providers }">
<GelOAuthButton
      v-for="provider of providers"
      :key="provider.name"
      v-slot="{ redirect }"
      :provider="provider.name"
    >
      <UButton @click="() => redirect()">
        {{ provider.display_name }}
      </UButton>
    </GelOAuthButton>
</GelAuthProviders>
</template>
