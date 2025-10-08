<template>
  <div class="login">
    <GelAuthResetPassword
      v-slot="{ password, updatePassword, submit, loading }"
      redirect-to="/auth/login"
    >
      <UCard>
        <template #header>
          <h2>Reset my password</h2>
        </template>
        <div class="flex flex-col gap-4">
          <UFormField label="Password">
            <UInput
              type="password"
              :value="password"
              placeholder="your@email.com"
              @change="(e: any) => updatePassword(e.target.value)"
            />
          </UFormField>
        </div>

        <template #footer>
          <UButton
            type="button"
            color="neutral"
            :loading="loading"
            @click="() => submit()"
          >
            Send reset email
          </UButton>
        </template>
      </UCard>
    </GelAuthResetPassword>
  </div>
</template>
