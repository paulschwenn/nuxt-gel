export default defineNitroPlugin((app) => {
  app.hooks.hook(
    'gel:auth:callback' as any,
    () => {
      console.log('auth callback!')
    },
  )
})
