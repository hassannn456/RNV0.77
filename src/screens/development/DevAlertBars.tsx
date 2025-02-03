/* eslint-disable eol-last */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import CsfCard from '../../components/CsfCard';
import CsfButton from '../../components/CsfButton';
import { errorNotice, infoNotice, successNotice, warningNotice } from '../../components/notice';
import CsfStatusBar, { CsfAlertBar } from '../../components/CsfAlertBar';
import CsfAppIcon from '../../components/CsfAppIcon';
import CsfInfoButton from '../../components/CsfInfoButton';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';

const DevAlertBars: React.FC = () => {
  const { t } = useTranslation();
  return (
    <MgaPage
      title={t('internalDevelopment:alertBars')}
      trackingId={'dev-controls'}
      bg="background">
      <CsfView p={16} gap={16}>
        <CsfText variant="title2">CsfAlertBar</CsfText>
        <CsfCard title="Alert Bars" gap={16}>
          <CsfButton
            title="Success Notice"
            onPress={() =>
              successNotice({
                noticeKey: 'IDSuccess',
                title: 'title',
                subtitle: 'subtitle',
              })
            }
          />
          <CsfButton
            title="Warning Notice"
            onPress={() =>
              warningNotice({
                noticeKey: 'IDWarning',
                title: 'title',
                subtitle: 'subtitle',
              })
            }
          />

          <CsfButton
            title="Error Notice"
            onPress={() =>
              errorNotice({
                noticeKey: 'IDError',
                title: 'title',
                subtitle: 'subtitle',
              })
            }
          />

          <CsfButton
            title="Information Notice"
            onPress={() =>
              infoNotice({
                noticeKey: 'IDInfo',
                title: 'title',
                subtitle: 'subtitle',
              })
            }
          />
        </CsfCard>

        <CsfCard title="Inline Examples" gap={16}>
          <CsfAlertBar title="Just a Title" flat />
          <CsfAlertBar
            title="Title and Message"
            subtitle="Here is the message."
            type="error"
            flat
          />
          <CsfAlertBar
            icon={<CsfAppIcon icon="Faceid" color="success" />}
            subtitle="Just a message with a custom icon"
            type="success"
            flat
          />
          <CsfAlertBar
            icon={<CsfAppIcon icon="AirbagSystem" color="warning" />}
            title="Title, Subtitle, Action, Icon!"
            subtitle="It's getting crowded in here."
            type="warning"
            action={<CsfButton size="sm" variant="inlineLink" title="View" />}
            flat
          />

          <CsfStatusBar
            title="Title, Subtitle, and Action"
            subtitle="It's getting crowded in here."
            type="warning"
            action={<CsfButton size="sm" variant="inlineLink" title="Action" />}
            flat
          />
        </CsfCard>

        <CsfCard>
          <CsfText>Info Button</CsfText>
          <CsfInfoButton title="title" text="some text" />

          <CsfText>With Actions</CsfText>
          <CsfInfoButton
            title="title"
            text="some text"
            actions={[{ title: 'action 1', type: 'secondary' }]}
            handlePrompt={(v: string) => {
              console.log(v);
            }}
          />
        </CsfCard>

        <CsfCard title="Alerts and Prompts" gap={16}>
          <CsfText>Alert</CsfText>
          <CsfButton
            onPress={() =>
              CsfSimpleAlert('Simple ERROR', 'Alert Message', {
                type: 'error',
              })
            }
            title="Error Alert"
          />
          <CsfButton
            onPress={() =>
              CsfSimpleAlert('Simple INFORMATION', 'Alert Message', {
                type: 'information',
              })
            }
            title="Info Alert"
          />
          <CsfButton
            onPress={() =>
              CsfSimpleAlert('Simple WARNING/ALERT', 'Alert Message', {
                type: 'warning',
              })
            }
            title="Warning Alert"
          />
          <CsfButton
            onPress={() =>
              CsfSimpleAlert('Simple SUCCESS', 'Alert Message', {
                type: 'success',
              })
            }
            title="Success Alert"
          />

          <CsfButton
            onPress={() =>
              CsfSimpleAlert(
                'Simple alert with a pretty long title',
                'Alert Message can also be pretty long.',
              )
            }
            title="Open Alert with Long Title"
          />
        </CsfCard>
      </CsfView>
    </MgaPage>
  );
};


export default DevAlertBars;