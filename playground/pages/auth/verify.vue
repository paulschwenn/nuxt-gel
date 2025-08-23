<template>
  <div class="login">
    <GelAuthEmailVerify
      v-slot="{ loading }"
      redirect-to="/"
    >
      <UCard>
        <template #header>
          <h2>Email verification</h2>
        </template>
        <UButton :loading="loading" color="gray">
          Loading...
        </UButton>
      </UCard>
    </GelAuthEmailVerify>
  </div>
</template>
