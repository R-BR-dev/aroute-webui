<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSystemInfo } from '@/api/system'
import { durationParts } from '@/utils/duration'

const { t } = useI18n()

// Re-read every 10 seconds: keeps the uptimes moving and notices a Core that went away.
const {
  data: info,
  isPending,
  isError,
  isFetching,
  refetch,
} = useSystemInfo({
  refetchInterval: 10_000,
})

function formatDuration(seconds: number): string {
  return durationParts(seconds)
    .map(({ unit, value }) => t(`duration.${unit}`, { n: value }))
    .join(' ')
}

const facts = computed(() => {
  if (!info.value) return []
  return [
    { label: t('dashboard.fields.version'), value: info.value.version },
    { label: t('dashboard.fields.apiVersion'), value: info.value.api_version },
    { label: t('dashboard.fields.hostname'), value: info.value.hostname },
    { label: t('dashboard.fields.os'), value: info.value.os },
    { label: t('dashboard.fields.kernel'), value: info.value.kernel },
    { label: t('dashboard.fields.uptime'), value: formatDuration(info.value.uptime_seconds) },
    {
      label: t('dashboard.fields.daemonUptime'),
      value: formatDuration(info.value.daemon_uptime_seconds),
    },
  ]
})
</script>

<template>
  <section>
    <h1 class="title">{{ t('dashboard.title') }}</h1>

    <Card>
      <template #title>{{ t('dashboard.system') }}</template>
      <template #content>
        <!-- Also shown above the last known values when a refresh fails. -->
        <Message v-if="isError" severity="error" :closable="false" class="error">
          <div class="error-body">
            <span>{{ t('dashboard.loadFailed') }}</span>
            <Button
              :label="t('dashboard.retry')"
              icon="pi pi-refresh"
              severity="danger"
              size="small"
              outlined
              :loading="isFetching"
              @click="refetch()"
            />
          </div>
        </Message>

        <dl v-if="info" class="facts">
          <template v-for="fact in facts" :key="fact.label">
            <dt>{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </template>
        </dl>

        <div v-else-if="isPending" class="facts" aria-busy="true">
          <template v-for="n in 7" :key="n">
            <Skeleton width="8rem" height="1.5rem" />
            <Skeleton width="14rem" height="1.5rem" />
          </template>
        </div>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 2rem;
  margin: 0;
}

.facts dt {
  color: var(--p-text-muted-color);
}

.facts dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.error {
  margin-bottom: 1rem;
}

.error-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

/* Narrow screens: each value goes under its label. */
@media (max-width: 30rem) {
  .facts {
    grid-template-columns: 1fr;
    gap: 0.125rem;
  }

  .facts dd {
    margin-bottom: 0.5rem;
  }
}
</style>
