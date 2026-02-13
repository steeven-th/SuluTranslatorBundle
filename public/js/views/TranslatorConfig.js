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
 * Shows account type (Free/Pro), billing period dates (Pro only),
 * a progress bar with current character usage versus the plan limit,
 * along with a refresh button and link to the DeepL dashboard.
 */
@observer
class TranslatorConfig extends React.Component<any> {
    @observable _characterCount = 0;
    @observable _characterLimit = 0;
    @observable _accountType = null;
    @observable _startTime = null;
    @observable _endTime = null;
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
                this._accountType = response.account_type || null;
                this._startTime = response.start_time || null;
                this._endTime = response.end_time || null;
                this._loading = false;
            }))
            .catch(action((error) => {
                console.error('[SuluTranslator] Failed to load usage:', error);
                this._error = error.message || 'Unknown error';
                this._loading = false;
            }));
    };

    /**
     * Formats an ISO 8601 date string to a localized date.
     */
    _formatDate = (isoString: ?string): string => {
        if (!isoString) {
            return '—';
        }

        try {
            const date = new Date(isoString);

            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            return isoString;
        }
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
                <div style={{padding: '40px', textAlign: 'center', color: '#cf3939'}}>
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

        const usageText = translate('itech_world.translator.usage_text', {
            characterCount: this._characterCount.toLocaleString(),
            characterLimit: this._characterLimit.toLocaleString(),
        });

        const accountLabel = this._accountType === 'free'
            ? translate('itech_world.translator.account_free')
            : translate('itech_world.translator.account_pro');

        const accountBadgeStyle = this._accountType === 'free'
            ? styles.badgeFree
            : styles.badgePro;

        return (
            <div style={styles.container}>
                <h2 style={styles.title}>
                    {translate('itech_world.translator.config_title')}
                </h2>

                {/* Account type badge */}
                {this._accountType && (
                    <div style={styles.accountRow}>
                        <span style={styles.label}>
                            {translate('itech_world.translator.account_type')}
                        </span>
                        <span style={accountBadgeStyle}>
                            {accountLabel}
                        </span>
                    </div>
                )}

                {/* Billing period (Pro accounts only) */}
                {this._startTime && this._endTime && (
                    <div style={styles.periodRow}>
                        <span style={styles.label}>
                            {translate('itech_world.translator.billing_period')}
                        </span>
                        <span style={styles.periodValue}>
                            {this._formatDate(this._startTime)} — {this._formatDate(this._endTime)}
                        </span>
                    </div>
                )}

                {/* Usage progress bar */}
                <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: percentage > 90 ? '#cf3939' : percentage > 70 ? '#f8d200' : '#6ac86b',
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
    accountRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
    },
    periodRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    label: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500',
    },
    periodValue: {
        fontSize: '14px',
        color: '#333',
    },
    badgeFree: {
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        backgroundColor: '#e0e0e0',
        color: '#555',
    },
    badgePro: {
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        backgroundColor: '#52b6ca',
        color: '#fff',
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
