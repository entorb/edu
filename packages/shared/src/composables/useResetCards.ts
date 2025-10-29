import { useQuasar } from 'quasar'
import { TEXT_DE } from '../text-de'

/**
 * Composable for showing reset confirmation dialog and handling reset logic
 * Provides a unified reset dialog experience across all apps
 */
export function useResetCards() {
  const $q = useQuasar()

  function showResetDialog(onConfirm: () => void): void {
    $q.dialog({
      title: TEXT_DE.voc.cards.confirmResetTitle,
      message: TEXT_DE.voc.cards.confirmResetMessage,
      cancel: true,
      ok: {
        label: TEXT_DE.common.reset,
        color: 'negative'
      },
      persistent: true
    }).onOk(() => {
      onConfirm()
      $q.notify({
        type: 'positive',
        message: TEXT_DE.voc.cards.resetSuccess,
        position: 'top'
      })
    })
  }

  return {
    showResetDialog
  }
}
