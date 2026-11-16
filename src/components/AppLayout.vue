<script setup lang="ts">
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import LanguageSwitch from '@/components/LanguageSwitch.vue'
import { useSessionStore } from '@/stores/session'

const { t } = useI18n()
const router = useRouter()
const session = useSessionStore()

async function signOut() {
  await session.signOut()
  await router.push({ name: 'login' })
}
</script>

<!-- The frame around every page behind the login: top bar, then the page itself. -->
<template>
  <div class="layout">
    <header class="topbar">
      <RouterLink class="brand" :to="{ name: 'dashboard' }">ARoute</RouterLink>
      <div class="actions">
        <LanguageSwitch />
        <Button
          :label="t('nav.signOut')"
          icon="pi pi-sign-out"
          severity="secondary"
          text
          @click="signOut"
        />
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--p-content-background);
  border-bottom: 1px solid var(--p-content-border-color);
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--p-text-color);
  text-decoration: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
