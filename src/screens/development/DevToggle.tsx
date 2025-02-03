import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfToggle from '../../components/CsfToggle';
import { CsfSegmentTabBar } from '../../components/CsfSegmentTabBar';
import CsfText from '../../components/CsfText';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import CsfTile from '../../components/CsfTile';
import { CsfRadioButton } from '../../components/CsfRadioButton';

const toggles = 'Toggles';
const checkboxes = 'Checkboxes';
const radioButtons = 'Radio Buttons';

/**
 * Demo screen for Toggles / Checkboxes / Radio Buttons
 *
 * MCL, December 21, 2023, Page 10
 **/
const DevToggle: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(toggles);
  const [editable, setEditable] = useState(true);
  const statusText = editable ? '<b>active</b>' : '<b>inactive</b>';
  return (
    <MgaPage title={t('internalDevelopment:toggle')} bg="background">
      <CsfView edgeInsets>
        <CsfToggle
          label={'Editable'}
          checked={editable}
          onChangeValue={setEditable}
        />
      </CsfView>
      <CsfSegmentTabBar
        options={[
          { label: toggles, value: toggles },
          {
            label: checkboxes,
            value: checkboxes,
          },
          {
            label: radioButtons,
            value: radioButtons,
          },
        ]}
        value={tab}
        onSelect={setTab}
      />
      <CsfView edgeInsets standardSpacing>
        {tab == toggles && (
          <CsfView standardSpacing>
            <CsfToggle inline checked={false} editable={editable} />
            <CsfToggle inline checked={true} editable={editable} />
            <CsfToggle
              inline
              checked={false}
              small={true}
              editable={editable}
            />
            <CsfToggle inline checked={true} small={true} editable={editable} />
            <CsfText variant="subheading">With Label</CsfText>
            <CsfToggle
              inline
              checked={false}
              label={`This is ${statusText} "off" toggle`}
              editable={editable}
            />
            <CsfToggle
              inline
              checked={true}
              label={`This is ${statusText} "on" toggle`}
              editable={editable}
            />
            <CsfToggle
              inline
              checked={false}
              label={`This is ${statusText} "off" small toggle`}
              small={true}
              editable={editable}
            />
            <CsfToggle
              inline
              checked={true}
              label={`This is ${statusText} "on" small toggle`}
              small={true}
              editable={editable}
            />
            <CsfText variant="subheading">With Long Label</CsfText>
            <CsfToggle
              inline
              checked={false}
              label={`This is an ${statusText} "off" toggle with longer wrapping label`}
              editable={editable}
            />
            <CsfToggle
              inline
              checked={true}
              label={`This is an ${statusText} "on" toggle with longer wrapping label`}
              editable={editable}
            />
            <CsfToggle
              inline
              checked={false}
              label={`This is an ${statusText} "off" small toggle with longer wrapping label`}
              small={true}
              editable={editable}
            />
            <CsfToggle
              inline
              checked={true}
              label={`This is an ${statusText} "on" small toggle with longer wrapping label`}
              small={true}
              editable={editable}
            />
          </CsfView>
        )}
        {tab == checkboxes && (
          <CsfView standardSpacing>
            <CsfCheckBox inline checked={false} editable={editable} />
            <CsfCheckBox inline checked={true} editable={editable} />
            <CsfText variant="subheading">With Label</CsfText>
            <CsfCheckBox
              inline
              checked={false}
              label={`This is an ${statusText} "off" checkbox`}
              editable={editable}
            />
            <CsfCheckBox
              inline
              checked={true}
              label={`This is an ${statusText} "on" checkbox`}
              editable={editable}
            />
            <CsfText variant="subheading">With Long Label</CsfText>
            <CsfCheckBox
              inline
              checked={false}
              label={`This is an ${statusText} "off" checkbox with longer wrapping label`}
              editable={editable}
            />
            <CsfCheckBox
              inline
              checked={true}
              label={`This is an ${statusText} "on" checkbox with longer wrapping label`}
              editable={editable}
            />
            <CsfText variant="subheading">Stacked</CsfText>
            <CsfView flexDirection="row" standardSpacing>
              <CsfTile standardSpacing>
                <CsfCheckBox
                  inline
                  checked={false}
                  label={'14pt Text'}
                  editable={editable}
                  flexDirection="column"
                />
                <CsfCheckBox
                  inline
                  checked={true}
                  label={'14pt Text'}
                  editable={editable}
                  flexDirection="column"
                />
              </CsfTile>
              <CsfTile standardSpacing>
                <CsfCheckBox
                  inline
                  checked={false}
                  label={'14pt Text'}
                  editable={editable}
                  flexDirection="column-reverse"
                />
                <CsfCheckBox
                  inline
                  checked={true}
                  label={'14pt Text'}
                  editable={editable}
                  flexDirection="column-reverse"
                />
              </CsfTile>
            </CsfView>
          </CsfView>
        )}
        {tab == radioButtons && (
          <CsfView standardSpacing>
            <CsfRadioButton
              inline
              value={'OFF'}
              selected={'ON'}
              disabled={!editable}
            />
            <CsfRadioButton value={'ON'} selected={'ON'} disabled={!editable} />
            <CsfText variant="subheading">With Label</CsfText>
            <CsfRadioButton
              inline
              value={'OFF'}
              selected={'ON'}
              label={`This is an ${statusText} "off" radio button`}
              disabled={!editable}
            />
            <CsfRadioButton
              inline
              value={'ON'}
              selected={'ON'}
              label={`This is an ${statusText} "on" radio button`}
              disabled={!editable}
            />
            <CsfText variant="subheading">With Long Label</CsfText>
            <CsfRadioButton
              inline
              value={'OFF'}
              selected={'ON'}
              label={`This is an ${statusText} "off" radio button with longer wrapping label`}
              disabled={!editable}
            />
            <CsfRadioButton
              inline
              value={'ON'}
              selected={'ON'}
              label={`This is an ${statusText} "on" radio button with longer wrapping label`}
              disabled={!editable}
            />
            <CsfText variant="subheading">Stacked</CsfText>
            <CsfView flexDirection="row" standardSpacing>
              <CsfTile standardSpacing>
                <CsfRadioButton
                  inline
                  value={'OFF'}
                  selected={'ON'}
                  label={'14pt Text'}
                  disabled={!editable}
                  flexDirection="column"
                />
                <CsfRadioButton
                  inline
                  value={'ON'}
                  selected={'ON'}
                  label={'14pt Text'}
                  disabled={!editable}
                  flexDirection="column"
                />
              </CsfTile>
              <CsfTile standardSpacing>
                <CsfRadioButton
                  inline
                  value={'OFF'}
                  selected={'ON'}
                  label={'14pt Text'}
                  disabled={!editable}
                  flexDirection="column-reverse"
                />
                <CsfRadioButton
                  inline
                  value={'ON'}
                  selected={'ON'}
                  label={'14pt Text'}
                  disabled={!editable}
                  flexDirection="column-reverse"
                />
              </CsfTile>
            </CsfView>
          </CsfView>
        )}
      </CsfView>
    </MgaPage>
  );
};

export default DevToggle;
