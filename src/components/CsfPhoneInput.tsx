/* eslint-disable react/react-in-jsx-scope */
import { formatPhone } from '../utils/phone';
import CsfTextInput, { SharedTextInputProps } from './CsfTextInput';

const CsfPhoneInput: React.FC<SharedTextInputProps> = ({
    value,
    ...props
}) => {
    return (
        <CsfTextInput
            keyboardType="numeric"
            value={value ? formatPhone(value) : ''}
            maxLength={16}
            {...props}
        />
    );
};

export default CsfPhoneInput;
