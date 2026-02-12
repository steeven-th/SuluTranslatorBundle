<?php

declare(strict_types=1);

namespace ItechWorld\SuluTranslatorBundle\Admin;

use Sulu\Bundle\AdminBundle\Admin\Admin;
use Sulu\Bundle\AdminBundle\Admin\View\ViewBuilderFactoryInterface;
use Sulu\Bundle\AdminBundle\Admin\View\ViewCollection;
use Sulu\Bundle\AdminBundle\Admin\View\ToolbarAction;

/**
 * Registers the translator toolbar actions and admin views in Sulu.
 *
 * Adds a "Translate all" bulk action to the page and article edit forms,
 * and registers a settings view for DeepL usage statistics.
 */
class TranslatorAdmin extends Admin
{
    public const PAGE_EDIT_VIEW = 'sulu_page.page_edit_form.content';

    /**
     * @param ViewBuilderFactoryInterface $viewBuilderFactory The Sulu view builder factory
     */
    public function __construct(
        private ViewBuilderFactoryInterface $viewBuilderFactory,
    ) {}

    /**
     * Configures the Sulu admin views for the translator bundle.
     *
     * Adds the bulk translate toolbar action to the page edit form.
     * If the article bundle is installed, also adds it to the article edit form.
     *
     * @param ViewCollection $viewCollection The view collection to configure
     */
    public function configureViews(ViewCollection $viewCollection): void
    {
        // Add toolbar action to page edit form
        if ($viewCollection->has(self::PAGE_EDIT_VIEW)) {
            $pageView = $viewCollection->get(self::PAGE_EDIT_VIEW);
            $existingToolbarActions = $pageView->getView()->getOption('toolbarActions') ?? [];

            $existingToolbarActions[] = new ToolbarAction(
                'itech_world.translator.bulk_translate'
            );

            $pageView->setOption('toolbarActions', $existingToolbarActions);
            $viewCollection->add($pageView);
        }

        // Add toolbar action to article edit form (if sulu_article bundle is installed)
        $articleView = 'sulu_article.edit_form.details';
        if ($viewCollection->has($articleView)) {
            $articleEditView = $viewCollection->get($articleView);
            $existingArticleToolbarActions = $articleEditView->getView()->getOption('toolbarActions') ?? [];

            $existingArticleToolbarActions[] = new ToolbarAction(
                'itech_world.translator.bulk_translate'
            );

            $articleEditView->setOption('toolbarActions', $existingArticleToolbarActions);
            $viewCollection->add($articleEditView);
        }
    }
}
