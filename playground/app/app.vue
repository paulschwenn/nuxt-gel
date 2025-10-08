<script setup lang="ts">
const { isLoggedIn } = useGelIdentity()
const isAuthHelpOpen = ref(false)

const navigationItems = computed(() => {
  const items = [
    {
      label: 'Home',
      icon: 'i-heroicons-home',
      to: '/',
    },
  ]

  if (isLoggedIn.value) {
    items.push(
      {
        label: 'New blogpost',
        icon: 'i-heroicons-newspaper-20-solid',
        to: '/new',
      },
      {
        label: 'Logout',
        icon: 'i-heroicons-newspaper-20-solid',
        to: '/auth/logout',
      },
    )
  }
  else {
    items.push(
      {
        label: 'Register',
        icon: 'i-heroicons-key-20-solid',
        to: '/auth/signup',
      },
      {
        label: 'Login',
        icon: 'i-heroicons-lock-open-20-solid',
        to: '/auth/login',
      },
      {
        label: 'Forgot my password',
        icon: 'i-heroicons-sparkles-20-solid',
        to: '/auth/forgot-password',
      },
    )
  }

  return items
})
</script>

<template>
  <UApp>
    <UContainer class="p-8 flex flex-col gap-4">
      <div class="flex justify-between items-start">
        <UNavigationMenu
          orientation="vertical"
          :items="navigationItems"
        />
        <UButton
          icon="i-heroicons-question-mark-circle-20-solid"
          label="Auth Help"
          @click="isAuthHelpOpen = true"
        />
      </div>

      <div>
        <NuxtPage />
      </div>

      <AuthHelp v-model="isAuthHelpOpen" />
    </UContainer>
  </UApp>
</template>