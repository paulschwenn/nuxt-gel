<template>
  <div class="login">
    <GelAuthEmailSignup
      v-slot="{ email, updateEmail, password, updatePassword, submit, loading }"
      redirect-to="/"
    >
      <UCard>
        <template #header>
          <h2>Signup</h2>
        </template>
        <div class="flex flex-col gap-4">
          <UFormField label="Email">
            <UInput
              type="email"
              :model-value="email"
              placeholder="your@email.com"
              autocomplete="email"
              @update:model-value="updateEmail"
              @keyup.enter="() => submit()"
            />
          </UFormField>
          <UFormField label="Password">
            <UInput
              type="password"
              :model-value="password"
              placeholder="password"
              autocomplete="new-password"
              @update:model-value="updatePassword"
              @keyup.enter="() => submit()"
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              type="button"
              :loading="loading"
              @click="() => submit()"
            >
              Signup
            </UButton>
            <OAuthProviders />
          </div>
        </template>
      </UCard>
    </GelAuthEmailSignup>
  </div>
</template>
