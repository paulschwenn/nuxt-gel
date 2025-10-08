<script setup lang="ts">
const { isLoggedIn } = useGelIdentity()

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
        <AuthHelp/>
      </div>

      <div>
        <NuxtPage />
      </div>
    </UContainer>
  </UApp>
</template>