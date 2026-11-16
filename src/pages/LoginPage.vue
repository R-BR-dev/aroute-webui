<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useSystemInfo } from '@/api/system'
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import { useSessionStore } from '@/stores/session'

const { t } = useI18n()
const router = useRouter()
const session = useSessionStore()

// Shown under the form: proof that the page is talking to a Core, and to which one.
const { data: info, isError: coreUnreachable } = useSystemInfo()

const password = ref('')
const submitting = ref(false)

async function submit() {
  submitting.value = true
  try {
    await session.signIn(password.value)
    await router.replace({ name: 'dashboard' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="language">
      <LanguageSwitch />
    </div>

    <Card class="card">
      <template #content>
        <h1 class="brand">ARoute</h1>

        <form class="form" @submit.prevent="submit">
          <Message severity="warn" :closable="false">{{ t('login.noAuthYet') }}</Message>

          <label for="password">{{ t('login.password') }}</label>
          <!-- prompt-label is read out by screen readers; without it PrimeVue uses its own English text. -->
          <Password
            v-model="password"
            input-id="password"
            :input-props="{ autocomplete: 'current-password', autofocus: true }"
            :prompt-label="t('login.password')"
            :feedback="false"
            toggle-mask
            fluid
          />

          <Button type="submit" :label="t('login.submit')" :loading="submitting" />
        </form>
      </template>
    </Card>

    <footer class="core">
      <span v-if="info">{{ t('core.version', { version: info.version }) }}</span>
      <span v-else-if="coreUnreachable" class="unreachable">{{ t('core.unreachable') }}</span>
    </footer>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 100dvh;
  padding: 1rem;
}

.language {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.card {
  width: 100%;
  max-width: 24rem;
}

.brand {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form label {
  font-weight: 600;
}

.core {
  /* Keeps its height while the version is loading, so the card does not jump. */
  min-height: 1.5rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.unreachable {
  color: var(--p-message-error-color);
}
</style>
