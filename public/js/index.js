// @flow
import {fieldRegistry} from 'sulu-admin-bundle/containers/Form';
import {formToolbarActionRegistry} from 'sulu-admin-bundle/views/Form';
import {viewRegistry} from 'sulu-admin-bundle/containers/ViewRenderer';
import initializer from 'sulu-admin-bundle/services/initializer';

import withTranslatorButton from './components/TranslatorButton/withTranslatorButton';
import TranslatorToolbarAction from './views/TranslatorToolbarAction';
import TranslatorConfig from './views/TranslatorConfig';

import './translator.css';

/**
 * SuluTranslatorBundle admin entry point.
 *
 * Wraps the default Sulu text field types (text_line, text_area, text_editor)
 * with a HOC that adds a DeepL translation button overlay.
 * Also registers the bulk translate toolbar action.
 *
 * Uses addUpdateConfigHook to defer field registration until after Sulu
 * has registered its default field types in the fieldRegistry.
 */

// Register the bulk translate toolbar action (safe at import time)
formToolbarActionRegistry.add('itech_world.translator.bulk_translate', TranslatorToolbarAction);

// Register the DeepL usage statistics settings view
viewRegistry.add('itech_world.translator.config', TranslatorConfig);

// Defer field type overrides until Sulu has initialized its field registry
initializer.addUpdateConfigHook('sulu_admin', (config, initialized) => {
    if (initialized) {
        return;
    }

    // Plain text fields: DeepL will not use HTML tag handling
    const plainTextFields = ['text_line', 'text_area'];
    // HTML fields: DeepL will use tag_handling=html to preserve markup
    const htmlFields = ['text_editor'];

    plainTextFields.forEach((fieldType) => {
        if (fieldRegistry.has(fieldType)) {
            const OriginalComponent = fieldRegistry.get(fieldType);
            fieldRegistry.fields[fieldType] = withTranslatorButton(OriginalComponent, false);
        }
    });

    htmlFields.forEach((fieldType) => {
        if (fieldRegistry.has(fieldType)) {
            const OriginalComponent = fieldRegistry.get(fieldType);
            fieldRegistry.fields[fieldType] = withTranslatorButton(OriginalComponent, true);
        }
    });
});
