/* eslint-disable eol-last */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CsfButton, { CsfButtonType, CsfButtonSize } from '../../components/CsfButton';
import { CsfCheckboxGroup } from '../../components/CsfCheckboxGroup';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfCard from '../../components/CsfCard';

const buttonTypes: Array<CsfButtonType> = ['primary', 'secondary', 'link'];
const buttonSizes: Array<CsfButtonSize> = ['md'];
const CsfDevButtons: React.FC = () => {
  const { t } = useTranslation();

  const [buttonProps, setButtonProps] = useState([]);
  const [buttonState, setButtonState] = useState([]);
  return (
    <MgaPage
      title={t('internalDevelopment:buttons')}
      trackingId={'dev-controls'}
      bg="background">
      <CsfView key="Buttons" p={16} gap={16}>
        <CsfCheckboxGroup
          label="internalDevelopment:buttonProps"
          options={[
            { label: 'Glyph', value: 'glyph' },
            { label: 'Icon End', value: 'iconEnd' },
            { label: 'Destructive', value: 'destructive' },
            { label: 'Icon', value: 'icon' },
          ]}
          onChange={v => {
            setButtonProps(v);
          }}
          value={buttonProps}
        />
        <CsfCheckboxGroup
          label="internalDevelopment:buttonState"
          options={[
            { label: 'Loading', value: 'loading' },
            { label: 'Disabled', value: 'disabled' },
          ]}
          onChange={v => {
            setButtonState(v);
          }}
          value={buttonState}
        />

        {buttonTypes.map(type => (
          <CsfCard gap={16} title={`variant: ${type}`} key={type}>
            {buttonSizes.map(size => (
              <CsfButton
                key={`${type}-${size}`}
                isLoading={buttonState.includes('loading')}
                variant={type}
                icon={buttonProps.includes('icon') ? 'Abs' : undefined}
                onPress={() => console.log('clicked the button')}
                title={'Button:' + type}
                size={size}
                iconPosition={buttonProps.includes('iconEnd') ? 'end' : 'start'}
                destructive={buttonProps.includes('destructive')}
                enabled={!buttonState.includes('disabled')}
              />
            ))}
          </CsfCard>
        ))}
      </CsfView>

      {/* Buttons - End */}
    </MgaPage>
  );
};


export default CsfDevButtons;