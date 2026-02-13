// @flow
import {action, observable, computed} from 'mobx';

/**
 * MobX store managing the bulk translation queue.
 *
 * Tracks translation progress when the user triggers a "Translate all" action.
 * Individual field components register themselves and report completion.
 */
class TranslatorQueueStore {
    @observable _bulkTranslateInProgress = false;
    @observable _totalItems = 0;
    @observable _completedItems = 0;

    /**
     * Whether a bulk translation is currently in progress.
     */
    @computed get bulkTranslateInProgress(): boolean {
        return this._bulkTranslateInProgress;
    }

    /**
     * Total number of fields to translate in the current bulk operation.
     */
    @computed get totalItemsLength(): number {
        return this._totalItems;
    }

    /**
     * Number of fields that have completed translation.
     */
    @computed get completedItemsLength(): number {
        return this._completedItems;
    }

    /**
     * Starts a bulk translation operation.
     *
     * @param {boolean} inProgress Whether bulk translation is active
     */
    @action setBulkTranslateInProgress(inProgress: boolean) {
        this._bulkTranslateInProgress = inProgress;

        if (!inProgress) {
            this._totalItems = 0;
            this._completedItems = 0;
        }
    }

    /**
     * Registers a field as part of the current bulk translation queue.
     */
    @action addActiveQueueItem() {
        this._totalItems += 1;
    }

    /**
     * Marks a field as completed in the bulk translation queue.
     * Automatically ends the bulk operation when all items are done.
     */
    @action removeActiveQueueItem() {
        this._completedItems += 1;

        if (this._completedItems >= this._totalItems) {
            this._bulkTranslateInProgress = false;
            this._totalItems = 0;
            this._completedItems = 0;
        }
    }

    /**
     * Resets the queue to its initial state.
     */
    @action resetQueue() {
        this._bulkTranslateInProgress = false;
        this._totalItems = 0;
        this._completedItems = 0;
    }
}

export default new TranslatorQueueStore();
