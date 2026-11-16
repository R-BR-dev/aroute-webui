<script setup lang="ts">
import SelectButton from 'primevue/selectbutton'
import { useI18n } from 'vue-i18n'

import { LOCALES, setLocale, type Locale } from '@/locales'

const { t, locale } = useI18n()

const options = LOCALES.map((value) => ({ value, label: value.toUpperCase() }))
</script>

<template>
  <SelectButton
    :model-value="locale"
    :options="options"
    option-label="label"
    option-value="value"
    :allow-empty="false"
    size="small"
    :aria-label="t('language.label')"
    @update:model-value="(value: Locale) => setLocale(value)"
  />
</template>
