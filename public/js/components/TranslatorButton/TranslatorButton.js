// @flow
import React from 'react';
import {observer} from 'mobx-react';
// mobx observer is used via the @observer decorator
import {translate} from 'sulu-admin-bundle/utils/Translator';
import Icon from 'sulu-admin-bundle/components/Icon';
import Loader from 'sulu-admin-bundle/components/Loader';
import '../../translator.css';

type Props = {
    onClick: () => void,
    onUndo: () => void,
    loading: boolean,
    hasTranslation: boolean,
    disabled: boolean,
};

/**
 * Translation button component displayed on translatable fields.
 *
 * Shows a translate icon by default, a spinner during translation,
 * and after translation: a green checkmark + a red undo button side by side.
 */
@observer
class TranslatorButton extends React.Component<Props> {
    static defaultProps = {
        loading: false,
        hasTranslation: false,
        disabled: false,
    };

    render() {
        const {onClick, onUndo, loading, hasTranslation, disabled} = this.props;

        if (loading) {
            return (
                <div className="translator-button translator-button--loading" title={translate('itech_world.translator.translate_field')}>
                    <Loader size={16} />
                </div>
            );
        }

        if (hasTranslation) {
            return (
                <div className="translator-button-group">
                    <div
                        className="translator-button translator-button--success"
                        title={translate('itech_world.translator.translate_field')}
                    >
                        <Icon name="su-check" />
                    </div>
                    <button
                        className="translator-button translator-button--undo"
                        onClick={onUndo}
                        title={translate('itech_world.translator.undo_translation')}
                        type="button"
                    >
                        <Icon name="su-process" />
                    </button>
                </div>
            );
        }

        return (
            <button
                className="translator-button translator-button--default"
                onClick={onClick}
                disabled={disabled}
                title={translate('itech_world.translator.translate_field')}
                type="button"
            >
                <Icon name="su-language" />
            </button>
        );
    }
}

export default TranslatorButton;
