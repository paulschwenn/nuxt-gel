import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    [MyModule, {
      devtools: false,
      injectDbCredentials: false,
    }],
  ],
})
