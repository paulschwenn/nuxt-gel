<script setup lang="ts">
const loading = ref(false)
const error = ref('')
const success = ref()
const title = ref()
const description = ref()
const content = ref()
const router = useRouter()
const { isLoggedIn } = useGelIdentity()

let timeout: undefined | NodeJS.Timeout

if (!isLoggedIn.value)
  router.push('/')

async function submit() {
  loading.value = true
  error.value = ''
  clearTimeout(timeout)

  try {
    interface NewBlogPostResult { id: string }
    const blogPost = await $fetch<NewBlogPostResult>('/api/blogpost', {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value,
        content: content.value,
      },
    })

    router.push(`/blogposts/${blogPost.id}`)

    success.value = true
  }
  catch (e: any) {
    console.log(e)
    error.value = e
  }

  timeout = setTimeout(() => (success.value = undefined), 1000)
  loading.value = false
}
</script>

<template>
  <UCard>
    <template #header>
      <h2>New blogpost</h2>
    </template>
    <div class="flex flex-col gap-2">
      <UFormField label="Title">
        <UInput
          v-model="title"
          type="text"
          placeholder="My new blogpost"
        />
      </UFormField>
      <UFormField label="Description">
        <UInput
          v-model="description"
          type="text"
          placeholder="My blogpost description."
        />
      </UFormField>
      <UFormField label="Content">
        <UTextarea
          v-model="content"
          placeholder="I love Nuxt."
        />
      </UFormField>
    </div>
    <template #footer>
      <UButton color="neutral" @click="submit">
        {{ loading ? 'Loading...' : 'Submit' }}
      </UButton>
    </template>
    <div v-if="error">
      {{ error }}
    </div>
  </UCard>
</template>
