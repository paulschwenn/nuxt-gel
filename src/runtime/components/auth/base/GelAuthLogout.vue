<script setup lang="ts">
import { onMounted } from 'vue'
import { useGelIdentity } from '../../../composables/useGelIdentity'

const props = withDefaults(
  defineProps<{
    redirectTo?: string
    logoutOnSetup?: boolean
  }>(),
  {
    redirectTo: '/',
    logoutOnSetup: true,
  },
)

async function logout(redirectTo: string = props.redirectTo) {
  const { logout: identityLogout } = useGelIdentity()
  await identityLogout(redirectTo)
}

// Trigger logout on client after mount to avoid
// disrupting render/slot evaluation during setup.
if (props.logoutOnSetup && import.meta.client)
  onMounted(() => { void logout() })
</script>

<template>
  <slot v-bind="{ logout }" />
</template>
