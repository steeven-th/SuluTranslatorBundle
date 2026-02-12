// @flow
import React from 'react';
import {action, observable} from 'mobx';
import {observer} from 'mobx-react';
import {Requester} from 'sulu-admin-bundle/services';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import Loader from 'sulu-admin-bundle/components/Loader';

/**
 * Settings view displaying DeepL API usage statistics.
 *
 * Shows a progress bar with current character usage versus the plan limit,
 * along with a refresh button and link to the DeepL dashboard.
 */
@observer
class TranslatorConfig extends React.Component<any> {
    @observable _characterCount = 0;
    @observable _characterLimit = 0;
    @observable _loading = true;
    @observable _error = null;

    componentDidMount() {
        this._loadUsage();
    }

    /**
     * Fetches the current DeepL API usage from the backend.
     */
    @action _loadUsage = () => {
        this._loading = true;
        this._error = null;

        Requester.get('/admin/api/translator/usage')
            .then(action((response) => {
                this._characterCount = response.character_count || 0;
                this._characterLimit = response.character_limit || 0;
                this._loading = false;
            }))
            .catch(action((error) => {
                console.error('[SuluTranslator] Failed to load usage:', error);
                this._error = error.message || 'Unknown error';
                this._loading = false;
            }));
    };

    render() {
        if (this._loading) {
            return (
                <div style={{padding: '40px', textAlign: 'center'}}>
                    <Loader />
                </div>
            );
        }

        if (this._error) {
            return (
                <div style={{padding: '40px', textAlign: 'center', color: '#c0392b'}}>
                    <p>{this._error}</p>
                    <button onClick={this._loadUsage} type="button" style={styles.refreshButton}>
                        {translate('itech_world.translator.refresh')}
                    </button>
                </div>
            );
        }

        const percentage = this._characterLimit > 0
            ? Math.round((this._characterCount / this._characterLimit) * 100)
            : 0;

        const usageText = translate('itech_world.translator.usage_text')
            .replace('{characterCount}', this._characterCount.toLocaleString())
            .replace('{characterLimit}', this._characterLimit.toLocaleString());

        return (
            <div style={styles.container}>
                <h2 style={styles.title}>
                    {translate('itech_world.translator.config_title')}
                </h2>

                <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: percentage > 90 ? '#c0392b' : percentage > 70 ? '#f39c12' : '#27ae60',
                            }}
                        />
                    </div>
                    <p style={styles.usageText}>
                        {usageText} ({percentage}%)
                    </p>
                </div>

                <div style={styles.actions}>
                    <button onClick={this._loadUsage} type="button" style={styles.refreshButton}>
                        {translate('itech_world.translator.refresh')}
                    </button>
                    <a
                        href="https://www.deepl.com/account/usage"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.dashboardLink}
                    >
                        {translate('itech_world.translator.deepl_dashboard')}
                    </a>
                </div>
            </div>
        );
    }
}

const styles = {
    container: {
        padding: '40px',
        maxWidth: '600px',
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '24px',
        color: '#333',
    },
    progressContainer: {
        marginBottom: '24px',
    },
    progressBar: {
        width: '100%',
        height: '12px',
        backgroundColor: '#e0e0e0',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '6px',
        transition: 'width 0.5s ease, background-color 0.5s ease',
    },
    usageText: {
        marginTop: '8px',
        fontSize: '14px',
        color: '#666',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },
    refreshButton: {
        padding: '8px 16px',
        backgroundColor: '#52b6ca',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    dashboardLink: {
        fontSize: '14px',
        color: '#52b6ca',
        textDecoration: 'none',
    },
};

// Sulu view registration requires a static type property
TranslatorConfig.type = 'itech_world.translator.config';

export default TranslatorConfig;
