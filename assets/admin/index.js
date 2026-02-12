// @flow
import {fieldRegistry} from 'sulu-admin-bundle/containers/Form';
import {formToolbarActionRegistry} from 'sulu-admin-bundle/views/Form';

import withTranslatorButton from './components/TranslatorButton/withTranslatorButton';
import TranslatorToolbarAction from './views/TranslatorToolbarAction';

import './translator.css';

/**
 * SuluTranslatorBundle admin entry point.
 *
 * Wraps the default Sulu text field types (text_line, text_area, text_editor)
 * with a HOC that adds a DeepL translation button overlay.
 * Also registers the bulk translate toolbar action.
 */

// Retrieve the original field components from the registry
const OriginalTextLine = fieldRegistry.get('text_line');
const OriginalTextArea = fieldRegistry.get('text_area');
const OriginalTextEditor = fieldRegistry.get('text_editor');

// Override field types with translator-enhanced versions
if (OriginalTextLine) {
    fieldRegistry.add('text_line', withTranslatorButton(OriginalTextLine));
}

if (OriginalTextArea) {
    fieldRegistry.add('text_area', withTranslatorButton(OriginalTextArea));
}

if (OriginalTextEditor) {
    fieldRegistry.add('text_editor', withTranslatorButton(OriginalTextEditor));
}

// Register the bulk translate toolbar action
formToolbarActionRegistry.add('itech_world.translator.bulk_translate', TranslatorToolbarAction);
