<script setup lang="ts">
</script>

<template>
  <UModal title="Playground: Gel UI Setup (Auth)">
    <UButton
      icon="i-heroicons-question-mark-circle-20-solid"
      label="Gel Auth Setup Help"
      color="primary"
      variant="subtle"
    />

    <template #body>
      <div>
        <p class="mb-4">
          Use Gel UI to configure auth for the playground before testing signup/login.
        </p>

        <h4 class="font-semibold mb-2 text-lg">
          1) Open Gel UI
        </h4>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>From a terminal in the <code>playground</code> directory: <code>gel ui --print-url</code> and open the URL.</li>
          <li>Or in Nuxt DevTools: open the "Gel" tab (the module auto-adds it during dev)</li>
        </ul>

        <h4 class="font-semibold mb-2 text-lg">
          2) Auth Admin configuration
        </h4>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li>Set an <code>auth_signing_key</code> (Generate/Rotate in the UI is fine)</li>
          <li>
            Add the following to <code>allowed_redirect_urls</code>:
            <pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-2 text-sm"><code>http://localhost:3000
http://localhost:3000/auth/verify
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password</code></pre>
          </li>
          <li>
            Enable the Email + Password provider:
            <ul class="list-disc list-inside ml-4 mt-1">
              <li>Provider name: <code>builtin::local_emailpassword</code></li>
              <li>For local development, you can disable <code>require_verification</code> OR configure SMTP (e.g. Mailpit)</li>
            </ul>
          </li>
        </ul>

        <h4 class="font-semibold mb-2 text-lg">
          3) Verify providers from the app (optional)
        </h4>
        <p class="mb-4">
          Visit <code>GET /api/auth/providers</code> in the playground; you should see <code>builtin::local_emailpassword</code>
        </p>

        <h4 class="font-semibold mb-2 text-lg">
          4) Test flows
        </h4>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Signup: <code>http://localhost:3000/auth/signup</code></li>
          <li>Login: <code>http://localhost:3000/auth/login</code></li>
          <li>Forgot/Reset: <code>http://localhost:3000/auth/forgot-password</code> → email link → <code>http://localhost:3000/auth/reset-password</code></li>
        </ul>

        <h4 class="font-semibold mb-2 text-lg">
          Troubleshooting
        </h4>
        <ul class="list-disc list-inside space-y-1">
          <li>400 "unknown provider": ensure <code>builtin::local_emailpassword</code> is enabled</li>
          <li>400 "redirect not allowed": confirm the exact URL is in <code>allowed_redirect_urls</code></li>
          <li>"Missing verifier" on verify/reset: use the same browser/session that initiated the flow (PKCE cookie)</li>
          <li>If you changed ports/host, update <code>allowed_redirect_urls</code> accordingly</li>
        </ul>
      </div>
    </template>
  </UModal>
</template>
