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
            <input
              type="email"
              :value="email"
              placeholder="your@email.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="(e) => updateEmail(e.target.value)"
              @keyup.enter="() => submit()"
            >
          </UFormField>
          <UFormField label="Password">
            <input
              type="password"
              :value="password"
              placeholder="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-500"
              @input="(e) => updatePassword(e.target.value)"
              @keyup.enter="() => submit()"
            >
          </UFormField>
        </div>

        <template #footer>
          <div class="flex items-center gap-2">
            <UButton
              color="gray"
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
