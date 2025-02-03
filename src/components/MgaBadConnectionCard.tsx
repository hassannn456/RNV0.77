import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  csfLayoutSubtitleTextDefaultProps,
  csfLayoutTitleTextDefaultProps,
} from './CsfListItem'
import CsfText from './CsfText'
import CsfCard, { CsfCardProps } from './CsfCard'
import CsfSimpleAlert from './CsfSimpleAlert'
import i18n from '../i18n'
import CsfView from './CsfView'
import CsfButton from './CsfButton'

export interface MgaBadConnectionCardProps extends CsfCardProps {
  onCancel?: () => void
  onRetry?: () => void
}

export const alertBadConnection: () => void = () => {
  const { t } = i18n
  CsfSimpleAlert(t('message:notConnectedTitle'), t('message:notConnected'), {
    type: 'error',
  })
}

const MgaBadConnectionCard: React.FC<MgaBadConnectionCardProps> = ({
  onCancel,
  onRetry,
  ...cardProps
}) => {
  const { t } = useTranslation()
  // Adding hardcoded English as fallback since this can show before languages are downloaded.
  const notConnectedTitle = t('message:notConnectedTitle', {
    defaultValue: 'Bad Connection',
  })
  const notConnected = t('message:notConnected', {
    defaultValue:
      "Uh oh, you don't have a connection right now. Try switching to Wi-Fi or moving to an area with clearer reception, if you haven't already.",
  })
  const retry = t('common:retry', {
    defaultValue: 'Retry',
  })
  const cancel = t('common:cancel', {
    defaultValue: 'Cancel',
  })
  return (
    <CsfCard gap={16} {...cardProps}>
      <CsfView gap={4}>
        <CsfText {...csfLayoutTitleTextDefaultProps}>
          {notConnectedTitle}
        </CsfText>
        <CsfText {...csfLayoutSubtitleTextDefaultProps}>{notConnected}</CsfText>
      </CsfView>
      {onRetry && <CsfButton title={retry} onPress={onRetry} />}
      {onCancel && (
        <CsfButton title={cancel} variant="secondary" onPress={onCancel} />
      )}
    </CsfCard>
  )
}


export default MgaBadConnectionCard