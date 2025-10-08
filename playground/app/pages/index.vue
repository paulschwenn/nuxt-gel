<script setup lang="ts">
// Minimal BlogPost shape for the playground
interface BlogPost {
  id: string
  title: string | null
  description: string | null
  content?: string | null
  author: { id: string, name: string }
}

const { isLoggedIn, identity } = useGelIdentity()

const { data, refresh } = await useAsyncData<BlogPost[]>(
  'blogpost-index',
  async () => await ($fetch as any)('/api/blogpost') as BlogPost[],
)

async function deleteBlogPost(id: string) {
  await $fetch('/api/blogpost', {
    method: 'DELETE',
    query: { id },
  })

  await refresh()
}
</script>

<template>
  <UContainer class="p-8 flex flex-col gap-4">
    <UCard
      v-for="blogpost of data"
      :key="blogpost.id"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h2>{{ blogpost.title }}</h2>
          <span class="text-sm opacity-50"> By {{ blogpost.author.name }} </span>
        </div>
      </template>

      <p class="text-sm opacity-50">
        {{ blogpost.description }}
      </p>

      <template #footer>
        <div class="flex items-center justify-between">
          <div>
            <UButton color="info" variant="outline">
              <NuxtLink :to="`/blogposts/${blogpost.id}`">
                Read more
              </NuxtLink>
            </UButton>
          </div>

          <div v-if="isLoggedIn && identity?.id === blogpost.author.id">
            <UButton
              icon="i-heroicons-trash"
              color="error"
              variant="outline"
              @click="deleteBlogPost(blogpost.id)"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
