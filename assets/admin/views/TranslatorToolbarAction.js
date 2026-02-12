// @flow
import React from 'react';
import {action, observable} from 'mobx';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import AbstractFormToolbarAction from 'sulu-admin-bundle/views/Form/toolbarActions/AbstractFormToolbarAction';
import {Dialog} from 'sulu-admin-bundle/components';
import translatorQueueStore from '../stores/translatorQueueStore';

/**
 * Toolbar action for the "Translate all" bulk translation feature.
 *
 * Adds a button to the Sulu form toolbar that triggers translation
 * of all translatable fields at once. Shows a confirmation dialog
 * before starting the bulk operation.
 */
export default class TranslatorToolbarAction extends AbstractFormToolbarAction {
    @observable _showDialog = false;

    /**
     * Returns the toolbar button configuration.
     *
     * @returns {Object} Toolbar item config with icon, label, and click handler
     */
    getToolbarItemConfig() {
        return {
            icon: 'su-language',
            label: translate('itech_world.translator.bulk_translate'),
            onClick: action(() => {
                this._showDialog = true;
            }),
            type: 'button',
            disabled: translatorQueueStore.bulkTranslateInProgress,
        };
    }

    /**
     * Returns a React node rendered in the toolbar area.
     *
     * Renders the confirmation dialog and progress indicator.
     *
     * @returns {React.Node|null} The dialog element or null
     */
    getNode() {
        return (
            <Dialog
                cancelText={translate('sulu_admin.cancel')}
                confirmText={translate('itech_world.translator.bulk_translate')}
                onCancel={action(() => {
                    this._showDialog = false;
                })}
                onConfirm={action(() => {
                    this._showDialog = false;
                    translatorQueueStore.setBulkTranslateInProgress(true);
                })}
                open={this._showDialog}
                title={translate('itech_world.translator.bulk_dialog_title')}
            >
                {translate('itech_world.translator.bulk_dialog_text')}
            </Dialog>
        );
    }

    destroy() {
        translatorQueueStore.resetQueue();
    }
}
