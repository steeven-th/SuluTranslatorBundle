// @flow
import React from 'react';
import {observer} from 'mobx-react';
import {action, observable, reaction} from 'mobx';
import {Requester} from 'sulu-admin-bundle/services';
import TranslatorButton from './TranslatorButton';
import translatorQueueStore from '../../stores/translatorQueueStore';

/**
 * Higher-Order Component that wraps a Sulu form field component
 * to add a DeepL translation button.
 *
 * The HOC:
 * - Renders the original field component unchanged
 * - Overlays a translation button (top-right corner)
 * - Handles the API call to /admin/api/translator/translate
 * - Supports undo (restores previous value)
 * - Listens to the translatorQueueStore for bulk translate triggers
 *
 * @param {React.ComponentType} WrappedComponent The original Sulu field component
 * @returns {React.ComponentType} Enhanced component with translation button
 */
export default function withTranslatorButton(WrappedComponent: any, isHtml: boolean = false) {
    @observer
    class WithTranslatorButton extends React.Component<any> {
        @observable _loading = false;
        @observable _previousValue = null;
        @observable _hasTranslation = false;

        _bulkDisposer = null;

        componentDidMount() {
            // Listen for bulk translate trigger
            this._bulkDisposer = reaction(
                () => translatorQueueStore.bulkTranslateInProgress,
                (inProgress) => {
                    if (inProgress && this._canTranslate()) {
                        translatorQueueStore.addActiveQueueItem();
                        this._handleTranslate(true);
                    }
                }
            );
        }

        componentWillUnmount() {
            if (this._bulkDisposer) {
                this._bulkDisposer();
            }
        }

        /**
         * Checks if the field has translatable content.
         */
        _canTranslate() {
            const {value} = this.props;
            return value !== undefined && value !== null && value !== '';
        }

        /**
         * Returns the current locale from the form inspector.
         */
        _getTargetLocale() {
            const {formInspector} = this.props;
            return formInspector?.locale?.get?.() || formInspector?.locale || null;
        }

        /**
         * Sends the field value to the translation API and updates the field.
         *
         * @param {boolean} isBulk Whether this is part of a bulk translate operation
         */
        @action _handleTranslate = (isBulk: boolean = false) => {
            const {value, onChange, onFinish} = this.props;
            const locale = this._getTargetLocale();

            if (!value || !locale) {
                if (isBulk) {
                    translatorQueueStore.removeActiveQueueItem();
                }
                return;
            }

            this._loading = true;
            this._previousValue = value;

            Requester.post('/admin/api/translator/translate', {
                text: value,
                target: locale,
                html: isHtml,
            }).then(action((response) => {
                if (response.translation) {
                    onChange(response.translation);
                    if (onFinish) {
                        onFinish();
                    }
                    this._hasTranslation = true;
                }
                this._loading = false;

                if (isBulk) {
                    translatorQueueStore.removeActiveQueueItem();
                }
            })).catch(action((error) => {
                console.error('[SuluTranslator] Translation failed:', error);
                this._loading = false;

                if (isBulk) {
                    translatorQueueStore.removeActiveQueueItem();
                }
            }));
        };

        /**
         * Restores the field value to its state before translation.
         */
        @action _handleUndo = () => {
            const {onChange, onFinish} = this.props;

            if (this._previousValue !== null) {
                onChange(this._previousValue);
                if (onFinish) {
                    onFinish();
                }
                this._previousValue = null;
                this._hasTranslation = false;
            }
        };

        render() {
            const {value} = this.props;
            const hasContent = value !== undefined && value !== null && value !== '';
            const locale = this._getTargetLocale();

            const wrapperClass = 'translator-field-wrapper'
                + (isHtml ? ' translator-field-wrapper--editor' : '');

            return (
                <div className={wrapperClass}>
                    <WrappedComponent {...this.props} />
                    {hasContent && locale && (
                        <TranslatorButton
                            onClick={() => this._handleTranslate(false)}
                            onUndo={this._handleUndo}
                            loading={this._loading}
                            hasTranslation={this._hasTranslation}
                            disabled={!hasContent}
                        />
                    )}
                </div>
            );
        }
    }

    WithTranslatorButton.displayName = `withTranslatorButton(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return WithTranslatorButton;
}
