<template>
  <div class="login">
    <EdgeDbAuthEmailLogin
      v-slot="{ email, updateEmail, password, updatePassword, submit, loading }"
      redirect-to="/"
    >
      <UCard>
        <template #header>
          <h2>Login</h2>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup label="Email">
            <input
              type="email"
              :value="email"
              placeholder="your@email.com"
              @input="(e) => updateEmail(e.target.value)"
              @keyup.enter="() => submit()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </UFormGroup>
          <UFormGroup label="Password">
            <input
              type="password"
              :value="password"
              placeholder="password"
              @input="(e) => updatePassword(e.target.value)"
              @keyup.enter="() => submit()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex items-center gap-2">
            <UButton
              type="button"
              color="gray"
              :loading="loading"
              @click="() => submit()"
            >
              Login
            </UButton>

            <OAuthProviders />
          </div>
        </template>
      </UCard>
    </EdgeDbAuthEmailLogin>
  </div>
</template>
