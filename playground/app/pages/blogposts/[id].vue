<script setup lang="ts">
// Define a minimal BlogPost shape for the playground to avoid relying on generated types
interface BlogPost {
  id: string
  title: string | null
  description: string | null
  content: string | null
  author?: { id: string, name: string }
}

const { params } = useRoute()

const { data: blogpost } = await useAsyncData<BlogPost>(
  `blogpost-${params.id}`,
  async () => await ($fetch as any)(`/api/blogpost?id=${params.id}`) as BlogPost,
)
</script>

<template>
  <UContainer class="p-8 flex flex-col gap-4">
    <UCard v-if="blogpost">
      <template #header>
        <h1>{{ blogpost?.title }}</h1>
        <p class="text-sm opacity-50">
          {{ blogpost?.description }}
        </p>
      </template>

      {{ blogpost.content }}

      <template #footer>
        <NuxtLink to="/">
          <UButton color="neutral">
            Home
          </UButton>
        </NuxtLink>
      </template>
    </UCard>
  </UContainer>
</template>

<style scoped>
h1 {
  margin-bottom: 1.33rem;
}
</style>
